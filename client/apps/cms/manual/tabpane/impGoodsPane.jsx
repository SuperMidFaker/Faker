import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Input } from 'antd';
import DataPane from 'client/components/DataPane';
import TrimSpan from 'client/components/trimSpan';
import { loadManualGoods } from 'common/reducers/cmsTradeManual';
import { DELG_EXEMPTIONWAY } from 'common/constants';

const Search = Input.Search;

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
    searchValue: '',
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
  handleLoad = () => {
    this.props.loadManualGoods(this.props.manualNo, 'IMG').then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  columns = [{
    title: '序号',
    dataIndex: 'em_g_no',
    width: 45,
  }, {
    title: '商品编码',
    dataIndex: 'code_s',
    width: 80,
  }, {
    title: '附加编码',
    dataIndex: 'code_t',
    width: 80,
  }, {
    title: '商品名称',
    dataIndex: 'g_name',
    width: 200,
  }, {
    title: '规格型号',
    dataIndex: 'g_model',
    width: 250,
  }, {
    title: '计量单位',
    dataIndex: 'g_unit',
    width: 100,
    render: o => <TrimSpan text={this.props.units.find(u => u.value === o) && this.props.units.find(u => u.value === o).text} />,
  }, {
    title: '法定计量单位',
    dataIndex: 'unit_1',
    width: 100,
    render: o => <TrimSpan text={this.props.units.find(u => u.value === o) && this.props.units.find(u => u.value === o).text} />,
  }, {
    title: '申报数量',
    dataIndex: 'dec_qty',
    width: 100,
  }, {
    title: '申报单价',
    dataIndex: 'dec_price',
    width: 100,
  }, {
    title: '申报总价',
    dataIndex: 'dec_amount',
    width: 100,
  }, {
    title: '币制',
    dataIndex: 'currency',
    width: 100,
    render: o => <TrimSpan text={this.props.currencies.find(cu => cu.value === o) && this.props.currencies.find(cu => cu.value === o).text} />,
  }, {
    title: '产销国',
    width: 100,
    dataIndex: 'country',
    render: o => <TrimSpan text={this.props.countries.find(co => co.value === o) && this.props.countries.find(co => co.value === o).text} />,
  }, {
    title: '征免方式',
    width: 100,
    dataIndex: 'duty_mode',
    render: o => <TrimSpan text={DELG_EXEMPTIONWAY.find(way => way.value === o) && DELG_EXEMPTIONWAY.find(way => way.value === o).text} />,
  }, {
    title: '征税比例',
    width: 100,
    dataIndex: 'duty_rate',
  }, {
    title: '备注',
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
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowSelection={rowSelection} indentSize={0}
        dataSource={dataSource} rowKey="id" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Search placeholder="商品编码" style={{ width: 200 }} onSearch={this.handleSearch} />
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
