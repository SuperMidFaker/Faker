import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Table, Modal } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { hideReceiveModal } from 'common/reducers/cwmReceive';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cwmReceive.receiveModal.visible,
  }),
  { hideReceiveModal }
)
export default class ReceivingModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleCancel = () => {
    this.props.hideReceiveModal();
  }
  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '订单数量',
    dataIndex: 'order_qty',
    width: 100,
  }, {
    title: '库区/库位',
    dataIndex: 'unit',
    width: 120,
  }, {
    title: '货物状态',
    dataIndex: 'packing_code',
    width: 120,
  }]
  render() {
    return (
      <Modal title="收货" onCancel={this.handleCancel} visible={this.props.visible}>
        <Table columns={this.columns} />
      </Modal>
    );
  }
}
