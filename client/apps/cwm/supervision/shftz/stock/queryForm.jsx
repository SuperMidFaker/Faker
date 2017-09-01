import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Row, Col } from 'antd';
import { formatMsg } from './message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { }
)
@Form.create()
export default class QueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired,
    filter: PropTypes.object,
  }
  state = {
    expandForm: false,
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse !== this.props.defaultWhse) {
      this.props.form.resetFields();
    }
  }
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(formData);
      }
    });
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('owner')}>
              {getFieldDecorator('ownerCode', {
                initialValue: filter.ownerCode,
                rules: [{ required: true }],
              })(<Select showSearch optionFilterProp="children" allowClear>
                {owners.map(owner => (<Option value={owner.customs_code} key={owner.id}>{owner.name}</Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('cusNo')}>
              {getFieldDecorator('entNo', {
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={4} offset={8}>
            <FormItem>
              <Button type="primary" size="large" onClick={this.handleStockSearch}>{this.msg('inquiry')}</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>{this.msg('reset')}</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
