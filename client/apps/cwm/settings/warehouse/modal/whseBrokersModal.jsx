import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Select } from 'antd';
import { toggleBrokerModal, addBroker, loadBrokers, loadBrokerPartners } from 'common/reducers/cwmWarehouse';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import connectFetch from 'client/common/decorators/connect-fetch';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ dispatch }) {
  return dispatch(loadBrokerPartners(PARTNER_ROLES.SUP, PARTNER_BUSINESSE_TYPES.clearance));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.brokerModal.visible,
    brokers: state.cwmWarehouse.brokerPartners,
    listBrokers: state.cwmWarehouse.brokers,
  }),
  { toggleBrokerModal, addBroker, loadBrokers }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleBrokerModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const { whseCode, loginId, brokers } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const broker = brokers.find(bk => bk.customs_code === values.customs_code);
        this.props.addBroker(values, whseCode, loginId, broker.partner_tenant_id, broker.partner_code).then((result) => {
          if (!result.error) {
            this.props.loadBrokers(whseCode);
            this.props.toggleBrokerModal(false);
          }
        });
      }
    });
    this.props.form.resetFields();
  }
  handleChange = (value) => {
    const { brokers, form } = this.props;
    const broker = brokers.find(bk => bk.customs_code === value);
    form.setFieldsValue({
      customs_code: broker.customs_code,
      uscc_code: broker.partner_unique_code,
      name: broker.name,
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, brokers, listBrokers } = this.props;
    const filterBrokers = brokers.filter(broker => !listBrokers.find(lb => lb.partner_id === broker.id));
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal maskClosable={false} title="添加报关代理" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Form layout="horizontal">
          <FormItem label="海关编码:" required {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Select
              showSearch
              style={{ width: '100%' }}
              onChange={this.handleChange}
            >
              {filterBrokers.map(broker =>
                (<Option value={broker.customs_code} key={broker.customs_code}>{broker.customs_code}|{broker.name}</Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="统一社会信用代码:" required {...formItemLayout}>
            {getFieldDecorator('uscc_code')(<Input disabled />)}
          </FormItem>
          <FormItem label="名称:" required {...formItemLayout}>
            {getFieldDecorator('name')(<Input disabled />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
