import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Input, Table } from 'antd';
import { toggleInspQuarantineDocumentsRequiredModal, saveRequiredDocuments, loadCiqDeclHead } from 'common/reducers/cmsCiqDeclare';
import { CIQ_INSP_QUAE_DOCUMENTS } from 'common/constants';


@connect(
  state => ({
    visible: state.cmsCiqDeclare.inspQuarantineDocumentsRequiredModal.visible,
  }),
  { toggleInspQuarantineDocumentsRequiredModal, saveRequiredDocuments, loadCiqDeclHead }
)
export default class InspQuarantineDocumentsRequiredModal extends Component {
  static PropTypes = {
    preEntrySeqNo: PropTypes.string.isRequired,
    selectedRowKeys: PropTypes.string,
    applOris: PropTypes.string,
    applCopyQuans: PropTypes.string,
  }
  state = {
    documents: [],
    selectedRowKeys: [],
    selectedRows: [],
  }
  componentWillMount() {
    const documents = [...CIQ_INSP_QUAE_DOCUMENTS];
    this.setState({
      documents,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      if (nextProps.selectedRowKeys) {
        const selectedRowKeys = nextProps.selectedRowKeys.split(',');
        const applOris = nextProps.applOris.split(',');
        const applCopyQuans = nextProps.applCopyQuans.split(',');
        const documents = [...this.state.documents];
        for (let i = 0; i < selectedRowKeys.length; i++) {
          documents.find(doc => doc.app_cert_code === selectedRowKeys[i]).appl_ori = applOris[i];
          documents.find(doc => doc.app_cert_code === selectedRowKeys[i]).appl_copy_quan = applCopyQuans[i];
        }
        this.setState({
          selectedRowKeys,
          documents,
        });
      }
    }
  }
  handleCancel = () => {
    this.props.toggleInspQuarantineDocumentsRequiredModal(false);
  }
  handleOk = () => {
    const { selectedRows } = this.state;
    const data = {
      app_cert_code: '',
      app_cert_name: '',
      appl_ori: '',
      appl_copy_quan: '',
    };
    for (let i = 0; i < selectedRows.length; i++) {
      const row = selectedRows[i];
      if (!data.app_cert_code) {
        data.app_cert_code += `${row.app_cert_code}`;
      } else {
        data.app_cert_code += `,${row.app_cert_code}`;
      }
      if (!data.app_cert_name) {
        data.app_cert_name += `${row.app_cert_name}`;
      } else {
        data.app_cert_name += `,${row.app_cert_name}`;
      }
      if (!data.appl_ori) {
        data.appl_ori += `${row.appl_ori}`;
      } else {
        data.appl_ori += `,${row.appl_ori}`;
      }
      if (!data.appl_copy_quan) {
        data.appl_copy_quan += `${row.appl_copy_quan}`;
      } else {
        data.appl_copy_quan += `,${row.appl_copy_quan}`;
      }
    }
    this.props.saveRequiredDocuments(data, this.props.preEntrySeqNo).then((result) => {
      if (!result.error) {
        this.handleCancel();
        this.props.loadCiqDeclHead(this.props.preEntrySeqNo);
      }
    });
  }
  handleOriChange = (e, index) => {
    const documents = [...this.state.documents];
    documents[index].appl_ori = e.target.value;
    this.setState({
      documents,
    });
  }
  handleCopyQuanChange = (e, index) => {
    const documents = [...this.state.documents];
    documents[index].appl_copy_quan = e.target.value;
    this.setState({
      documents,
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
      title: '序号',
      render: (o, record, index) => index + 1,
    }, {
      title: '证书代码',
      dataIndex: 'app_cert_code',
    }, {
      title: '证书名称',
      dataIndex: 'app_cert_name',
    }, {
      title: '正本数量',
      dataIndex: 'appl_ori',
      render: (o, record, index) => <Input value={o} onChange={e => this.handleOriChange(e, index)} />,
    }, {
      title: '副本数量',
      dataIndex: 'appl_copy_quan',
      render: (o, record, index) => <Input value={o} onChange={e => this.handleCopyQuanChange(e, index)} />,
    }];
    return (
      <Modal width={800} title="所需单证" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <Table columns={columns} dataSource={documents} rowSelection={rowSelection} rowKey="app_cert_code" />
      </Modal>
    );
  }
}
