import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Layout, Table, Tooltip, Button, Input, Breadcrumb, Tabs, Form, Tag, Icon } from 'antd';
import WarehouseModal from './modal/warehouseModal';
import OwnersPane from './tabpane/ownersPane';
import ZoneLocationPane from './tabpane/zoneLocationPane';
import SupervisionPane from './tabpane/supervisionPane';
import EditWhseModal from './modal/editWarehouseModal';
import { showWarehouseModal, loadZones, loadLocations, showEditWhseModal, clearLocations } from 'common/reducers/cwmWarehouse';
import { searchWhse, loadWhseContext } from 'common/reducers/cwmContext';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    whses: state.cwmContext.whses,
    zoneList: state.cwmWarehouse.zoneList,
    locations: state.cwmWarehouse.locations,
    locationLoading: state.cwmWarehouse.locationLoading,
  }),
  { showWarehouseModal, loadZones, loadLocations, showEditWhseModal, searchWhse, loadWhseContext, clearLocations }
)
@Form.create()
export default class WarehouseList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    collapsed: false,
    currentPage: 1,
    warehouse: {},
    warehouses: [],
    zoneName: '',
    zoneCode: '',
    visible: false,
  }
  componentWillMount() {
    this.setState({
      warehouse: this.props.whses.length === 0 ? {} : this.props.whses[0],
    });
    if (this.props.whses.length !== 0) {
      this.setState({ warehouses: this.props.whses });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whses !== this.props.whses) {
      const warehouse = nextProps.whses.find(whse => whse.code === this.state.warehouse.code) || {};
      this.setState({
        warehouses: nextProps.whses,
        warehouse,
      });
    }
  }
  componentWillUnmount() {
    this.props.loadWhseContext(this.props.tenantId);
  }
  msg = formatMsg(this.props.intl)
  showWarehouseModal = () => {
    this.props.showWarehouseModal();
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handleRowClick = (record) => {
    this.setState({
      warehouse: record,
    });
    this.props.loadZones(record.code, this.props.tenantId).then(
      (result) => {
        if (!result.error && result.data.length !== 0) {
          this.props.loadLocations(this.state.warehouse.code, result.data[0].zone_code, this.props.tenantId);
          this.setState({
            zone: result.data[0],
            zones: result.data,
            selectKeys: [result.data[0].zone_code],
          });
        } else {
          this.props.clearLocations();
        }
      }
    );
  }
  handleEditWarehouse = () => {
    this.props.showEditWhseModal();
  }
  handleSearchWhse = (e) => {
    this.props.searchWhse(e.target.value, this.props.tenantId);
  }
  render() {
    const { warehouse, warehouses } = this.state;
    const whseColumns = [{
      dataIndex: 'name',
      key: 'name',
      render: (o, record) => (<div className="menu-sider-item">{o} ({record.code}) <span className="pull-right">{record.bonded === 1 ? <Tag>保税仓</Tag> : <Tag>非保税仓</Tag>}</span></div>),
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                设置
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                仓库
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title="添加仓库">
                <Button type="primary" shape="circle" icon="plus" onClick={this.showWarehouseModal} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search placeholder={this.msg('searchPlaceholder')} size="large" onChange={this.handleSearchWhse} />
            </div>
            <div className="list-body">
              <Table size="middle" columns={whseColumns} dataSource={warehouses} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15 }}
                rowClassName={record => record.code === warehouse.code ? 'table-row-selected' : ''} rowKey="id"
              />
            </div>
            <WarehouseModal />
            <EditWhseModal warehouse={warehouse} />
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {warehouse.name} ({warehouse.code}) {warehouse.bonded === 1 && <Tag color="green">保税仓</Tag>}
              </Breadcrumb.Item>
            </Breadcrumb>
            <a onClick={this.handleEditWarehouse}><Icon type="edit" /></a>
          </Header>
          <Content className="main-content">
            <div className="page-body tabbed">
              <Tabs defaultActiveKey="owners">
                <TabPane tab="货主" key="owners">
                  <OwnersPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
                </TabPane>
                <TabPane tab="库区/库位" key="location">
                  <ZoneLocationPane warehouse={warehouse} />
                </TabPane>
                <TabPane tab="月台" key="dock" disabled />
                {warehouse.bonded && <TabPane tab="保税监管" key="supervision">
                  <SupervisionPane whseCode={warehouse.code} ftzAppId={warehouse.ftz_integration_app_id} />
                </TabPane>}
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
