import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { Button, Form, Input, Card, Collapse, Switch, Checkbox, Row, Col, message } from 'antd';
import { routerShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import { loadTenantModules } from 'common/reducers/role';
import { PRESET_ROLE_NAME_KEYS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import messages from '../message.i18n';

const { Panel } = Collapse;
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

function getCheckedActions(privileges, moduleId, featId, featActions) {
  if (!privileges[moduleId]) {
    return [];
  }
  if (privileges[moduleId] === true) {
    return featActions;
  }
  if (!privileges[moduleId][featId]) {
    return [];
  }
  if (privileges[moduleId][featId] === true) {
    return featActions;
  }
  return Object.keys(privileges[moduleId][featId]);
}

function isFullFeature(privileges, moduleId, featId) {
  if (!privileges[moduleId]) {
    return false;
  }
  if (privileges[moduleId] === true) {
    return true;
  }
  return privileges[moduleId][featId] === true;
}

function FormInputItem(props) {
  const {
    type = 'text', labelName, labelSpan, required, placeholder, field, options,
  } = props;
  const { getFieldDecorator, ...fieldOptions } = options;
  const fieldInputProps = getFieldDecorator(field, fieldOptions);
  return (
    <FormItem
      label={labelName}
      labelCol={{ span: labelSpan }}
      required={required}
      wrapperCol={{ span: 24 - labelSpan }}
    >
      {fieldInputProps(<Input type={type} placeholder={placeholder} />)}
    </FormItem>
  );
}

FormInputItem.propTypes = {
  labelName: PropTypes.string.isRequired,
  labelSpan: PropTypes.number.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  field: PropTypes.string,
  options: PropTypes.shape({
    getFieldDecorator: PropTypes.func.isRequired,
    rules: PropTypes.arrayOf(PropTypes.shape({
      required: PropTypes.bool,
      message: PropTypes.string,
    })),
    initialValue: PropTypes.string,
  }),
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    submitting: state.role.submitting,
    tenantModules: state.role.modules,
  }),
  { loadTenantModules }
)
@Form.create()
export default class RoleForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    mode: PropTypes.oneOf(['edit', 'new']).isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    tenantModules: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
    onSubmit: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    editPrivilegeMap: {},
  }
  componentWillMount() {
    this.props.loadTenantModules(this.props.tenantId);
    this.setState({ editPrivilegeMap: this.props.formData.privileges });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.privileges !== this.props.formData.privileges) {
      this.setState({ editPrivilegeMap: nextProps.formData.privileges });
    }
  }
  handleFeatureFullCheck(moduleId, featId, checked) {
    let state;
    if (checked) {
      if (this.state.editPrivilegeMap[moduleId]) {
        state = update(this.state, {
          editPrivilegeMap: { [moduleId]: { [featId]: { $set: true } } },
        });
      } else {
        state = update(this.state, {
          editPrivilegeMap: { [moduleId]: { $set: { [featId]: true } } },
        });
      }
    } else {
      // uncheck moduleId featId必然已存在
      state = update(this.state, {
        editPrivilegeMap: { [moduleId]: { [featId]: { $set: undefined } } },
      });
    }
    this.setState(state);
  }
  handleActionCheck(moduleId, featId, actions) {
    const actionObj = {};
    actions.forEach((act) => {
      actionObj[act] = true;
    });
    let state;
    if (this.state.editPrivilegeMap[moduleId]) {
      if (this.state.editPrivilegeMap[moduleId][featId]) {
        state = update(
          this.state,
          { editPrivilegeMap: { [moduleId]: { [featId]: { $set: actionObj } } } }
        );
      } else {
        state = update(
          this.state,
          { editPrivilegeMap: { [moduleId]: { $merge: { [featId]: actionObj } } } }
        );
      }
    } else {
      state = update(
        this.state,
        { editPrivilegeMap: { $merge: { [moduleId]: { [featId]: actionObj } } } }
      );
    }
    this.setState(state);
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const form = {
          ...this.props.formData,
          ...this.props.form.getFieldsValue(),
          privileges: this.state.editPrivilegeMap,
          tenantId: this.props.mode === 'new' ? this.props.tenantId : undefined,
        };
        this.props.onSubmit(form).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          }
        });
      } else {
        this.forceUpdate();
      }
    });
  }
  render() {
    const {
      formData: { name, desc }, tenantModules, intl,
      submitting, form: { getFieldDecorator },
    } = this.props;
    const { editPrivilegeMap: privileges } = this.state;
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse accordion bordered={false} defaultActiveKey={['profile']}>
            <Panel header="基本信息" key="profile">
              <FormInputItem
                labelName={formatMsg(intl, 'nameColumn')}
                labelSpan={8}
                field="name"
                options={{
                getFieldDecorator,
                rules: [{
                  required: true, min: 2, messages: formatMsg(intl, 'nameMessage'),
                }, {
                  validator(rule, value, callback) {
                    if (Object.keys(PRESET_ROLE_NAME_KEYS).filter(nk =>
                    nk.toUpperCase() === value.toUpperCase()).length > 0) {
                      return callback(new Error(formatMsg(intl, 'unallowDefaultName')));
                    }
                    callback();
                  },
                }],
                initialValue: name,
              }}
              />
              <FormInputItem
                labelName={formatMsg(intl, 'descColumn')}
                labelSpan={8}
                field="desc"
                options={{ getFieldDecorator, initialValue: desc }}
              />
              <FormItem label="属于管理层" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                {getFieldDecorator('bureau', { initialValue: false })(<Switch />)}
              </FormItem>
            </Panel>
            {tenantModules.map(tnm => (
              <Panel header={formatGlobalMsg(intl, tnm.text)} key={tnm.text}>

                <Row style={{ paddingBottom: 10 }}>
                  <Col span={4} offset={2}>
                    {formatMsg(intl, 'featureName')}
                  </Col>
                  <Col span={2} offset={2}>
                    {formatMsg(intl, 'allFull')}
                  </Col>
                  <Col span={12} offset={2}>
                    {formatMsg(intl, 'actionName')}
                  </Col>
                </Row>
                {tnm.features.map(feat => (
                  <Row key={feat.text} style={{ paddingBottom: 10 }}>
                    <Col span={4} offset={2}>
                      {formatGlobalMsg(intl, feat.text)}
                    </Col>
                    <Col span={2} offset={2}>
                      <Switch
                        size="small"
                        checked={isFullFeature(privileges, tnm.id, feat.id)}
                        onChange={checked => this.handleFeatureFullCheck(tnm.id, feat.id, checked)}
                      />
                    </Col>
                    <Col span={12} offset={2}>
                      <CheckboxGroup
                        options={feat.actions.map(act => ({
                                  label: formatGlobalMsg(intl, act.text),
                                  value: act.id,
                                }))}
                        value={
                                  getCheckedActions(privileges, tnm.id, feat.id, feat.actions)
                                }
                        onChange={checkeds => this.handleActionCheck(tnm.id, feat.id, checkeds)}
                      />
                    </Col>
                  </Row>
                        ))
                      }
              </Panel>

                ))}
          </Collapse>
        </Card>
        <Row>
          <Col span="18" offset="6">
            <Button htmlType="submit" type="primary" loading={submitting}>{formatGlobalMsg(intl, 'save')}</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
