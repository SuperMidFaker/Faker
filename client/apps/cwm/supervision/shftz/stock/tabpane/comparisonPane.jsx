import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(state => ({
  views: state.cwmShFtzStock.compareTask.views,
}))
export default class FTZComparisonPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state= { selectedRowKeys: [] }
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
    render: por => (por ? '可分拨' : '非分拨'),
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

  render() {
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataPane
        columns={this.columns}
        rowSelection={rowSelection}
        selectedRowKeys={this.state.selectedRowKeys}
        dataSource={this.props.views}
        rowKey="id"
      />
    );
  }
}
