import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { Button, Form, Icon, Input, Card, Collapse, Switch, Checkbox, Row, Col, Table, Tooltip, message } from 'antd';
import { routerShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import { loadTenantModules, updateRole } from 'common/reducers/role';
import { PRESET_ROLE_NAME_KEYS } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const { Panel } = Collapse;
const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { Column } = Table;

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
    type = 'text', labelName, required, placeholder, field, options,
  } = props;
  const { getFieldDecorator, ...fieldOptions } = options;
  const fieldInputProps = getFieldDecorator(field, fieldOptions);
  return (
    <FormItem label={labelName} required={required}>
      {fieldInputProps(<Input type={type} placeholder={placeholder} />)}
    </FormItem>
  );
}

FormInputItem.propTypes = {
  labelName: PropTypes.string.isRequired,
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
    formData: state.role.formData,
  }),
  { loadTenantModules, updateRole }
)
@Form.create()
export default class RolePrivilegesForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    mode: PropTypes.oneOf(['updateRole', 'create']).isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.shape({
      getFieldDecorator: PropTypes.func,
    }).isRequired,
    formData: PropTypes.shape({
      name: PropTypes.string,
      desc: PropTypes.string,
    }).isRequired,
    submitting: PropTypes.bool.isRequired,
    tenantModules: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  state = {
    editPrivilegeMap: {},
    bureauChecked: false,
  }
  componentWillMount() {
    this.props.loadTenantModules(this.props.tenantId);
    this.setState({ editPrivilegeMap: this.props.formData.privileges });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.formData.privileges !== this.props.formData.privileges) {
      this.setState({ editPrivilegeMap: nextProps.formData.privileges });
    }
    if (nextProps.formData.bureau !== this.props.formData.bureau) {
      this.setState({
        bureauChecked: !!nextProps.formData.bureau,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
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
          bureau: this.state.bureauChecked,
          tenantId: this.props.mode === 'create' ? this.props.tenantId : undefined,
        };
        this.props.updateRole(form).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success(this.gmsg('savedSuccess'));
          }
        });
      } else {
        this.forceUpdate();
      }
    });
  }
  handelBureauChange = (checked) => {
    this.setState({
      bureauChecked: checked,
    });
  }
  render() {
    const {
      formData: { name, desc }, tenantModules, intl,
      submitting, form: { getFieldDecorator },
    } = this.props;
    const { editPrivilegeMap: privileges, bureauChecked } = this.state;
    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <Card
          bodyStyle={{ padding: 0 }}
          extra={<Button htmlType="submit" type="primary" icon="save" loading={submitting}>{this.gmsg('save')}</Button>}
        >
          <Collapse accordion bordered={false} defaultActiveKey={['profile']}>
            <Panel header="角色信息" key="profile">
              <Card>
                <Row gutter={16}>
                  <Col span={16}>
                    <FormInputItem
                      labelName={formatMsg(intl, 'nameColumn')}
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
                            return callback();
                          },
                        }],
                        initialValue: name,
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <FormItem label={<span>
                      是否管理层&nbsp;<Tooltip title="What do you want others to call you?">
                        <Icon type="question-circle-o" />
                      </Tooltip></span>}
                    >
                      <Switch checked={bureauChecked} onChange={this.handelBureauChange} />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormInputItem
                      labelName={formatMsg(intl, 'descColumn')}
                      labelSpan={8}
                      field="desc"
                      options={{ getFieldDecorator, initialValue: desc }}
                    />
                  </Col>
                </Row>
              </Card>
            </Panel>
            {tenantModules.map(tnm => (
              <Panel header={`「${this.gmsg(tnm.text)}」权限`} key={tnm.text}>
                <Card bodyStyle={{ padding: 0 }}>
                  <Table size="small" dataSource={tnm.features} pagination={false}>
                    <Column
                      title={formatMsg(intl, 'featureName')}
                      dataIndex="text"
                      key="text"
                      width={200}
                    />
                    <Column
                      title={formatMsg(intl, 'allFull')}
                      dataIndex="allFull"
                      key="allFull"
                      width={100}
                      render={(o, feat) => (<Switch
                        size="small"
                        checked={isFullFeature(privileges, tnm.id, feat.id)}
                        onChange={checked => this.handleFeatureFullCheck(tnm.id, feat.id, checked)}
                      />)}
                    />
                    <Column
                      title={formatMsg(intl, 'actionName')}
                      key="action"
                      render={(o, feat) => (<CheckboxGroup
                        options={feat.actions.map(act => ({
                          label: this.gmsg(act.text),
                          value: act.id,
                        }))}
                        value={
                          getCheckedActions(privileges, tnm.id, feat.id, feat.actions)
                        }
                        onChange={checkeds => this.handleActionCheck(tnm.id, feat.id, checkeds)}
                      />)}
                    />
                  </Table>
                </Card>
              </Panel>))}
          </Collapse>
        </Card>
      </Form>
    );
  }
}
