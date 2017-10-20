import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, Form, Alert, Select } from 'antd';
import { toggleBrokerModal, addBroker, loadBrokers, updateBroker, loadCCBs } from 'common/reducers/cwmWarehouse';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, PARTNER_BUSINESSES } from 'common/constants';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadCmsBrokers } from 'common/reducers/cmsBrokers';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

function fetchData({ dispatch }) {
  return dispatch(loadCmsBrokers());
}

@connectFetch()(fetchData)

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    visible: state.cwmWarehouse.brokerModal.visible,
    broker: state.cwmWarehouse.brokerModal.broker,
    CCBs: state.cwmWarehouse.CCBs,
    brokers: state.cmsBrokers.brokers,
  }),
  { toggleBrokerModal, addBroker, loadBrokers, updateBroker, loadCCBs, loadCmsBrokers }
)

@Form.create()
export default class SuppliersModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
  }
  componentWillMount() {
    this.props.loadCCBs(this.props.tenantId, PARTNER_ROLES.SUP, PARTNER_BUSINESSE_TYPES.clearance, PARTNER_BUSINESSES.CCB);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible && nextProps.broker.id) {
      this.props.form.setFieldsValue(nextProps.broker);
    }
  }
  componentWillUnmount() {
    this.setState({
      visible: false,
    });
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleBrokerModal(false);
    this.props.form.resetFields();
  }
  handleAdd = () => {
    const { tenantId, whseCode, loginId, broker, CCBs } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (broker.id) {
          this.props.updateBroker(values, broker.id, loginId).then(() => {
            this.props.loadBrokers(whseCode, tenantId);
            this.props.toggleBrokerModal(false);
          });
        } else {
          const CCB = CCBs.find(ccb => ccb.partner_unique_code === values.uscc_code);
          if (CCB) {
            this.props.addBroker(values, tenantId, whseCode, loginId).then((result) => {
              if (!result.error) {
                this.props.loadBrokers(whseCode, tenantId);
                this.props.toggleBrokerModal(false);
              }
            });
          } else {
            this.setState({
              visible: true,
            });
          }
        }
      }
    });
    this.props.form.resetFields();
  }
  handleChange = (value) => {
    const { brokers, form } = this.props;
    const broker = brokers.find(bk => bk.comp_name === value);
    form.setFieldsValue({
      name: broker.comp_name,
      uscc_code: broker.comp_code,
      customs_code: broker.customs_code,
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible, brokers } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    }; return (
      <Modal title="添加报关代理" visible={visible} onCancel={this.handleCancel} onOk={this.handleAdd}>
        { this.state.visible && <Alert message="报关行不存在" showIcon type="error" /> }
        <Form layout="horizontal">
          <FormItem label="名称:" required {...formItemLayout}>
            {getFieldDecorator('name')(<Select
              showSearch
              style={{ width: '100%' }}
              optionFilterProp="children"
              onChange={this.handleChange}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {brokers.map(broker => (<Option value={broker.comp_name} key={broker.comp_name}>{broker.comp_name}</Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="统一社会信用代码:" required {...formItemLayout}>
            {getFieldDecorator('uscc_code')(<Input disabled />)}
          </FormItem>
          <FormItem label="海关编码:" required {...formItemLayout}>
            {getFieldDecorator('customs_code')(<Input disabled />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
