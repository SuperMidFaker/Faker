import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, Input, message, Select } from 'antd';
import { toggleNewExRateModal, addExRate } from 'common/reducers/bssExRateSettings';
import { formatMsg } from '../message.i18n';


const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

@injectIntl
@connect(
  state => ({
    visible: state.bssExRateSettings.visibleExRateModal,
    currencies: state.bssExRateSettings.currencies,
  }),
  { toggleNewExRateModal, addExRate }
)
@Form.create()
export default class NewExRateModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleNewExRateModal(false);
  }
  handleOk = () => {
    const data = this.props.form.getFieldsValue();
    this.props.addExRate({
      currency: data.currency,
      base_currency: data.base_currency,
      exchange_rate: data.exchange_rate,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.toggleNewExRateModal(false);
        this.props.reload();
      }
    });
  }

  render() {
    const { visible, currencies, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('addChangeRate')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="币制" {...formItemLayout} >
            {getFieldDecorator('currency', {
              rules: [{ required: true }],
            })(<Select>
              {currencies.map(currency =>
                (<Option key={currency.curr_code} value={currency.curr_code}>
                  {currency.curr_name}
                </Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="本币" {...formItemLayout} >
            {getFieldDecorator('base_currency', {
              rules: [{ required: true }],
            })(<Select>
              {currencies.map(currency =>
                (<Option key={currency.curr_code} value={currency.curr_code}>
                  {currency.curr_name}
                </Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="汇率" {...formItemLayout} >
            {getFieldDecorator('exchange_rate', {
              rules: [{ required: true }],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
