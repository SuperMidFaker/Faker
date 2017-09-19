import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { loadFtzStocks, loadParams } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
    state => ({
      whses: state.cwmContext.whses,
      defaultWhse: state.cwmContext.defaultWhse,
      tenantId: state.account.tenantId,
      owners: state.cwmContext.whseAttrs.owners,
      stockDatas: state.cwmShFtz.stockDatas,
      units: state.cwmShFtz.params.units.map(un => ({
        value: un.unit_code,
        text: un.unit_name,
      })),
      currencies: state.cwmShFtz.params.currencies.map(cr => ({
        value: cr.curr_code,
        text: cr.curr_name,
      })),
      tradeCountries: state.cwmShFtz.params.tradeCountries.map(tc => ({
        value: tc.cntry_co,
        text: tc.cntry_name_cn,
      })),
      loading: state.cwmShFtz.loading,
    }),
    { loadFtzStocks, loadParams, switchDefaultWhse }
  )
export default class FTZDiscrepancyPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    stockDatas: PropTypes.array.isRequired,
  }
  state = {
    filter: { ownerCode: '', entNo: '', whse_code: '' },
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadParams();
  }
  msg = formatMsg(this.props.intl);
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
    dataIndex: 'ftz_stock_qty',
    width: 150,
  }, {
    title: this.msg('whseStockqty'),
    width: 120,
    dataIndex: 'whse_stock_qty',
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
        <DataTable selectedRowKeys={this.state.selectedRowKeys} scrollOffset={390} loading={this.props.loading}
          columns={this.columns} dataSource={this.props.stockDatas} rowSelection={rowSelection} rowKey="id" noBorder
        />
      </div>
    );
  }
}
