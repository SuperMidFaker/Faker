import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Input, Layout, Select, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
import ButtonToggle from 'client/components/ButtonToggle';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadSkusByWarehouse } from 'common/reducers/cwmSku';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import { formatMsg } from '../message.i18n';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const Option = Select.Option;

function fetchData({ state, dispatch }) {
  return dispatch(loadSkusByWarehouse({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cwmSku.listFilter),
    sorter: JSON.stringify(state.cwmSku.sortFilter),
    pageSize: state.cwmSku.list.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    owners: state.cwmContext.whseAttrs.owners,
    loading: state.cwmSku.loading,
    skulist: state.cwmSku.list,
    listFilter: state.cwmSku.listFilter,
    sortFilter: state.cwmSku.sortFilter,
  }),
  { loadSkusByWarehouse, switchDefaultWhse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMSkuList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    whses: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string, name: PropTypes.string })),
    owners: PropTypes.arrayOf(PropTypes.shape({
      partner_code: PropTypes.string,
      name: PropTypes.string,
    })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    rightSiderCollapsed: true,
    selectedRowKeys: [],
  }
  msg = formatMsg(this.props.intl)
  ownerColumns = [{
    dataIndex: 'name',
    key: 'owner_name',
    render: (name, row) => row.partner_code ? `${row.partner_code} | ${row.name}` : row.name,
  }]
  columns = [{
    title: 'SKU',
    dataIndex: 'sku_no',
    width: 100,
  }, {
    title: this.msg('productNo'),
    width: 120,
    dataIndex: 'product_no',
  }, {
    title: this.msg('productName'),
    width: 120,
    dataIndex: 'product_name',
  }, {
    title: this.msg('productCategory'),
    width: 120,
    dataIndex: 'product_category',
  }, {
    title: this.msg('productDesc'),
    width: 200,
    dataIndex: 'product_desc',
  }, {
    title: this.msg('productType'),
    width: 100,
    dataIndex: 'product_type',
  }, {
    title: this.msg('opColumn'),
    width: 160,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadSkusByWarehouse(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: JSON.stringify({
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        }),
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.skulist,
  })
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  toggleRightSider = () => {
    this.setState({
      rightSiderCollapsed: !this.state.rightSiderCollapsed,
    });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, sku: value };
    this.props.loadSkusByWarehouse({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(this.props.sortFilter),
      pageSize: this.props.skulist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/cwm/products/sku/create');
  }
  handleWhseChange = (value) => {
    this.props.switchDefaultWhse(value);
  }
  render() {
    const { skulist, whse, whses, owners, loading } = this.props;
    this.dataSource.remotes = skulist;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider">
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Select size="large" value={whse.code} placeholder="选择仓库" style={{ width: 160 }} onChange={this.handleWhseChange}>
                    {whses.map(wh => <Option value={wh.code}>{wh.name}</Option>)}
                  </Select>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {this.msg('productsSku')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder={this.msg('searchPlaceholder')}
                  size="large"
                />
              </div>
              <Table columns={this.ownerColumns} showHeader={false} dataSource={owners} rowKey="id" />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <div className="top-bar-tools">
              <Button size="large" icon="cloud-upload">
                {this.msg('productImport')}
              </Button>
              <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick}>
                {this.msg('createSKU')}
              </Button>
              <ButtonToggle size="large" iconOn="setting" iconOff="setting" onClick={this.toggleRightSider}>
                规则设置
              </ButtonToggle>
            </div>
          </Header>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <SearchBar size="large" placeholder={this.msg('productSearchPlaceholder')} onInputSearch={this.handleSearch} />
              </div>
              <div className="panel-body table-panel">
                <Table columns={this.columns} dataSource={this.dataSource} rowKey="id"
                  scroll={{ x: 1400 }} loading={loading}
                />
              </div>
            </div>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.rightSiderCollapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>包装代码</h3>
            </div>
          </div>
        </Sider>
      </Layout>
    );
  }
}
