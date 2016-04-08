import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Input, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/containers/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

const FormItem = Form.Item;

@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatMsg(props.intl, 'newTitle'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadTable })
@Form.formify({
  mapPropsToFields(props) {
    return props.formData
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.setFormValue(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class ShipmentList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  renderTextInput(labelName, placeholder, field, required, rules, fieldProps) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { formhoc/*, formhoc: { getFieldError, getFieldProps } */} = this.props;
    return (
      <div className="page-body">
        <Form form={formhoc} horizontal className="form-edit-content offset-right-col">
          <Col span="16">
            <Row>
              <div className="subpanel-heading">
                提货信息
              </div>
              <Col span="14">
                <div className="subpanel-body">
                {this.renderTextInput(
                  '发货方', '', 'sender'
                  // this.msg('chief'), this.msg('chiefPlaceholder'), 'contact',
                  true//, [{required: true, min: 2, message: formatMsg(intl, 'nameMessage')}]
                )}
                </div>
              </Col>
              <Col span="10">
              </Col>
            </Row>
          </Col>
        </Form>
      </div>
    );
  }
}
