import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Input, Table } from 'antd';
import RowAction from 'client/components/RowAction';
import { toggleAttDocuModal, saveAttDocuments, loadCiqDeclHead, loadAttDocuments } from 'common/reducers/cmsCiqDeclare';
import { CIQ_ATT_DOCUMENTS } from 'common/constants';


@connect(
  state => ({
    visible: state.cmsCiqDeclare.attDocuModal.visible,
  }),
  {
    toggleAttDocuModal, saveAttDocuments, loadCiqDeclHead, loadAttDocuments,
  }
)
export default class AttachedDocuModal extends Component {
  static propTypes = {
    preEntrySeqNo: PropTypes.string.isRequired,
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
      title: '类别代码',
      dataIndex: 'att_doc_type_code',
      align: 'center',
      width: 80,
    }, {
      title: '随附单据名称',
      dataIndex: 'att_doc_name',
    }, {
      title: '随附单据编号',
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_no')} />,
      dataIndex: 'att_doc_no',
      width: 150,
    }, {
      title: '核销货物序号',
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_wrtof_detail_no')} />,
      dataIndex: 'att_doc_wrtof_detail_no',
      width: 120,
    }, {
      title: '核销数量',
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_wrtof_qty')} />,
      dataIndex: 'att_doc_wrtof_qty',
      width: 120,
    }, {
      title: '核销后明细余量',
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_detail_left')} />,
      dataIndex: 'att_doc_detail_left',
      width: 120,
    }, {
      title: '核销后余量',
      render: (o, record, index) => <Input size="small" value={o} onChange={e => this.handleChange(e.target.value, index, 'att_doc_wrtof_left')} />,
      dataIndex: 'att_doc_wrtof_left',
      width: 120,
    }, {
      title: '操作',
      width: 60,
      render: (o, record, index) => <RowAction onClick={() => this.handleAdd(record.att_doc_type_code, index)} icon="plus" />,
    }];
    return (
      <Modal width={1200} title="随附单据" visible={visible} maskClosable={false} onCancel={this.handleCancel} onOk={this.handleOk} style={{ top: 20 }}>
        <Table size="middle" columns={columns} dataSource={documents} pagination={false} scroll={{ y: 560 }} rowSelection={rowSelection} rowKey="index" />
      </Modal>
    );
  }
}

