import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Layout, Table, Tooltip, Button, Input, Breadcrumb, Tabs, Card, Popover, Menu, Form, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import WarehouseModal from './modal/warehouseModal';
import LocationModal from './modal/addLocationModal';
import MdIcon from 'client/components/MdIcon';
import { showWarehouseModal, loadwhList, addZone, loadZones, showLocationModal, loadLocations } from 'common/reducers/cwmWarehouse';

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
  { showWarehouseModal, loadwhList, addZone, loadZones, showLocationModal, loadLocations }
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
    zone: {},
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.warehouseList !== this.props.warehouseList && !this.state.warehouse.whse_code) {
      this.setState({
        warehouse: nextProps.warehouseList.length === 0 ? {} : nextProps.warehouseList[0],
      });
      this.props.loadZones(nextProps.warehouseList[0].whse_code).then(
        (result) => {
          this.props.loadLocations(nextProps.warehouseList[0].whse_code, result.data[0].zone_code);
          this.setState({
            zone: result.data[0],
          });
        }
      );
    }
    this.setState({ warehouses: nextProps.warehouseList });
  }
  msg = key => formatMsg(this.props.intl, key);
  showWarehouseModal = () => {
    this.props.showWarehouseModal();
  }
  handleRowClick = (record) => {
    this.setState({
      warehouse: record,
    });
    this.props.loadZones(record.whse_code);
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
            this.props.loadZones(whseCode);
          }
        );
      }
    });
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  showLocationModal = () => {
    this.props.showLocationModal();
  }
  columns = [{
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
  }]
  render() {
    const { form: { getFieldDecorator }, zoneList } = this.props;
    const { warehouse, warehouses, zone } = this.state;
    const columns = [{
      dataIndex: 'wh_name',
      key: 'wh_name',
    }];
    const ReservoirPopover = (
      <Form>
        <FormItem>
          {
            getFieldDecorator('zoneCode', {
              rules: [{ required: true, messages: 'please input zoneCode' }],
            })(<Input placeholder="区域编号" />)
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator('zoneName', {
              rules: [{ required: true, messages: 'please input zoneName' }],
            })(<Input placeholder="区域名称" />)
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
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  仓库
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="pull-right">
                <Tooltip placement="bottom" title="新增仓库">
                  <Button type="primary" shape="circle" icon="plus" onClick={this.showWarehouseModal} />
                </Tooltip>
              </div>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder={this.msg('searchPlaceholder')}
                  size="large"
                />
              </div>
              <Table size="middle" columns={columns} dataSource={warehouses} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15 }}
                rowClassName={record => record.whse_code === warehouse.whse_code ? 'table-row-selected' : ''} rowKey="whse_code"
              />
              <WarehouseModal />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                仓库
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content className="main-content">
            <Card>
              <Tabs defaultActiveKey="1">
                <TabPane tab="库区/库位" key="1">
                  <Layout className="main-wrapper">
                    <Sider className="nav-sider">
                      <Menu defaultOpenKeys={['deptMenu']} mode="inline">
                        <SubMenu key="deptMenu" title={<span><MdIcon mode="fontello" type="sitemap" />库区</span>} />
                        {
                          zoneList.map(item => <Menu.Item className={item.zone_code === zone.zone_code ? 'ant-menu-item-selected' : ''} key={item.zone_code}>{item.zone_name}</Menu.Item>)
                        }
                      </Menu>
                      <div className="nav-sider-footer">
                        <Popover content={ReservoirPopover} placement="bottom" title="创建部门" trigger="click" visible={this.state.visible}
                          onVisibleChange={this.handleVisibleChange}
                        >
                          <Button type="dashed" size="large" icon="plus-circle" >创建库区</Button>
                        </Popover>
                      </div>
                    </Sider>
                    <Content className="nav-content">
                      <div className="nav-content-head">
                        <Button size="large" type="primary" icon="user-add" onClick={this.showLocationModal}>
                          添加库位
                        </Button>
                      </div>
                      <div className="panel-body table-panel">
                        <Table columns={this.columns} dataSource={this.props.locations} />
                      </div>
                      <LocationModal whseCode={warehouse.whse_code} zoneCode={zone.zone_code} />
                    </Content>
                  </Layout>
                </TabPane>
                <TabPane tab="监管系统" key="2" />
              </Tabs>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
