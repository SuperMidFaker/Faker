import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Table, Switch, Button } from 'antd';
import { showAdvModelModal } from 'common/reducers/cmsExpense';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visibleAdvModal: state.cmsExpense.visibleAdvModal,
    quoteData: state.cmsQuote.quoteData,
  }),
  { showAdvModelModal }
)
export default class AdvModelModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visibleAdvModal: PropTypes.bool.isRequired,
    showAdvModelModal: PropTypes.func.isRequired,
    quoteData: PropTypes.object.isRequired,
  }
  state = {
    datas: [],
    selectedRowKeys: [],
  };
  // componentDidMount() {
  //   // <script src="http://oss.sheetjs.com/js-xlsx/xlsx.full.min.js"></script>
  //   // <script src="http://sheetjs.com/demos/Blob.js"></script>
  //   // <script src="http://sheetjs.com/demos/FileSaver.js"></script>
  //   let script;
  //   if (!document.getElementById('xlsx')) {
  //     script = document.createElement('script');
  //     script.id = 'xlsx';
  //     script.src = 'http://oss.sheetjs.com/js-xlsx/xlsx.full.min.js';
  //     script.async = true;
  //     document.body.appendChild(script);
  //   }
  //   if (!document.getElementById('FileSaver')) {
  //     script = document.createElement('script');
  //     script.id = 'FileSaver';
  //     script.src = 'http://sheetjs.com/demos/FileSaver.js';
  //     script.async = true;
  //     document.body.appendChild(script);
  //   }
  // }
  componentWillReceiveProps(nextProps) {
    if (nextProps.quoteData !== this.props.quoteData) {
      const datas = nextProps.quoteData.fees.filter(qd => qd.fee_style === 'advance' && qd.enabled);
      this.setState({ datas });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor);
  handleChange = (check, record) => {
    record.invoice_en = check; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  columns = [{
    title: this.msg('feeName'),
    dataIndex: 'fee_name',
  }, {
    title: this.msg('feeCode'),
    dataIndex: 'fee_code',
  }, {
    title: this.msg('invoiceEn'),
    dataIndex: 'invoice_en',
    render: (o, record) =>
      <Switch size="small" checked={o} onChange={check => this.handleChange(check, record)} />,
  },
  ];
  handleCancel = () => {
    this.props.showAdvModelModal(false);
  }
  s2ab = (s) => {
    if (typeof ArrayBuffer !== 'undefined') {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    } else {
      const buf = new Array(s.length);
      for (let i = 0; i !== s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
  }
  handleSave = () => {
    const { datas, selectedRowKeys } = this.state;
    const csvData = [
      ['订单号', '清单编号', '报关单号'],
      ['NO_DD', 'NO_QD', 'NO_BGD'],
    ];
    for (let i = 0; i < selectedRowKeys.length; i++) {
      const key = selectedRowKeys[i];
      const selData = datas.filter(dt => dt._id === key)[0];
      if (selData) {
        if (selData.invoice_en) {
          csvData[0] = csvData[0].concat([selData.fee_name, '发票抬头', '发票类型']);
          csvData[1] = csvData[1].concat([selData.fee_code, `FP#TD_${selData.fee_code}`, `FP#LX_${selData.fee_code}`]);
        } else {
          csvData[0].push(selData.fee_name);
          csvData[1].push(selData.fee_code);
        }
      }
    }
    // ref: http://www.jianshu.com/p/044c183edf42
    // https://github.com/SheetJS/js-xlsx
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets.Sheet1 = XLSX.utils.aoa_to_sheet(csvData);
    FileSaver.saveAs(new window.Blob([this.s2ab(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }), 'advanceModel.xlsx');
  }

  render() {
    const { visibleAdvModal } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const footer = [
      <Button key="cancel" type="ghost" size="large" onClick={this.handleCancel} style={{ marginRight: 10 }}>取消</Button>,
      <Button key="next" type="primary" size="large" onClick={this.handleSave} disabled={this.state.selectedRowKeys.length === 0}>下载</Button>,
    ];
    return (
      <Modal visible={visibleAdvModal} title={this.msg('advModel')} onCancel={this.handleCancel} footer={footer} width={600}>
        <Table rowSelection={rowSelection} pagination={false} rowKey="_id" columns={this.columns} dataSource={this.state.datas} scroll={{ y: 450 }} />
      </Modal>
    );
  }
}
