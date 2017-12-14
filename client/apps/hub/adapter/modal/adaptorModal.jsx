import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Select, Input } from 'antd';
import { loadPartners } from 'common/reducers/partner';
import { loadAdaptors, addAdaptor, showAdaptorModal, hideAdaptorModal } from 'common/reducers/saasLineFileAdaptor';
import { uuidWithoutDash } from 'client/common/uuid';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';

const impModels = Object.values(LINE_FILE_ADAPTOR_MODELS);
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

@connect(
  state => ({
    visible: state.saasLineFileAdaptor.adaptorModal.visible,
    customers: state.partner.partners,
  }),
  {
    showAdaptorModal, hideAdaptorModal, loadPartners, addAdaptor, loadAdaptors,
  }
)

export default class AdaptorModal extends Component {
  static PropTypes = {
  }
  state = {
    adaptorName: '',
    ownerPid: '',
    ownerTid: '',
    model: '',
  }
  handleCancel = () => {
    this.props.hideAdaptorModal();
  }
  handleAddAdaptor = () => {
    const {
      adaptorName, model, ownerPid, ownerTid,
    } = this.state;
    this.props.addAdaptor({
      code: uuidWithoutDash(),
      name: adaptorName,
      model,
      ownerPid,
      ownerTid,
    }).then((result) => {
      if (!result.error) {
        this.props.hideAdaptorModal();
        this.props.loadAdaptors();
      }
    });
  }
  handleAdaptorNameChange = (e) => {
    this.setState({
      adaptorName: e.target.value,
    });
  }
  handleCusChange = (cusId) => {
    const customer = this.props.customers.find(cus => cus.id === cusId);
    this.setState({
      ownerPid: customer.id,
      ownerTid: customer.partner_tenant_id,
    });
  }
  handleModelChange = (model) => {
    this.setState({
      model,
    });
  }
  handleReload = (ownerPid) => {
    this.props.loadAdaptors(ownerPid, this.props.impModels.map(impm => impm.key));
  }
  render() {
    const { visible, customers } = this.props;
    const { adaptorName, model } = this.state;
    return (
      <Modal maskClosable={false} title="新增适配器" onOk={this.handleAddAdaptor}
        onCancel={this.handleCancel} visible={visible}
      >
        <Form layout="horizontal">
          <FormItem label="企业名称" {...formItemLayout}>
            <Select onChange={this.handleCusChange}>
              {customers.map(cus => <Option value={cus.id} key={cus.id}>{cus.name}</Option>)}
            </Select>
          </FormItem>
          <FormItem label="名称" required {...formItemLayout}>
            <Input value={adaptorName} onChange={this.handleAdaptorNameChange} />
          </FormItem>
          <FormItem label="导入对象" required {...formItemLayout}>
            <Select value={model} allowClear optionFilterProp="children" onChange={this.handleModelChange}>
              {impModels.map(mod => <Option key={mod.key} value={mod.key}>{mod.name}</Option>)}
            </Select>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
