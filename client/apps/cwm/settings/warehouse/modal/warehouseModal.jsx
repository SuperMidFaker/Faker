import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio, message } from 'antd';
import { hideWarehouseModal, addWarehouse, loadwhList } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    visible: state.cwmWarehouse.warehouseModal.visible,
  }),
  { hideWarehouseModal, addWarehouse, loadwhList }
)
@Form.create()
export default class WareHouseModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    isBonded: 0,
  }
  msg = formatMsg(this.props.intl)
  handleChange = (e) => {
    this.setState({
      isBonded: e.target.value,
    });
  }
  handleCancel = () => {
    this.props.hideWarehouseModal();
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { whseCode, whseName, whseAddress } = values;
        const { tenantId, tenantName } = this.props;
        const { isBonded } = this.state;
        this.props.addWarehouse({
          whseCode,
          whseName,
          whseAddress,
          isBonded,
          tenantId,
          tenantName,
        }).then(
          (result) => {
            if (!result.error) {
              message.info('添加仓库成功');
              this.props.hideWarehouseModal();
              this.props.loadwhList(tenantId);
            }
          }
        );
      }
    });
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const { isBonded } = this.state;
    return (
      <Modal title="添加仓库" visible={this.props.visible} onCancel={this.handleCancel} onOk={this.handleSubmit}>
        <Form>
          <FormItem {...formItemLayout} label="仓库代码" >
            {
              getFieldDecorator('whseCode', {
                rules: [{ required: true, messages: 'please input whseCode' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="仓库名称" >
            {
              getFieldDecorator('whseName', {
                rules: [{ required: true, messages: 'please input whseName' }],
              })(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="仓库地址" >
            {
              getFieldDecorator('whseAddress')(<Input />)
            }
          </FormItem>
          <FormItem {...formItemLayout} label="保税性质" >
            <Radio.Group value={isBonded} onChange={this.handleChange}>
              <Radio.Button value={0}>非保税仓</Radio.Button>
              <Radio.Button value={1}>保税仓</Radio.Button>
            </Radio.Group>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}