import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Form, Input, Radio } from 'antd';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { hideWarehouseModal } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const FormItem = Form.Item;
@injectIntl

@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cwmWarehouse.warehouseModal.visible,
  }),
  { hideWarehouseModal }
)

export default class WareHouseModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    isBonded: 0,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleChange = (e) => {
    this.setState({
      isBonded: e.target.value,
    });
  }
  handleCancel = () => {
    this.props.hideWarehouseModal();
  }
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const isBonded = this.state.isBonded;
    return (
      <Modal title="添加仓库" visible={this.props.visible} onCancel={this.handleCancel}>
        <Form>
          <FormItem {...formItemLayout} label="仓库编号" >
            <Input />
          </FormItem>
          <FormItem {...formItemLayout} label="仓库名称" >
            <Input />
          </FormItem>
          <FormItem {...formItemLayout} label="仓库位置" >
            <Input />
          </FormItem>
          <FormItem {...formItemLayout} label="是否时保税仓" >
            <Radio.Group value={isBonded} onChange={this.handleChange}>
              <Radio.Button value="0">是</Radio.Button>
              <Radio.Button value="1">否</Radio.Button>
            </Radio.Group>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
