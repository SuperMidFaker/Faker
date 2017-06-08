import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Layout, Table, Tooltip, Button, Input, Breadcrumb, Tabs, Popover, Menu, Form, Tag, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import RowUpdater from 'client/components/rowUpdater';
import messages from '../message.i18n';
import WarehouseModal from './modal/warehouseModal';
import LocationModal from './modal/locationModal';
import MdIcon from 'client/components/MdIcon';
import ZoneEditDropDown from './popover/zoneEditDropdown';
import { showWarehouseModal, loadwhList, addZone, loadZones, showLocationModal, loadLocations, deleteLocation,
  editLocation, deleteZone } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;

function fetchData({ state, dispatch }) {
  return dispatch(loadwhList({
    tenantId: state.account.tenantId,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'cwm',
})
@connect(
  state => ({
    tenantId: state.account.tenanId,
    warehouseList: state.cwmWarehouse.warehouseList,
    zoneList: state.cwmWarehouse.zoneList,
    locations: state.cwmWarehouse.locations,
  }),
  { showWarehouseModal,
    loadwhList,
    addZone,
    loadZones,
    showLocationModal,
    loadLocations,
    deleteLocation,
    editLocation,
    deleteZone }
)
@Form.create()
export default class WareHouse extends Component {
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
    zones: [],
    zone: {},
    selectKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.warehouseList !== this.props.warehouseList && !this.state.warehouse.whse_code) {
      this.setState({
        warehouse: nextProps.warehouseList.length === 0 ? {} : nextProps.warehouseList[0],
      });
      this.props.loadZones(nextProps.warehouseList[0].whse_code).then(
        (result) => {
          if (!result.error && result.data.length !== 0) {
            this.props.loadLocations(nextProps.warehouseList[0].whse_code, result.data[0].zone_code);
            this.setState({
              zone: result.data[0],
              zones: result.data,
              selectKeys: [result.data[0].zone_code],
            });
          }
        }
      );
    }
    this.setState({ warehouses: nextProps.warehouseList });
  }
  msg = key => formatMsg(this.props.intl, key);
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
    this.props.loadZones(record.whse_code).then(
      (result) => {
        if (!result.error && result.data.length !== 0) {
          this.props.loadLocations(this.state.warehouse.whse_code, result.data[0].zone_code);
          this.setState({
            zone: result.data[0],
            zones: result.data,
            selectKeys: [result.data[0].zone_code],
          });
        } else {
          this.props.loadLocations(this.state.warehouse.whse_code);
        }
      }
    );
  }
  createZone = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { zoneCode, zoneName } = values;
        const whseCode = this.state.warehouse.whse_code;
        this.props.addZone({
          zoneCode,
          zoneName,
          whseCode,
        }).then(
          (result) => {
            if (!result.error) {
              message.info('添加库区成功');
              this.setState({
                visible: false,
              });
            }
            this.props.loadZones(whseCode).then(
              (data) => {
                if (!data.error) {
                  this.setState({
                    zones: data.data,
                  });
                }
              }
            );
          }
        );
      }
    });
  }
  showLocationModal = () => {
    this.props.showLocationModal();
  }
  handleZoneClick = (item) => {
    const key = item.key;
    const whseCode = this.state.warehouse.whse_code;
    const zones = this.state.zones;
    this.setState({
      selectKeys: [key],
      zone: zones.find(zone => zone.zone_code === key),
    });
    this.props.loadLocations(whseCode, key);
  }
  handleDeleteLocation = (row) => {
    const whseCode = this.state.warehouse.whse_code;
    const zoneCode = this.state.zone.zone_code;
    this.props.deleteLocation(row.id).then(
      (result) => {
        if (!result.error) {
          message.info('库位已删除');
          this.props.loadLocations(whseCode, zoneCode);
        }
      }
    );
  }
  editDeleteLocation = (row) => {
    this.props.showLocationModal(row);
  }
  handleStateChange = (key, data) => {
    this.setState({
      selectKeys: [key],
      zones: data,
    });
  }
  handleDeleteZone = (zoneCode) => {
    const whseCode = this.state.warehouse.whse_code;
    this.props.deleteZone(whseCode, zoneCode).then(
      (result) => {
        if (!result.error) {
          message.info('库区已删除');
          this.props.loadZones(whseCode).then(
            (data) => {
              if (!data.error && data.data.length !== 0) {
                this.setState({
                  selectKeys: [data.data[0].zone_code],
                });
                this.props.loadLocations(whseCode, data.data[0].zone_code);
              }
            }
          );
        }
      }
    );
  }
  locationColumns = [{
    title: 'location',
    dataIndex: 'location',
    key: 'location',
  }, {
    title: '库位类型',
    dataIndex: 'type',
    key: 'type',
  }, {
    title: '库位状态',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: '操作',
    render: record => (
      <span>
        <RowUpdater onHit={this.handleDeleteLocation} label="delete" row={record} />
        <span className="ant-divider" />
        <RowUpdater onHit={this.editDeleteLocation} label="edit" row={record} />
      </span>
      ),
  },
  ]
  render() {
    const { form: { getFieldDecorator }, zoneList } = this.props;
    const { warehouse, warehouses, zone, selectKeys } = this.state;
    const whseColumns = [{
      dataIndex: 'whse_name',
      key: 'whse_name',
      render: o => (<span className="menu-sider-item">{o}</span>),
    }];
    const zonePopoverContent = (
      <Form>
        <FormItem>
          {
            getFieldDecorator('zoneCode', {
              rules: [{ required: true, messages: 'please input zoneCode' }],
            })(<Input placeholder="库区编号" />)
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator('zoneName', {
              rules: [{ required: true, messages: 'please input zoneName' }],
            })(<Input placeholder="库区描述" />)
          }
        </FormItem>
        <FormItem>
          <Button size="large" type="primary" style={{ width: '100%', marginTop: 10 }} onClick={this.createZone}>创建</Button>
        </FormItem>
      </Form>);
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
              <Search placeholder={this.msg('searchPlaceholder')} size="large" />
            </div>
            <Table size="middle" columns={whseColumns} dataSource={warehouses} showHeader={false} onRowClick={this.handleRowClick}
              pagination={{ current: this.state.currentPage, defaultPageSize: 15 }}
              rowClassName={record => record.whse_code === warehouse.whse_code ? 'table-row-selected' : ''} rowKey="whse_code"
            />
            <WarehouseModal />
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {warehouse.whse_name} {warehouse.bonded === 1 && <Tag color="green">保税仓</Tag>}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content className="main-content">
            <div className="page-body tabbed">
              <Tabs defaultActiveKey="location">
                <TabPane tab="库区/库位" key="location">
                  <Layout className="main-wrapper">
                    <Sider className="nav-sider">
                      <Menu defaultOpenKeys={['zoneMenu']} mode="inline" selectedKeys={selectKeys} onClick={this.handleZoneClick}>
                        <SubMenu key="zoneMenu" title={<span><MdIcon mode="fontello" type="sitemap" />库区</span>} >
                          {
                          zoneList.map(item => (<Menu.Item key={item.zone_code}>
                            <span>{item.zone_name}</span>
                            <ZoneEditDropDown id={item.id} zoneCode={item.zone_code} whseCode={warehouse.whse_code} stateChange={this.handleStateChange} deleteZone={this.handleDeleteZone} />
                          </Menu.Item>))
                        }
                        </SubMenu>
                      </Menu>
                      <div className="nav-sider-footer">
                        <Popover content={zonePopoverContent} placement="bottom" title="创建库区" trigger="click" visible={this.state.visible}
                          onVisibleChange={this.handleVisibleChange}
                        >
                          <Button type="dashed" size="large" icon="plus-circle" >创建库区</Button>
                        </Popover>
                      </div>
                    </Sider>
                    <Content className="nav-content">
                      <div className="nav-content-head">
                        <Button type="primary" ghost icon="plus-circle" onClick={this.showLocationModal}>
                          创建库位
                        </Button>
                      </div>
                      <div className="panel-body table-panel">
                        <Table columns={this.locationColumns} dataSource={this.props.locations} />
                      </div>
                      <LocationModal whseCode={warehouse.whse_code} zoneCode={zone.zone_code} />
                    </Content>
                  </Layout>
                </TabPane>
                <TabPane tab="月台" key="dock" disabled />
                <TabPane tab="上架规则" key="putaway" disabled />
                <TabPane tab="分配规则" key="allocate" disabled />
                <TabPane tab="补货规则" key="replenish" disabled />
                {
                  warehouse.bonded === 1 && <TabPane tab="保税监管" key="supervision" />
                }
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
