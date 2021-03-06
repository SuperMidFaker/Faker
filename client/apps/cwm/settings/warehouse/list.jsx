import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Layout, Table, Tooltip, Button, Breadcrumb, Tabs, Form, Tag, Icon } from 'antd';
import { showWarehouseModal, loadZones, loadLocations, showEditWhseModal, clearLocations } from 'common/reducers/cwmWarehouse';
import { searchWhse, loadWhseContext } from 'common/reducers/cwmContext';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import MagicCard from 'client/components/MagicCard';
import WarehouseModal from './modal/warehouseModal';
import OwnersPane from './tabpane/ownersPane';
import SuppliersPane from './tabpane/suppliersPane';
import ReceiversPane from './tabpane/receiversPane';
import CarriersPane from './tabpane/carriersPane';
import StaffsPane from './tabpane/staffsPane';
import ZoneLocationPane from './tabpane/zoneLocationPane';
import BrokersPane from './tabpane/brokersPane';
import SupervisionPane from './tabpane/supervisionPane';
import EditWhseModal from './modal/editWarehouseModal';
import { formatMsg } from './message.i18n';

const { Content, Sider } = Layout;

const { TabPane } = Tabs;

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
@connect(
  state => ({
    loginId: state.account.loginId,
    whses: state.cwmContext.whses,
    zoneList: state.cwmWarehouse.zoneList,
    locationLoading: state.cwmWarehouse.locationLoading,
  }),
  {
    showWarehouseModal,
    loadZones,
    loadLocations,
    showEditWhseModal,
    searchWhse,
    loadWhseContext,
    clearLocations,
  }
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
    this.props.loadWhseContext();
  }
  msg = formatMsg(this.props.intl)
  showWarehouseModal = () => {
    this.props.showWarehouseModal();
  }
  handleRowClick = (record) => {
    this.setState({
      warehouse: record,
    });
    this.props.loadZones(record.code).then((result) => {
      if (!result.error && result.data.length !== 0) {
        this.props.loadLocations(this.state.warehouse.code, result.data[0].zone_code);
      } else {
        this.props.clearLocations();
      }
    });
  }
  handleEditWarehouse = () => {
    this.props.showEditWhseModal(this.state.warehouse);
  }
  handleSearchWhse = (value) => {
    this.props.searchWhse(value);
  }
  render() {
    const { warehouse, warehouses } = this.state;
    const whseColumns = [{
      dataIndex: 'name',
      key: 'name',
      render: (o, record) => (<div className="menu-sider-item">{o} ({record.code}) <span className="pull-right">{record.bonded === 1 ? <Tag>保税仓</Tag> : <Tag>非保税仓</Tag>}</span></div>),
    }];
    const tabs = [];
    tabs.push(<TabPane tab="货主" key="owners">
      <OwnersPane
        whseCode={warehouse.code}
        whseName={warehouse.name}
        whseTenantId={warehouse.wh_ent_tenant_id}
        warehouse={warehouse}
      />
    </TabPane>);
    tabs.push(<TabPane tab="供货商" key="suppliers">
      <SuppliersPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
    </TabPane>);
    tabs.push(<TabPane tab="收货人" key="receivers">
      <ReceiversPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
    </TabPane>);
    tabs.push(<TabPane tab="承运人" key="carriers">
      <CarriersPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
    </TabPane>);
    tabs.push(<TabPane tab="库区/库位" key="location">
      <ZoneLocationPane warehouse={warehouse} />
    </TabPane>);
    tabs.push(<TabPane tab="员工" key="staffs">
      <StaffsPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
    </TabPane>);
    if (warehouse.bonded) {
      tabs.push(<TabPane tab="报关代理" key="brokers">
        <BrokersPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
      </TabPane>);
    }
    if (warehouse.bonded) {
      tabs.push(<TabPane tab="保税监管" key="supervision">
        <SupervisionPane
          whseCode={warehouse.code}
          ftzAppId={warehouse.ftz_integration_app_id}
          customsCode={warehouse.customs_code}
        />
      </TabPane>);
    }
    return (
      <Layout>
        <Sider
          width={320}
          className="menu-sider"
          key="sider"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="page-header">
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
              <SearchBox placeholder={this.msg('warehousePlaceholder')} onSearch={this.handleSearchWhse} />
            </div>
            <div className="list-body">
              <Table
                size="middle"
                columns={whseColumns}
                dataSource={warehouses}
                showHeader={false}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15 }}
                rowClassName={record => (record.code === warehouse.code ? 'table-row-selected' : '')}
                rowKey="id"
                onRow={record => ({
                  onClick: () => { this.handleRowClick(record); },
                })}
              />
            </div>
            <WarehouseModal />
            <EditWhseModal />
          </div>
        </Sider>
        <Layout>
          <PageHeader
            breadcrumb={[
              <span>{warehouse.name} ({warehouse.code}) {warehouse.bonded === 1 && <Tag color="green">保税仓</Tag>}</span>,
              <a onClick={this.handleEditWarehouse}><Icon type="edit" /></a>,
            ]}
          />
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="owners">
                {tabs}
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
