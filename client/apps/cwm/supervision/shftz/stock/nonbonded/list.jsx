import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Layout, Tag, notification } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadNonbondedStocks, loadParams } from 'common/reducers/cwmShFtz';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import SearchBox from 'client/components/SearchBox';
import PageHeader from 'client/components/PageHeader';
import ModuleMenu from '../../menu';
import QueryForm from './queryForm';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;

@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    defaultWhse: state.cwmContext.defaultWhse,
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
  { loadNonbondedStocks, loadParams, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class SHFTZNonBondedStockList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    stockDatas: PropTypes.array.isRequired,
  }
  state = {
    filter: { ownerCode: '', entNo: '', whse_code: '' },
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadParams();
  }
  onSearch = (product) => {
    const filter = { ...this.state.filter, product };
    this.handleStockQuery(filter);
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('owner'),
    dataIndex: 'owner_name',
    width: 150,
    fixed: 'left',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('productNo'),
    width: 120,
    dataIndex: 'product_no',
  }, {
    title: this.msg('hsCode'),
    width: 120,
    dataIndex: 'hscode',
  }, {
    title: this.msg('gName'),
    width: 120,
    dataIndex: 'name',
  }, {
    title: this.msg('ftzEntNo'),
    dataIndex: 'ftz_ent_no',
    width: 180,
  }, {
    title: this.msg('ftzRelNo'),
    dataIndex: 'ftz_rel_no',
    width: 180,
  }, {
    title: this.msg('进境报关单号'),
    width: 180,
    dataIndex: 'ent_cus_decl_no',
  }, {
    title: this.msg('出区报关单号'),
    width: 180,
    dataIndex: 'rel_cus_decl_no',
  }, {
    title: this.msg('detailId'),
    dataIndex: 'ftz_ent_detail_id',
    width: 100,
  }, {
    title: this.msg('qty'),
    width: 120,
    dataIndex: 'qty',
  }, {
    title: this.msg('stockQty'),
    dataIndex: 'stock_qty',
    width: 150,
  }, {
    title: this.msg('cQty'),
    width: 120,
    dataIndex: 'outbound_qty',
  }, {
    title: this.msg('sQty'),
    width: 120,
    dataIndex: 'locked_qty',
  }, {
    title: this.msg('nWeight'),
    width: 120,
    dataIndex: 'net_wt',
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
    title: this.msg('gWeight'),
    width: 120,
    dataIndex: 'gross_wt',
  }, {
    title: this.msg('money'),
    width: 120,
    dataIndex: 'amount',
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
  }, {
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
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
  }]

  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
    notification.info({ message: '当前仓库已切换' });
  }
  handleStockQuery = (filters) => {
    const filter = { ...filters, whseCode: this.props.defaultWhse.code };
    this.props.loadNonbondedStocks(filter).then((result) => {
      if (result.error) {
        if (result.error.message === 'WHSE_FTZ_UNEXIST') {
          notification.error({
            message: '操作失败',
            description: '仓库监管系统未配置',
          });
        } else {
          notification.error({
            message: '操作失败',
            description: result.error.message,
            duration: 15,
          });
        }
      }
    });
    this.setState({ selectedRowKeys: [], filter });
  }
  handleSearch = (searchForm) => {
    const filter = { ...this.state.filter, ...searchForm };
    this.handleStockQuery(filter);
  }
  render() {
    const columns = this.columns;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox placeholder="货号/商品编码" onSearch={this.onSearch} />
    </span>);
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
            <ModuleMenu currentKey="nonbonded" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  非保监管库存
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button icon="export" disabled={!this.props.stockDatas.length > 0} onClick={this.handleExportExcel}>
                {this.msg('export')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <Card bodyStyle={{ paddingBottom: 8 }}>
              <QueryForm onSearch={this.handleSearch} filter={this.state.filter} />
            </Card>
            <DataTable
              toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys}
              scrollOffset={390}
              loading={this.props.loading}
              columns={columns}
              dataSource={this.props.stockDatas}
              rowSelection={rowSelection}
              rowKey="id"
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
