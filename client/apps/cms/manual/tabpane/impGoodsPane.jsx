import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import SearchBox from 'client/components/SearchBox';
import DataPane from 'client/components/DataPane';
import { loadManualGoods } from 'common/reducers/cmsTradeManual';
import { DELG_EXEMPTIONWAY } from 'common/constants';

import { formatMsg } from '../message.i18n';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    units: state.cmsManifest.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    countries: state.cmsManifest.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    currencies: state.cmsManifest.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
      rate_cny: cr.rate_CNY,
    })),
  }),
  { loadManualGoods }
)
export default class ImpGoodsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    manualNo: PropTypes.string.isRequired,
  }
  state = {
    loading: false,
    dataSource: [],
  }
  componentWillMount() {
    this.handleLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleLoad();
    }
  }
  msg = formatMsg(this.props.intl)
  handleLoad = () => {
    this.props.loadManualGoods(this.props.manualNo, 'IMG').then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  handleSearch = () => {
    // this.setState({ searchValue: value });
  }
  columns = [{
    title: this.msg('no'),
    dataIndex: 'em_g_no',
    width: 45,
  }, {
    title: this.msg('codeS'),
    dataIndex: 'code_s',
    width: 80,
  }, {
    title: this.msg('codeT'),
    dataIndex: 'code_t',
    width: 80,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: this.msg('model'),
    dataIndex: 'g_model',
    width: 250,
  }, {
    title: this.msg('unit'),
    dataIndex: 'g_unit',
    width: 100,
    render: o => this.props.units.find(u => u.value === o) &&
       this.props.units.find(u => u.value === o).text,
  }, {
    title: this.msg('unit1'),
    dataIndex: 'unit_1',
    width: 100,
    render: o => this.props.units.find(u => u.value === o) &&
       this.props.units.find(u => u.value === o).text,
  }, {
    title: this.msg('decQty'),
    dataIndex: 'dec_qty',
    width: 100,
  }, {
    title: this.msg('decPrice'),
    dataIndex: 'dec_price',
    width: 100,
  }, {
    title: this.msg('decAmount'),
    dataIndex: 'dec_amount',
    width: 100,
  }, {
    title: this.msg('currency'),
    dataIndex: 'currency',
    width: 100,
    render: o => this.props.currencies.find(cu => cu.value === o) &&
       this.props.currencies.find(cu => cu.value === o).text,
  }, {
    title: this.msg('country'),
    width: 100,
    dataIndex: 'country',
    render: o => this.props.countries.find(co => co.value === o) &&
       this.props.countries.find(co => co.value === o).text,
  }, {
    title: this.msg('dutyMode'),
    width: 100,
    dataIndex: 'duty_mode',
    render: o => DELG_EXEMPTIONWAY.find(way => way.value === o) &&
       DELG_EXEMPTIONWAY.find(way => way.value === o).text,
  }, {
    title: this.msg('dutyRate'),
    width: 100,
    dataIndex: 'duty_rate',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  render() {
    const { dataSource } = this.state;
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
        indentSize={0}
        dataSource={dataSource}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder={this.msg('codeT')} onSearch={this.handleSearch} />
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
