import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import FileSaver from 'file-saver';
import XLSX from 'xlsx';
import { Breadcrumb, Button, Card, Select, Layout, message, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadFtzStocks, loadParams } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import ModuleMenu from '../menu';
import QueryForm from './queryForm';
import { formatMsg } from './message.i18n';

const { Sider, Header, Content } = Layout;
const Option = Select.Option;

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
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZStockList extends React.Component {
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
  componentDidMount() {
    if (this.props.owners[0]) {
      const filter = { ownerCode: this.props.owners[0].customs_code, entNo: '' };
      this.handleStockQuery(filter);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.owners !== this.props.owners) {
      if (nextProps.owners[0]) {
        const filter = { ownerCode: nextProps.owners[0].customs_code, entNo: '' };
        this.handleStockQuery(filter);
      } else {
        const filter = { ...this.state.filter, ownerCode: '', entNo: '' };
        this.setState({ filter });
      }
    }
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
    width: 180,
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

  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    message.info('当前仓库已切换');
  }
  handleStockQuery = (filters) => {
    const filter = { ...filters,
      cus_whse_code: this.props.defaultWhse.customs_whse_code,
      whse_code: this.props.defaultWhse.code,
      tenantId: this.props.tenantId };
    this.props.loadFtzStocks(filter);
    this.setState({ selectedRowKeys: [], filter });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.state.filter, ...searchForm };
    this.handleStockQuery(filter);
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

  handleExportExcel = () => {
    const titleMap = new Map();
    this.columns.forEach((col) => { titleMap.set(col.dataIndex, col.title); });
    const csvData = [];
    this.props.stockDatas.forEach((dt) => {
      const out = {};
      Object.keys(dt).forEach((key) => {
        if (titleMap.get(key)) {
          out[titleMap.get(key)] = dt[key];
        }
      });
      csvData.push(out);
    });
    const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets.Sheet1 = XLSX.utils.json_to_sheet(csvData);
    FileSaver.saveAs(new window.Blob([this.s2ab(XLSX.write(wb, wopts))], { type: 'application/octet-stream' }), 'shftzStocks.xlsx');
  }
  render() {
    const { defaultWhse, whses } = this.props;
    const bondedWhses = whses.filter(wh => wh.bonded);
    const columns = this.columns;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };

    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                  上海自贸区监管
                </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="stock" />
          </div>
        </Sider>
        <Layout>
          <Header className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select size="large" value={defaultWhse.code} placeholder="选择仓库" style={{ width: 160 }} onSelect={this.handleWhseChange}>
                  {bondedWhses.map(warehouse => (<Option value={warehouse.code} key={warehouse.code}>{warehouse.name}</Option>))}
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                监管库存查询
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="page-header-tools">
              <Button size="large" icon="export" disabled={!this.props.stockDatas.length > 0} onClick={this.handleExportExcel}>
                {this.msg('export')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <Card noHovering bodyStyle={{ paddingBottom: 8 }}>
              <QueryForm onSearch={this.handleSearch} filter={this.state.filter} />
            </Card>
            <DataTable selectedRowKeys={this.state.selectedRowKeys} scrollOffset={390} loading={this.props.loading}
              columns={columns} dataSource={this.props.stockDatas} rowSelection={rowSelection} rowKey="id"
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
