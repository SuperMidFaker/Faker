import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Menu } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadWarehouses, openAddWarehouseModal } from 'common/reducers/scvWarehouse';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import connectNav from 'client/common/decorators/connect-nav';
import AddWarehouseModal from './addWarehouseModal';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
function fetchData({ state, dispatch }) {
  return dispatch(loadWarehouses({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.scvWarehouse.listFilter),
    sorter: JSON.stringify(state.scvWarehouse.sortFilter),
    pageSize: state.scvWarehouse.list.pageSize,
    current: state.scvWarehouse.list.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    reload: state.scvWarehouse.reload,
    loading: state.scvWarehouse.loading,
    warehouselist: state.scvWarehouse.list,
    listFilter: state.scvWarehouse.listFilter,
    sortFilter: state.scvWarehouse.sortFilter,
  }),
  { openAddWarehouseModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class SCVWarehouseList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('warehouseName'),
    dataIndex: 'wh_name',
    width: 200,
  }, {
    title: this.msg('warehouseCode'),
    width: 160,
    dataIndex: 'wh_no',
    /*
  }, {
    title: this.msg('warehouseType'),
    dataIndex: 'wh_type',
    width: 160,
    */
  }, {
    title: this.msg('warehouseOperator'),
    dataIndex: 'operator_name',
    width: 300,
  }, {
    title: this.msg('isBonded'),
    width: 120,
    dataIndex: 'is_bonded',
  }, {
    title: this.msg('warehouseLocation'),
    dataIndex: 'wh_location',
    /*
  }, {
    title: this.msg('wmsIntegration'),
    width: 120,
    dataIndex: 'wh_integration',
  }, {
    title: this.msg('opColumn'),
    width: 160,
    */
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadWarehouses(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: JSON.stringify({
          sortField: sorter.field, sortOrder: sorter.order,
        }),
      };
      const filter = { ...this.props.listFilter };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.warehouselist,
  })
  handleAddWarehouse = () => {
    this.props.openAddWarehouseModal();
  }
  render() {
    const { loading, warehouselist } = this.props;
    this.dataSource.remotes = warehouselist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('inventoryWarehouse')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu defaultSelectedKeys={['warehouse']} mode="inline">
                  <Menu.Item key="warehouse"><NavLink to="/scv/resources/warehouse">仓库</NavLink></Menu.Item>
                  <Menu.Item key="broker" disabled><NavLink to="/scv/resources/broker">报关行</NavLink></Menu.Item>
                  <Menu.Item key="forwarder" disabled><NavLink to="/scv/resources/forwarder">货代</NavLink></Menu.Item>
                  <Menu.Item key="supplier" disabled><NavLink to="/scv/resources/supplier">供应商</NavLink></Menu.Item>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <div className="toolbar">
                  <Button type="primary" size="large" icon="plus" onClick={this.handleAddWarehouse}>
                    {this.msg('addWarehouse')}
                  </Button>
                </div>
                <div className="panel-body table-panel">
                  <Table columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="wh_no" scroll={{ x: 1200 }} />
                </div>
              </Content>
            </Layout>
          </div>
          <AddWarehouseModal />
        </Content>
      </QueueAnim>
    );
  }
}
