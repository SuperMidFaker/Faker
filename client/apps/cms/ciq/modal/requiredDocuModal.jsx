import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Input, Table } from 'antd';
import { toggleReqDocuModal, saveRequiredDocuments, loadCiqDeclHead } from 'common/reducers/cmsCiqDeclare';
import { CIQ_INSP_QUAE_DOCUMENTS } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    visible: state.cmsCiqDeclare.requiredDocuModal.visible,
  }),
  { toggleReqDocuModal, saveRequiredDocuments, loadCiqDeclHead }
)
export default class RequiredDocuModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    preEntrySeqNo: PropTypes.string,
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
          documents.find(doc =>
            doc.app_cert_code === selectedRowKeys[i]).appl_ori = applOris[i];
          documents.find(doc =>
            doc.app_cert_code === selectedRowKeys[i]).appl_copy_quan = applCopyQuans[i];
        }
        this.setState({
          selectedRowKeys,
          documents,
        });
      }
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleReqDocuModal(false);
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
      key: 'sno',
      width: 35,
      align: 'center',
      className: 'table-col-seq',
      render: (o, record, index) => index + 1,
    }, {
      title: this.msg('appCertCode'),
      dataIndex: 'app_cert_code',
      align: 'center',
      width: 80,
    }, {
      title: this.msg('appCertName'),
      dataIndex: 'app_cert_name',
    }, {
      title: this.msg('applOri'),
      dataIndex: 'appl_ori',
      width: 100,
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleOriChange(e, index)} />,
    }, {
      title: this.msg('applCopyQuan'),
      dataIndex: 'appl_copy_quan',
      width: 100,
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleCopyQuanChange(e, index)} />,
    }];
    return (
      <Modal width={800} title={this.msg('certNeeded')} visible={visible} maskClosable={false} onCancel={this.handleCancel} onOk={this.handleOk} style={{ top: 20 }}>
        <Table size="middle" columns={columns} dataSource={documents} scroll={{ y: 560 }} rowSelection={rowSelection} rowKey="app_cert_code" pagination={false} />
      </Modal>
    );
  }
}
