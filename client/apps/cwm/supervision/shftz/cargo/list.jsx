import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Icon, Input, Layout, Radio, Select, message } from 'antd';
import { loadSkusByWarehouse } from 'common/reducers/cwmSku';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/search-bar';
import ButtonToggle from 'client/components/ButtonToggle';
import NavLink from 'client/components/nav-link';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

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
    tenantId: state.account.tenantId,
    loading: state.cwmSku.loading,
    skulist: state.cwmSku.list,
    listFilter: state.cwmSku.listFilter,
    sortFilter: state.cwmSku.sortFilter,
  }),
  { loadSkusByWarehouse }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class ProductMappingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    rightSiderCollapsed: true,
    selectedRowKeys: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('shipperOwner'),
    dataIndex: 'owner_name',
    width: 160,
  }, {
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
  handleSyncProducts = () => {
  }
  render() {
    const { skulist, loading } = this.props;
    this.dataSource.remotes = skulist;
    const columns = [{
      dataIndex: 'owner_code',
      key: 'owner_name',
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" >
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <NavLink to="/cwm/supervision/shftz">
                    <Icon type="left" /> 上海自贸区监管
                  </NavLink>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {this.msg('ftzCargoReg')}
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
              <Table columns={columns} showHeader={false} />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Select
                  size="large"
                  defaultValue="0961"
                  placeholder="选择仓库"
                  style={{ width: 160 }}
                  disabled
                >
                  <Option value="0960">物流大道仓库</Option>
                  <Option value="0961">希雅路仓库</Option>
                  <Option value="0962">富特路仓库</Option>
                </Select>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                货主
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {'owner.name'}
              </Breadcrumb.Item>
            </Breadcrumb>
            <RadioGroup defaultValue="pending" onChange={this.handleBondedChange} size="large">
              <RadioButton value="pending">待备案</RadioButton>
              <RadioButton value="sent">已发送</RadioButton>
              <RadioButton value="completed">备案完成</RadioButton>
            </RadioGroup>
            <div className="top-bar-tools">
              <Button type="primary" ghost size="large" icon="sync" onClick={this.handleSyncProducts}>
                同步货品信息
              </Button>
              <ButtonToggle size="large"
                iconOn="fork" iconOff="fork"
                onClick={this.toggleRightSider}
              >
                映射规则
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
              <h3>映射规则</h3>
            </div>
          </div>
        </Sider>
      </Layout>
    );
  }
}
