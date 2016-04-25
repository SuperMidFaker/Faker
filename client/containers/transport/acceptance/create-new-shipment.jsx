import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Form, Input, Select, Button } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { clearForm, setFormValue }
  from 'universal/redux/reducers/shipment';
import { format } from 'universal/i18n/helpers';
import ConsignInfo from '../shipment/forms/consign-info';
import GoodsInfo from '../shipment/forms/goods-info';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ dispatch }) {
  return dispatch(clearForm());
}

@connectFetch()(fetchData)
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
    submitting: state.shipment.submitting
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
    formhoc: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func.isRequired
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  renderTextInput(labelName, field, colSpan, placeholder, required, rules, fieldProps) {
    const { formhoc: { getFieldProps, getFieldError }} = this.props;
    return (
      <FormItem label={labelName} labelCol={{span: colSpan}} wrapperCol={{span: 24 - colSpan}}
        help={rules && getFieldError(field)} hasFeedback required={required}
      >
        <Input type="text" placeholder={placeholder}
          {...getFieldProps(field, {rules, ...fieldProps})}
        />
      </FormItem>
    );
  }
  render() {
    const { intl, formhoc, formhoc: { getFieldError, getFieldProps }} = this.props;
    return (
      <Form form={formhoc} horizontal className="form-edit-content offset-mid-col">
        <Col span="14" className="subform">
          <ConsignInfo type="consigner" intl={intl} outerColSpan={14} labelColSpan={4} formhoc={formhoc} />
          <ConsignInfo type="consignee" intl={intl} outerColSpan={14} labelColSpan={4} formhoc={formhoc} />
          <GoodsInfo intl={intl} labelColSpan={6} formhoc={formhoc}/>
        </Col>
        <Col span="8">
          <Row className="subform">
            {this.renderTextInput(this.msg('client'), 'client', 4)}
            <FormItem label={this.msg('lsp')} labelCol={{span: 4}} wrapperCol={{span: 20}}
              help={getFieldError('lsp')} required
            >
              <Select defaultValue="aa" {...getFieldProps('lsp')}>
                <Option value="aa">aa</Option>
              </Select>
            </FormItem>
          </Row>
          <Row className="subform-buton-row">
            <Button htmlType="submit" type="primary">{formatGlobalMsg(intl, 'ok')}</Button>
          </Row>
          <Row className="subform-buton-row">
            <Button>{formatGlobalMsg(intl, 'cancel')}</Button>
          </Row>
        </Col>
      </Form>
    );
  }
}
