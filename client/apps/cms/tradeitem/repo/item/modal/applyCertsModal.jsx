import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import { toggleApplyCertsModal, updateItemAppCert, loadTradeItem } from 'common/reducers/cmsTradeitem';
import { TRADE_ITEM_APPLY_CERTS } from 'common/constants';

@connect(
  state => ({
    visible: state.cmsTradeitem.applyCertsModal.visible,
  }),
  { toggleApplyCertsModal, updateItemAppCert, loadTradeItem }
)
export default class ApplyCertsModal extends Component {
  static propTypes = {
    selectedRowKeys: PropTypes.string,
    itemId: PropTypes.number.isRequired,
  }
  state = {
    documents: [],
    selectedRowKeys: [],
    selectedRows: [],
  }
  componentWillMount() {
    const documents = [...TRADE_ITEM_APPLY_CERTS];
    this.setState({
      documents,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      if (nextProps.selectedRowKeys) {
        const selectedRowKeys = nextProps.selectedRowKeys.split(',');
        const documents = [...this.state.documents];
        this.setState({
          selectedRowKeys,
          documents,
        });
      }
    }
  }
  handleCancel = () => {
    this.props.toggleApplyCertsModal(false);
  }
  handleOk = () => {
    const { selectedRows } = this.state;
    let code = '';
    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      if (!code) {
        code += `${row.app_cert_code}`;
      } else {
        code += `,${row.app_cert_code}`;
      }
    }
    this.props.updateItemAppCert(code, this.props.itemId).then((result) => {
      if (!result.error) {
        this.props.loadTradeItem(this.props.itemId);
        this.handleCancel();
      }
    });
  }
  render() {
    const { visible } = this.props;
    const { documents } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows,
        });
      },
    };
    const columns = [{
      title: '证书代码',
      dataIndex: 'app_cert_code',
      width: 80,
    }, {
      title: '证书名称',
      dataIndex: 'app_cert_name',
    }];
    return (
      <Modal
        title="商检出具证书"
        visible={visible}
        maskClosable={false}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        style={{ top: 20 }}
      >
        <Table size="middle" columns={columns} dataSource={documents} scroll={{ y: 560 }} rowSelection={rowSelection} rowKey="app_cert_code" pagination={false} />
      </Modal>
    );
  }
}
