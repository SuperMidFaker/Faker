import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Input, Table } from 'antd';
import RowAction from 'client/components/RowAction';
import { toggleAttDocuModal, saveAttDocuments, loadCiqDeclHead, loadAttDocuments } from 'common/reducers/cmsCiqDeclare';
import { CIQ_ATT_DOCUMENTS } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';


@connect(
  state => ({
    visible: state.cmsCiqDeclare.attDocuModal.visible,
  }),
  {
    toggleAttDocuModal, saveAttDocuments, loadCiqDeclHead, loadAttDocuments,
  }
)
@injectIntl
export default class AttachedDocuModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    preEntrySeqNo: PropTypes.string,
  }
  state = {
    documents: [],
    selectedRowKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.props.loadAttDocuments(nextProps.preEntrySeqNo).then((result) => {
        if (!result.error) {
          if (result.data.length > 0) {
            const newDocuments = result.data.concat(CIQ_ATT_DOCUMENTS).map((doc, index) =>
              ({ ...doc, index }));
            const selectedRowKeys = [];
            for (let i = 0; i < result.data.length; i++) {
              selectedRowKeys.push(i);
            }
            this.setState({
              documents: newDocuments,
              selectedRowKeys,
            });
          } else {
            const documents = [...CIQ_ATT_DOCUMENTS].map((doc, index) => ({ ...doc, index }));
            this.setState({
              documents,
            });
          }
        }
      });
    }
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleAttDocuModal(false);
  }
  handleOk = () => {
    const { selectedRowKeys, documents } = this.state;
    const { preEntrySeqNo } = this.props;
    const rows = documents.filter(doc => selectedRowKeys.includes(doc.index));
    this.props.saveAttDocuments(rows, preEntrySeqNo).then((result) => {
      if (!result.error) {
        this.props.loadCiqDeclHead(preEntrySeqNo);
        this.handleCancel();
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }
  handleChange = (value, index, field) => {
    const documents = [...this.state.documents];
    documents[index][field] = value;
    this.setState({
      documents,
    });
  }
  handleAdd = (typeCode, index) => {
    const documents = this.state.documents.map(doc => ({ ...doc }));
    const copyOne = CIQ_ATT_DOCUMENTS.find(docu => docu.att_doc_type_code === typeCode);
    copyOne.index = documents.length;
    documents.splice(index + 1, 0, copyOne);
    this.setState({
      documents,
    });
  }
  render() {
    const { visible } = this.props;
    const { documents } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({
          selectedRowKeys,
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
      title: this.msg('attDocTypeCode'),
      dataIndex: 'att_doc_type_code',
      align: 'center',
      width: 80,
    }, {
      title: this.msg('attDocName'),
      dataIndex: 'att_doc_name',
    }, {
      title: this.msg('attDocNo'),
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_no')} />,
      dataIndex: 'att_doc_no',
      width: 150,
    }, {
      title: this.msg('wrtofDetailNo'),
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_wrtof_detail_no')} />,
      dataIndex: 'att_doc_wrtof_detail_no',
      width: 120,
    }, {
      title: this.msg('wrtofQty'),
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_wrtof_qty')} />,
      dataIndex: 'att_doc_wrtof_qty',
      width: 120,
    }, {
      title: this.msg('detailLeft'),
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_detail_left')} />,
      dataIndex: 'att_doc_detail_left',
      width: 120,
    }, {
      title: this.msg('wrtofLeft'),
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_wrtof_left')} />,
      dataIndex: 'att_doc_wrtof_left',
      width: 120,
    }, {
      dataIndex: 'OPS_COL',
      width: 60,
      render: (o, record, index) => <RowAction onClick={() => this.handleAdd(record.att_doc_type_code, index)} icon="plus" />,
    }];
    return (
      <Modal width={1200} title={this.msg('attDoc')} visible={visible} maskClosable={false} onCancel={this.handleCancel} onOk={this.handleOk} style={{ top: 20 }}>
        <Table size="middle" columns={columns} dataSource={documents} pagination={false} scroll={{ y: 560 }} rowSelection={rowSelection} rowKey="index" />
      </Modal>
    );
  }
}

