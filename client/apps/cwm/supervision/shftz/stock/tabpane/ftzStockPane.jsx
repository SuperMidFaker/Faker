import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Tag } from 'antd';
import { loadFtzStocks, loadParams } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
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
export default class FTZStockPane extends React.Component {
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
    title: this.msg('owner'),
    dataIndex: 'owner_name',
    width: 150,
    fixed: 'left',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('billNo'),
    dataIndex: 'ftz_ent_no',
    width: 200,
  }, {
    title: this.msg('cusNo'),
    width: 180,
    dataIndex: 'cus_decl_no',
  }, {
    title: this.msg('detailId'),
    dataIndex: 'ftz_ent_detail_id',
    width: 100,
  }, {
    title: this.msg('stockQty'),
    dataIndex: 'stock_qty',
    width: 150,
  }, {
    title: this.msg('qty'),
    width: 120,
    dataIndex: 'qty',
  }, {
    title: this.msg('money'),
    width: 120,
    dataIndex: 'amount',
  }, {
    title: this.msg('gWeight'),
    width: 120,
    dataIndex: 'gross_wt',
  }, {
    title: this.msg('nWeight'),
    width: 120,
    dataIndex: 'net_wt',
  }, {
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
  }, {
    title: this.msg('tag'),
    width: 120,
    dataIndex: 'tag',
  }, {
    title: this.msg('orgCargoId'),
    width: 120,
    dataIndex: 'ftz_cargo_no',
  }, {
    title: this.msg('hsCode'),
    width: 120,
    dataIndex: 'hscode',
  }, {
    title: this.msg('gName'),
    width: 120,
    dataIndex: 'name',
  }, {
    title: this.msg('model'),
    width: 120,
    dataIndex: 'model',
  }, {
    title: this.msg('unit'),
    width: 120,
    dataIndex: 'unit',
    render: (o) => {
      const unit = this.props.units.filter(cur => cur.value === o)[0];
      const text = unit ? `${unit.value}| ${unit.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: this.msg('curr'),
    width: 120,
    dataIndex: 'currency',
    render: (o) => {
      const currency = this.props.currencies.filter(cur => cur.value === o)[0];
      const text = currency ? `${currency.value}| ${currency.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: this.msg('country'),
    width: 120,
    dataIndex: 'country',
    render: (o) => {
      const country = this.props.tradeCountries.filter(cur => cur.value === o)[0];
      const text = country ? `${country.value}| ${country.text}` : o;
      return text && text.length > 0 && <Tag>{text}</Tag>;
    },
  }, {
    title: this.msg('cargoType'),
    width: 120,
    dataIndex: 'cargo_type',
    render: (type) => {
      let text = '';
      if (type) {
        text = type === '13' ? '非分拨货物' : '分拨货物';
      }
      return <Tag>{text}</Tag>;
    },
  }, {
    title: this.msg('cQty'),
    width: 120,
    dataIndex: 'outbound_qty',
  }, {
    title: this.msg('sQty'),
    width: 120,
    dataIndex: 'locked_qty',
  }, {
    title: this.msg('stockWeight'),
    width: 120,
    dataIndex: 'stock_wt',
  }, {
    title: this.msg('cWeight'),
    width: 120,
    dataIndex: 'outbound_wt',
  }, {
    title: this.msg('sWeight'),
    width: 120,
    dataIndex: 'locked_wt',
  }, {
    title: this.msg('stockMoney'),
    width: 120,
    dataIndex: 'stock_amount',
  }, {
    title: this.msg('cMoney'),
    width: 120,
    dataIndex: 'outbound_amount',
  }, {
    title: this.msg('sMoney'),
    width: 120,
    dataIndex: 'locked_amount',
  }, {
    title: this.msg('usdMoney'),
    width: 120,
    dataIndex: 'amount_usd',
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
