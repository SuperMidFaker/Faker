import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Breadcrumb, Layout, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import SearchBar from 'client/components/SearchBar';
import PageHeader from 'client/components/PageHeader';
import { loadTradeParams } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import ModuleMenu from '../menu';
import makeColumns from './commonCols';
import { formatMsg } from '../message.i18n';


const { Sider, Content } = Layout;

function fetchData({ dispatch }) {
  const promises = [];
  promises.push(dispatch(loadTradeParams()));
  return Promise.all(promises);
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cmsTradeitem.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  { loadTradeParams }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class InvalidItemsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.asnlist.loaded && !nextProps.asnlist.loading) {
      // this.handleListReload();
    }
  }
  msg = formatMsg(this.props.intl)
  columns = makeColumns(this.msg, this.props.units, this.props.tradeCountries, this.props.currencies).concat([{
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
  }])
  handleStatusChange = (ev) => {
    const filters = { ...this.props.filters, status: ev.target.value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: this.props.asnlist.current,
      filters,
    });
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading } = this.props;
    const mockData = [{
      cop_product_no: 'H345HE455',
      biz_type: '清关',
      biz_seq_no: 'ID170923455',
      rec_pay: '收',
      fee_category: '报关费',
      fee: '联单费',
      fee_type: '服务费',
      amount_rmb: 250.00,
    }, {
      cop_product_no: 'YTRWE987653',
      biz_type: '清关',
      biz_seq_no: 'ID170923455',
      rec_pay: '收',
      fee_category: '报关费',
      fee: '联单费',
      fee_type: '服务费',
      amount_rmb: 250.00,
    }, {
      cop_product_no: 'JDY3RIUJHD',
      biz_type: '清关',
      biz_seq_no: 'ID170923455',
      rec_pay: '收',
      fee_category: '报关费',
      fee: '联单费',
      fee_type: '服务费',
      amount_rmb: 250.00,
    }];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    /*
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadAsnLists(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, tblfilters) => {
        const newfilters = { ...this.props.filters, ...tblfilters[0] };
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          current: pagination.current,
          filters: newfilters,
        };
        return params;
      },
      remotes: this.props.asnlist,
    });
    */
    const toolbarActions = (<span>
      <Select showSearch placeholder="所属物料库" optionFilterProp="children" style={{ width: 160 }}
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
      />
      <SearchBar placeholder={this.msg('商品货号/HS编码/品名')} onInputSearch={this.handleSearch} />
    </span>);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('tradeitem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="invalid" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('taskInvalid')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button icon="file-excel">导出</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}
              columns={this.columns} dataSource={mockData} rowSelection={rowSelection} rowKey="cop_product_no" loading={loading}
              locale={{ emptyText: '当前没有新的料件' }}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
