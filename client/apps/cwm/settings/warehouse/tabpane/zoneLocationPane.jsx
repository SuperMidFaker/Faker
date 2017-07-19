import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Layout, Table, Button, Input, Popover, Menu, Form, message, Popconfirm, Icon } from 'antd';
import LocationModal from '../modal/locationModal';
import { MdIcon } from 'client/components/FontIcon';
import RowUpdater from 'client/components/rowUpdater';
import ExcelUpload from 'client/components/excelUploader';
import ZoneEditModal from '../modal/zoneEditModal';
import { addZone, loadZones, showLocationModal, loadLocations, deleteLocation,
  editLocation, deleteZone, batchDeleteLocations, clearLocations, showZoneModal } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';
import { CWM_LOCATION_TYPES, CWM_LOCATION_STATUS } from 'common/constants';

const { Content, Sider } = Layout;
const FormItem = Form.Item;
const SubMenu = Menu.SubMenu;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    warehouseList: state.cwmWarehouse.warehouseList,
    zoneList: state.cwmWarehouse.zoneList,
    locations: state.cwmWarehouse.locations,
    locationLoading: state.cwmWarehouse.locationLoading,
  }),
  { addZone,
    loadZones,
    showLocationModal,
    loadLocations,
    deleteLocation,
    editLocation,
    deleteZone,
    batchDeleteLocations,
    clearLocations,
    showZoneModal,
  }
)
@Form.create()
export default class ZoneLocationPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    warehouse: PropTypes.object.isRequired,
  }
  state = {
    zoneName: '',
    zoneCode: '',
    visible: false,
    zones: [],
    zone: {},
    selectZone: [],
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadZones(this.props.warehouse.code).then((result) => {
      if (!result.error && result.data.length !== 0) {
        this.props.loadLocations(this.props.warehouse.code, result.data[0].zone_code);
        this.setState({
          zone: result.data[0],
          zones: result.data,
          selectZone: [result.data[0].zone_code],
        });
      }
    }
    );
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.warehouse.code !== this.props.warehouse.code) {
      this.props.loadZones(nextProps.warehouse.code).then((result) => {
        if (!result.error && result.data.length !== 0) {
          this.props.loadLocations(nextProps.warehouse.code, result.data[0].zone_code);
          this.setState({
            zone: result.data[0],
            zones: result.data,
            selectZone: [result.data[0].zone_code],
          });
        }
      }
      );
    }
  }
  createZone = (e) => {
    e.preventDefault();
    const { tenantId, loginId } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { zoneCode, zoneName } = values;
        const whseCode = this.props.warehouse.code;
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
              this.props.form.setFieldsValue({
                zoneCode: '',
                zoneName: '',
              });
            }
            this.props.loadZones(whseCode).then(
              (data) => {
                if (!data.error) {
                  this.setState({
                    zones: data.data,
                    zone: data.data[0],
                    selectKeys: [data.data[0].zone_code],
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
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  handleZoneClick = (item) => {
    const key = item.key;
    const whseCode = this.props.warehouse.code;
    const zones = this.state.zones;
    this.setState({
      selectZone: [key],
      zone: zones.find(zone => zone.zone_code === key),
    });
    this.props.loadLocations(whseCode, key);
  }
  handleDeleteLocation = (row) => {
    const whseCode = this.props.warehouse.code;
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
  handleStateChange = (key, data) => {
    this.setState({
      selectZone: [key],
      zones: data,
    });
  }
  handleDeleteZone = () => {
    const whseCode = this.props.warehouse.code;
    const zoneCode = this.state.zone.zone_code;
    this.props.deleteZone(whseCode, zoneCode).then(
      (result) => {
        if (!result.error) {
          message.info('库区已删除');
          this.props.loadZones(whseCode).then(
            (data) => {
              if (!data.error && data.data.length !== 0) {
                this.setState({
                  zones: data.data,
                  zone: data.data[0],
                  selectZone: [data.data[0].zone_code],
                });
                this.props.loadLocations(whseCode, data.data[0].zone_code);
              } else {
                this.setState({
                  zones: [],
                  zone: {},
                  selectZone: [],
                });
                this.props.clearLocations();
              }
            }
          );
        }
      }
    );
  }
  batchDeleteLocations = () => {
    const whseCode = this.props.warehouse.code;
    const zoneCode = this.state.zone.zone_code;
    this.props.batchDeleteLocations(this.state.selectedRowKeys).then((result) => {
      if (!result.error) {
        this.props.loadLocations(whseCode, zoneCode);
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }
  showZoneModal = () => {
    this.props.showZoneModal();
  }
  handleStateChange = (key, data) => {
    this.setState({
      selectZone: [key],
      zones: data,
    });
  }
  handleEditLocation = (row) => {
    this.props.showLocationModal(row);
  }
  locationsUploaded = () => {
    const whseCode = this.props.warehouse.code;
    this.props.loadZones(whseCode).then((result) => {
      if (!result.error) {
        this.setState({
          zones: result.data,
          zone: result.data[0],
          selectKeys: [result.data[0].zone_code],
        });
        this.props.loadLocations(whseCode, result.data[0].zone_code);
      }
    });
  }
  locationColumns = [{
    title: '库位编号',
    dataIndex: 'location',
    key: 'location',
  }, {
    title: '库位类型',
    dataIndex: 'type',
    key: 'type',
    render: o => CWM_LOCATION_TYPES.find(item => item.value === Number(o)) ? CWM_LOCATION_TYPES.find(item => item.value === Number(o)).text : '',
  }, {
    title: '库位状态',
    dataIndex: 'status',
    key: 'status',
    render: o => CWM_LOCATION_STATUS.find(item => item.value === Number(o)) ? CWM_LOCATION_STATUS.find(item => item.value === Number(o)).text : '',
  }, {
    title: '最后修改时间',
    dataIndex: 'last_modified_date',
    width: 120,
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
  }, {
    title: '操作',
    width: 80,
    render: record => (
      <span>
        <RowUpdater onHit={this.handleEditLocation} label={<Icon type="edit" />} row={record} />
        <span className="ant-divider" />
        <Popconfirm title="Are you sure delete this task?" onConfirm={() => this.handleDeleteLocation(record)} okText="Yes" cancelText="No">
          <RowUpdater label={<Icon type="delete" />} />
        </Popconfirm>
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, zoneList, locations, locationLoading, warehouse } = this.props;
    const { zone, selectZone, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      selections: [{
        key: 'all-data',
        text: 'Select All Data',
        onSelect: () => {
          this.setState({
            selectedRowKeys: locations.map(item => item.id),
          });
        },
      }],
      onSelection: this.onSelection,
    };
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
        </FormItem>
      </Form>);
    return (
      <Layout>
        <Sider className="nav-sider">
          <div className="nav-sider-head">
            <ExcelUpload endpoint={`${API_ROOTS.default}v1/cwm/warehouse/locations/import`}
              formData={{
                data: JSON.stringify({
                  tenantId: this.props.tenantId,
                  loginId: this.props.loginId,
                }),
              }} onUploaded={this.locationsUploaded}
            >
              <Button type="primary" size="large" icon="upload">
                导入库区库位
              </Button>
            </ExcelUpload>
          </div>
          <Menu defaultOpenKeys={['zoneMenu']} mode="inline" selectedKeys={selectZone} onClick={this.handleZoneClick}>
            <SubMenu key="zoneMenu" title={<span><MdIcon mode="fontello" type="sitemap" />库区</span>} >
              {
                zoneList.map(item => (<Menu.Item key={item.zone_code}>
                  <span>{item.zone_code}</span>
                </Menu.Item>))
              }
            </SubMenu>
          </Menu>
          <div className="nav-sider-footer">
            <Popover content={zonePopoverContent} placement="bottom" title="创建库区" trigger="click" visible={this.state.visible}
              onVisibleChange={this.handleVisibleChange}
            >
              <Button type="dashed" icon="plus-circle" >新增库区</Button>
            </Popover>
          </div>
        </Sider>
        <Content className="nav-content">
          <div className="toolbar">
            {zoneList.length > 0 && <Button type="primary" ghost icon="plus-circle" onClick={this.showLocationModal}>
              新增库位
            </Button>}
            {this.state.selectedRowKeys.length > 0 &&
            <Popconfirm title="Are you sure delete this task?" onConfirm={this.batchDeleteLocations} okText="Yes" cancelText="No">
              <Button type="primary" ghost icon="delete">批量删除库位</Button>
            </Popconfirm>
            }
            <div className="toolbar-right">
              { zoneList.length > 0 && <Button icon="edit" onClick={this.showZoneModal}>编辑库区</Button> }
              { zoneList.length > 0 &&
              <Popconfirm title="Are you sure delete this task?" onConfirm={this.handleDeleteZone} okText="Yes" cancelText="No">
                <Button type="danger" icon="delete" >删除库区</Button>
              </Popconfirm>
              }
            </div>
            <ZoneEditModal zone={zone} whseCode={warehouse.code} stateChange={this.handleStateChange} />
          </div>
          <div className="panel-body table-panel">
            <Table columns={this.locationColumns} dataSource={locations} rowKey="id" loading={locationLoading} rowSelection={rowSelection} />
          </div>
          <LocationModal whseCode={warehouse.code} zoneCode={zone.zone_code} />
        </Content>
      </Layout>
    );
  }
}
