import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DataTable from 'client/components/DataTable';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
    state => ({
      views: state.cwmShFtz.compareTask.views,
    })
  )
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
    title: this.msg('ftzStockQty'),
    dataIndex: 'ftz_qty',
    width: 150,
  }, {
    title: this.msg('whseStockqty'),
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
      <div className="table-panel table-fixed-layout">
        <DataTable selectedRowKeys={this.state.selectedRowKeys} scrollOffset={390}
          columns={this.columns} dataSource={this.props.views} rowSelection={rowSelection} rowKey="id" noBorder
        />
      </div>
    );
  }
}
