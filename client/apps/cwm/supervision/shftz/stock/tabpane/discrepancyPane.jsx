import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table } from 'antd';
import DataTable from 'client/components/DataTable';
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
  render() {
    return (
      <div className="table-panel table-fixed-layout">
        <DataTable scrollOffset={390} rowKey="id" noBorder expandedRowRender={this.expandedRowRender}
          columns={this.columns} dataSource={this.props.diffviews}
        />
      </div>
    );
  }
}
