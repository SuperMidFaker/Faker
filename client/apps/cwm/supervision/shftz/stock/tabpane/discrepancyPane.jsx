import React from 'react';
// import PropTypes from 'prop-types';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button } from 'antd';
import DataTable from 'client/components/DataTable';
import { string2Bytes } from 'client/util/dataTransform';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
    state => ({
      diffviews: state.cwmShFtz.compareTask.views.filter(vw => vw.diff_qty !== 0 || vw.diff_net_wt !== 0),
      entrydiffs: state.cwmShFtz.compareTask.entrydiffs,
      inbounddiffs: state.cwmShFtz.compareTask.inbounddiffs,
    }))
export default class FTZDiscrepancyPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('billNo'),
    dataIndex: 'ftz_ent_no',
    width: 200,
  }, {
    title: this.msg('detailId'),
    dataIndex: 'ftz_ent_detail_id',
    width: 100,
  }, {
    title: this.msg('hsCode'),
    width: 120,
    dataIndex: 'hscode',
  }, {
    title: this.msg('gName'),
    width: 120,
    dataIndex: 'name',
  }, {
    title: this.msg('cargoType'),
    width: 150,
    dataIndex: 'portion',
    render: por => por ? '可分拨' : '非分拨',
  }, {
    title: this.msg('ftzStockQty'),
    dataIndex: 'ftz_qty',
    width: 150,
  }, {
    title: this.msg('whseStockQty'),
    width: 120,
    dataIndex: 'whse_qty',
  }, {
    title: this.msg('ftzNetWt'),
    width: 120,
    dataIndex: 'ftz_net_wt',
  }, {
    title: this.msg('whseNetWt'),
    width: 120,
    dataIndex: 'whse_net_wt',
  }, {
    title: this.msg('ftzAmount'),
    width: 120,
    dataIndex: 'ftz_amount',
  }, {
    title: this.msg('whseAmount'),
    width: 120,
    dataIndex: 'whse_amount',
  }]
  expColumns = [{
    title: this.msg('asnNo'),
    dataIndex: 'asn_no',
    width: 200,
  }, {
    title: this.msg('productNo'),
    dataIndex: 'product_no',
    width: 100,
  }, {
    title: this.msg('whseStockQty'),
    dataIndex: 'stock_qty',
    width: 100,
  }, {
    title: this.msg('whseNetWt'),
    dataIndex: 'stock_netwt',
    width: 100,
  }, {
    title: this.msg('whseAmount'),
    dataIndex: 'stock_amount',
    width: 100,
  }, {
    title: this.msg('traceId'),
    dataIndex: 'trace_id',
    width: 100,
  }, {
    title: this.msg('location'),
    dataIndex: 'location',
    width: 100,
  }, {
    title: this.msg('serialNo'),
    dataIndex: 'serial_no',
    width: 100,
  }]
  expandedRowRender = (row) => {
    const entrylist = this.props.entrydiffs.filter(erd => erd.ftz_ent_detail_id === row.ftz_ent_detail_id);
    for (let i = 0; i < entrylist.length; i++) {
      const el = entrylist[i];
      el.key = `${el.asn_no}${el.asn_seq_no}`;
      const ins = this.props.inbounddiffs.filter(ibd => ibd.asn_no === el.asn_no && ibd.asn_seq_no === el.asn_seq_no);
      if (ins.length > 1) {
        el.children = ins;
      } else if (ins.length === 1) {
        el.trace_id = ins[0].trace_id;
        el.location = ins[0].location;
        el.serial_no = ins[0].serial_no;
      }
    }
    return <Table columns={this.expColumns} dataSource={entrylist} rowKey="key" noBorder />;
  }
  handleExportExcel = () => {
    const csvData = [];
    this.props.diffviews.forEach((dv) => {
      const out = {};
      const entrylist = this.props.entrydiffs.filter(erd => erd.ftz_ent_detail_id === dv.ftz_ent_detail_id);
      for (let i = 0; i < entrylist.length; i++) {
        const el = entrylist[i];
        const ins = this.props.inbounddiffs.filter(ibd => ibd.asn_no === el.asn_no && ibd.asn_seq_no === el.asn_seq_no);
        for (let j = 0; j < ins.length; j++) {
          const inb = ins[j];
          out[this.msg('billNo')] = dv.ftz_ent_no;
          out[this.msg('detailId')] = dv.ftz_ent_detail_id;
          out[this.msg('hsCode')] = dv.hscode;
          out[this.msg('gName')] = dv.name;
          out[this.msg('cargoType')] = this.columns[4].render(dv.portion);
          out[this.msg('ftzStockQty')] = dv.ftz_qty;
          out[this.msg('ftzNetWt')] = dv.ftz_net_wt;
          out[this.msg('ftzAmount')] = dv.ftz_amount;
          out[this.msg('productNo')] = el.product_no;
          out[this.msg('whseStockQty')] = el.stock_qty;
          out[this.msg('whseNetWt')] = el.stock_netwt;
          out[this.msg('whseAmount')] = el.stock_amount;
          out['库位数量'] = inb.stock_qty;
          out[this.msg('location')] = inb.location;
          csvData.push(out);
        }
      }
    });
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets.Sheet1 = XLSX.utils.json_to_sheet(csvData);
    FileSaver.saveAs(new window.Blob([string2Bytes(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }),
      'shftz_stock_compare.xlsx');
  }
  render() {
    return (
      <div className="table-panel table-fixed-layout">
        <DataTable scrollOffset={390} rowKey="id" noBorder expandedRowRender={this.expandedRowRender}
          columns={this.columns} dataSource={this.props.diffviews} toolbarActions={[
            <Button size="large" icon="export" disabled={!this.props.diffviews.length > 0} onClick={this.handleExportExcel}>
              {this.msg('export')}
            </Button>,
          ]}
        />
      </div>
    );
  }
}
