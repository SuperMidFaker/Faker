import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Input, Select, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { setFormValue } from 'universal/redux/reducers/shipment';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/containers/message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const formatGlobalMsg = format(globalMessages);

const FormItem = Form.Item;
const Option = Select.Option;

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
    formData: state.shipment.formData,
    submitting: state.shipment.submitting,
  }),
  { setFormValue })
@Form.formify({
  mapPropsToFields(props) {
    return props.formData;
  },
  onFieldsChange(props, fields) {
    if (Object.keys(fields).length === 1) {
      const name = Object.keys(fields)[0];
      props.setFormValue(name, fields[name].value);
    }
  },
  formPropName: 'formhoc'
})
export default class ShipmentCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  renderTextInput(labelName, field, placeholder, required, rules, fieldProps) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: 6}} wrapperCol={{span: 18}}
        help={rules && getFieldError(field)} hasFeedback required={required}>
        <Input type="text" placeholder={placeholder} {...getFieldProps(field, {rules, ...fieldProps})} />
      </FormItem>
    );
  }
  render() {
    const { intl, formhoc, formhoc: { getFieldError, getFieldProps }} = this.props;
    return (
      <Form form={formhoc} horizontal className="form-edit-content offset-right-col">
        <Col span="16" className="subform">
          <Row>
            <div className="subform-heading">
            {this.msg('pickupInfo')}
            </div>
            <Col span="14" className="subform-body">
              <FormItem label={this.msg('consignor')} labelCol={{span: 6}} wrapperCol={{span: 18}}
                help={getFieldError('sender')} required
              >
                <Select defaultValue="aa" {...getFieldProps('sender', [{
                  required: true, message: this.msg('consigorMessage')
                }])}
                >
                  <Option value="aa">aa</Option>
                </Select>
              </FormItem>
              {this.renderTextInput(this.msg('loadingPort'), 'loadingPort')}
            </Col>
            <Col span="10" className="subform-body">
              {this.renderTextInput(
                this.msg('contact'), 'consignorContact'
              )}
            </Col>
          </Row>
          <Row>
            <div className="subform-heading">
            {this.msg('deliveryInfo')}
            </div>
            <Col span="14" className="subform-body">
              <FormItem label={this.msg('consignee')} labelCol={{span: 6}} wrapperCol={{span: 18}}
                help={getFieldError('consignee')} required
              >
                <Select defaultValue="aa" {...getFieldProps('consignee', [{
                  required: true, message: this.msg('consigeeMessage')
                }])}
                >
                  <Option value="aa">aa</Option>
                </Select>
              </FormItem>
              {this.renderTextInput(
                this.msg('receiptPlace'), 'receiptPlace'
              )}
            </Col>
            <Col span="10" className="subform-body">
              {this.renderTextInput(
                this.msg('contact'), 'consigneeContact'
              )}
            </Col>
          </Row>
        </Col>
        <Col span="6">
          <Row className="subform">
            {this.renderTextInput(this.msg('client'), 'client')}
            <FormItem label={this.msg('lsp')} labelCol={{span: 6}} wrapperCol={{span: 18}}
              help={getFieldError('lsp')} required
            >
              <Select defaultValue="aa" {...getFieldProps('lsp')}>
                <Option value="aa">aa</Option>
              </Select>
            </FormItem>
          </Row>
          <Row>
            <Button htmlType="submit" type="primary">{formatGlobalMsg(intl, 'ok')}</Button>
          </Row>
          <Row>
            <Button>{formatGlobalMsg(intl, 'cancel')}</Button>
          </Row>
        </Col>
      </Form>
    );
  }
}
