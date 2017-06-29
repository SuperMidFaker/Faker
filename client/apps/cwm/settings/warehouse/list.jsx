import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Icon, Layout, Table, Tooltip, Button, Input, Breadcrumb, Tabs, Popover, Menu, Form, Tag, message } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import WarehouseModal from './modal/warehouseModal';
import LocationModal from './modal/locationModal';
import { MdIcon } from 'client/components/FontIcon';
import ZoneEditPopover from './popover/zoneEditPopover';
import OwnersPane from './tabpane/ownersPane';
import SupervisionPane from './tabpane/supervisionPane';
import { showWarehouseModal, addZone, loadZones, showLocationModal, loadLocations, deleteLocation,
  editLocation, deleteZone } from 'common/reducers/cwmWarehouse';
import { formatMsg } from './message.i18n';
import ExcelUpload from 'client/components/excelUploader';
import './warehouse.less';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const FormItem = Form.Item;

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
  }),
  { showWarehouseModal,
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
  componentWillMount() {
    this.setState({
      warehouse: this.props.whses.length === 0 ? {} : this.props.whses[0],
    });
    if (this.props.whses.length !== 0) {
      this.props.loadZones(this.props.whses[0].code).then(
        (result) => {
          if (!result.error && result.data.length !== 0) {
            this.props.loadLocations(this.props.whses[0].code, result.data[0].zone_code);
            this.setState({
              zone: result.data[0],
              zones: result.data,
              selectKeys: [result.data[0].zone_code],
            });
          }
        }
      );
      this.setState({ warehouses: this.props.whses });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whses.length !== this.props.whses.length) {
      this.setState({ warehouses: nextProps.whses });
    }
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
    this.props.loadZones(record.code).then(
      (result) => {
        if (!result.error && result.data.length !== 0) {
          this.props.loadLocations(this.state.warehouse.code, result.data[0].zone_code);
          this.setState({
            zone: result.data[0],
            zones: result.data,
            selectKeys: [result.data[0].zone_code],
          });
        } else {
          this.props.loadLocations(this.state.warehouse.code);
        }
      }
    );
  }
  createZone = (e) => {
    e.preventDefault();
    const { tenantId, loginId } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { zoneCode, zoneName } = values;
        const whseCode = this.state.warehouse.code;
        this.props.addZone({
          zoneCode,
          zoneName,
          whseCode,
          tenantId,
          loginId,
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
    const whseCode = this.state.warehouse.code;
    const zones = this.state.zones;
    this.setState({
      selectKeys: [key],
      zone: zones.find(zone => zone.zone_code === key),
    });
    this.props.loadLocations(whseCode, key);
  }
  handleDeleteLocation = (row) => {
    const whseCode = this.state.warehouse.code;
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
  handleEditLocation = (row) => {
    this.props.showLocationModal(row);
  }
  handleStateChange = (key, data) => {
    this.setState({
      selectKeys: [key],
      zones: data,
    });
  }
  handleDeleteZone = (zoneCode) => {
    const whseCode = this.state.warehouse.code;
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
  zonesUploaded = () => {
    this.props.loadZones(this.state.warehouse.code);
    this.setState({ visible: false });
  }
  locationsUploaded = () => {
    const whseCode = this.state.warehouse.code;
    const { zoneCode } = this.state;
    this.props.loadLocations(whseCode, zoneCode);
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
    width: 100,
    render: record => (
      <span>
        <RowUpdater onHit={this.handleEditLocation} label={<Icon type="edit" />} row={record} />
        <span className="ant-divider" />
        <RowUpdater onHit={this.handleDeleteLocation} label={<Icon type="delete" />} row={record} />
      </span>
      ),
  },
  ]
  render() {
    const { form: { getFieldDecorator }, zoneList } = this.props;
    const { warehouse, warehouses, zone, selectKeys } = this.state;
    const whseColumns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<span className="menu-sider-item">{o}</span>),
    }];
    const zonePopoverContent = (
      <Form layout="vertical">
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
          <Button className="createZone" size="large" type="primary" style={{ width: '100%' }} onClick={this.createZone}>创建</Button>
          <ExcelUpload endpoint={`${API_ROOTS.default}v1/cwm/warehouse/zones/import`}
            formData={{
              data: JSON.stringify({
                tenantId: this.props.tenantId,
                loginId: this.props.loginId,
              }),
            }} onUploaded={this.zonesUploaded}
          >
            <Button size="large" type="primary" ghost style={{ width: '100%', marginTop: 24 }}>导入</Button>
          </ExcelUpload>
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
              <Search placeholder={this.msg('searchPlaceholder')} size="large" />
            </div>
            <Table size="middle" columns={whseColumns} dataSource={warehouses} showHeader={false} onRowClick={this.handleRowClick}
              pagination={{ current: this.state.currentPage, defaultPageSize: 15 }}
              rowClassName={record => record.code === warehouse.code ? 'table-row-selected' : ''} rowKey="code"
            />
            <WarehouseModal />
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {warehouse.name} {warehouse.bonded === 1 && <Tag color="green">保税仓</Tag>}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content className="main-content">
            <div className="page-body tabbed">
              <Tabs defaultActiveKey="owners">
                <TabPane tab="货主" key="owners">
                  <OwnersPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
                </TabPane>
                <TabPane tab="库区/库位" key="location">
                  <Layout>
                    <Sider className="nav-sider">
                      <Menu defaultOpenKeys={['zoneMenu']} mode="inline" selectedKeys={selectKeys} onClick={this.handleZoneClick}>
                        <SubMenu key="zoneMenu" title={<span><MdIcon mode="fontello" type="sitemap" />库区</span>} >
                          {
                          zoneList.map(item => (<Menu.Item key={item.zone_code}>
                            <span>{item.zone_name}</span>
                            <ZoneEditPopover id={item.id} zoneCode={item.zone_code} whseCode={warehouse.code} stateChange={this.handleStateChange} deleteZone={this.handleDeleteZone} />
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
                      <div className="toolbar">
                        <Button type="primary" ghost icon="plus-circle" onClick={this.showLocationModal}>
                          创建库位
                        </Button>
                        <ExcelUpload endpoint={`${API_ROOTS.default}v1/cwm/warehouse/locations/import`}
                          formData={{
                            data: JSON.stringify({
                              tenantId: this.props.tenantId,
                              loginId: this.props.loginId,
                            }),
                          }} onUploaded={this.locationsUploaded}
                        >
                          <Button type="primary" ghost icon="upload">
                            批量导入库位
                          </Button>
                        </ExcelUpload>
                      </div>
                      <div className="panel-body table-panel">
                        <Table columns={this.locationColumns} dataSource={this.props.locations} />
                      </div>
                      <LocationModal whseCode={warehouse.code} zoneCode={zone.zone_code} />
                    </Content>
                  </Layout>
                </TabPane>
                <TabPane tab="月台" key="dock" disabled />
                {warehouse.bonded === 1 && <TabPane tab="保税监管" key="supervision">
                  <SupervisionPane whseCode={warehouse.code} whseTenantId={warehouse.wh_ent_tenant_id} />
                </TabPane>}
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
