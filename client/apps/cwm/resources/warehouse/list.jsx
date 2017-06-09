import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Menu } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadWarehouses, loadOwnerPartners, openWhseAuthModal, openAddWarehouseModal } from 'common/reducers/scvWarehouse';
import Table from 'client/components/remoteAntTable';
import NavLink from 'client/components/nav-link';
import connectNav from 'client/common/decorators/connect-nav';
import RowUpdater from 'client/components/rowUpdater';
import AddWarehouseModal from './addWarehouseModal';
import WhseAuthModal from './whseAuthModal';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;

function fetchData({ state, dispatch }) {
  const proms = [];
  proms.push(dispatch(loadOwnerPartners(state.account.tenantId)));
  proms.push(dispatch(loadWarehouses({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.scvWarehouse.listFilter),
    sorter: JSON.stringify(state.scvWarehouse.sortFilter),
    pageSize: state.scvWarehouse.list.pageSize,
    current: state.scvWarehouse.list.current,
  })));
  return Promise.all(proms);
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
  { openWhseAuthModal, openAddWarehouseModal, loadWarehouses }
)
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
export default class CWMWarehouseList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.props.loadWarehouses({
        tenantId: nextProps.tenantId,
        filter: JSON.stringify(nextProps.listFilter),
        sorter: JSON.stringify(nextProps.sortFilter),
        pageSize: nextProps.warehouselist.pageSize,
        current: nextProps.warehouselist.current,
      });
    }
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('warehouseName'),
    dataIndex: 'whse_name',
    width: 200,
  }, {
    title: this.msg('warehouseCode'),
    width: 160,
    dataIndex: 'wh_no',
    /*
  }, {
    title: this.msg('warehouseType'),
    dataIndex: 'whse_type',
    width: 160,
    */
  }, {
    title: this.msg('isBonded'),
    width: 120,
    dataIndex: 'is_bonded',
    render: bonded => bonded ? 'YES' : 'NO',
  }, {
    title: this.msg('warehouseLocation'),
    dataIndex: 'wh_location',
    /*
  }, {
    title: this.msg('wmsIntegration'),
    width: 120,
    dataIndex: 'wms_integration',
    */
  }, {
    title: this.msg('opColumn'),
    width: 160,
    render: (text, row) => (
      <span>
        <RowUpdater onHit={this.handleWhseEdit} label={this.msg('whseEdit')} row={row} />
        <span className="ant-divider" />
        <RowUpdater onHit={this.handleWhseAuth} label={this.msg('whseAuth')} row={row} />
      </span>),
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
      showTotal: total => `共 ${total} 条`,
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
  handleWhseAuth = (row) => {
    this.props.openWhseAuthModal(row);
  }
  render() {
    const { loading, warehouselist } = this.props;
    this.dataSource.remotes = warehouselist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('resources')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('warehouse')}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu defaultSelectedKeys={['warehouse']} mode="inline">
                  <Menu.Item key="warehouse"><NavLink to="/cwm/resources/warehouse">仓库</NavLink></Menu.Item>
                  <Menu.Item key="owner" disabled><NavLink to="/cwm/resources/owner">货主</NavLink></Menu.Item>
                  <Menu.Item key="vendor" disabled><NavLink to="/cwm/resources/vendor">供应商</NavLink></Menu.Item>
                  <Menu.Item key="consignee" disabled><NavLink to="/cwm/resources/consignee">收货方</NavLink></Menu.Item>
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
          <WhseAuthModal />
        </Content>
      </QueueAnim>
    );
  }
}
