import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import { toggleApplyCertsModal, updateItemApplCert, loadTradeItem } from 'common/reducers/cmsTradeitem';
import { TRADE_ITEM_APPLY_CERTS } from 'common/constants';

@connect(
  state => ({
    visible: state.cmsTradeitem.applyCertsModal.visible,
  }),
  { toggleApplyCertsModal, updateItemApplCert, loadTradeItem }
)
export default class ApplyCertsModal extends Component {
  static propTypes = {
    selectedRowKeys: PropTypes.string,
    itemId: PropTypes.number.isRequired,
    onOk: PropTypes.func,
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
        const selectedRows =
        TRADE_ITEM_APPLY_CERTS.filter(cert => selectedRowKeys.includes(cert.app_cert_code));
        const documents = [...this.state.documents];
        this.setState({
          selectedRowKeys,
          selectedRows,
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
    const data = {
      code: '',
      name: '',
    };
    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      if (!data.code) {
        data.code += `${row.app_cert_code}`;
      } else {
        data.code += `,${row.app_cert_code}`;
      }
      if (!data.name) {
        data.name += `${row.app_cert_name}`;
      } else {
        data.name += `,${row.app_cert_name}`;
      }
    }
    this.props.updateItemApplCert(data, this.props.itemId).then((result) => {
      if (!result.error) {
        this.props.loadTradeItem(this.props.itemId);
        this.handleCancel();
      }
    });
    this.props.onOk(data.name);
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
