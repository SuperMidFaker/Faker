import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Layout, Table, Button, Input, Popover, Menu, Form, message, Popconfirm } from 'antd';
import { MdIcon } from 'client/components/FontIcon';
import RowAction from 'client/components/RowAction';
import ExcelUploader from 'client/components/ExcelUploader';
import { createFilename } from 'client/util/dataTransform';
import { addZone, loadZones, showLocationModal, loadLocations, deleteLocation, editLocation, deleteZone, batchDeleteLocations, clearLocations, showZoneModal } from 'common/reducers/cwmWarehouse';
import { CWM_LOCATION_TYPES, CWM_LOCATION_STATUS } from 'common/constants';
import ZoneEditModal from '../modal/zoneEditModal';
import LocationModal from '../modal/locationModal';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;
const FormItem = Form.Item;
const { SubMenu } = Menu;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    warehouseList: state.cwmWarehouse.warehouseList,
    zoneList: state.cwmWarehouse.zoneList,
    locations: state.cwmWarehouse.locations,
    locationLoading: state.cwmWarehouse.locationLoading,
  }),
  {
    addZone,
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
    warehouse: PropTypes.shape({ code: PropTypes.string }).isRequired,
  }
  state = {
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
    });
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
      });
    }
  }
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }
  handleStateChange = (key, data) => {
    this.setState({
      selectZone: [key],
      zones: data,
    });
  }
  createZone = (ev) => {
    ev.preventDefault();
    const { loginId } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { zoneCode, zoneName } = values;
        const whseCode = this.props.warehouse.code;
        this.props.addZone({
          zoneCode,
          zoneName,
          whseCode,
          loginId,
        }).then((result) => {
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
          this.props.loadZones(whseCode).then((data) => {
            if (!data.error) {
              this.setState({
                zones: data.data,
                zone: data.data[0],
                selectedRowKeys: [data.data[0].zone_code],
              });
            }
          });
        });
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
    const whseCode = this.props.warehouse.code;
    const { zones } = this.state;
    this.setState({
      selectZone: [item.key],
      zone: zones.find(zone => zone.zone_code === item.key),
      selectedRowKeys: [],
    });
    this.props.loadLocations(whseCode, item.key);
  }
  handleDeleteLocation = (row) => {
    const whseCode = this.props.warehouse.code;
    const zoneCode = this.state.zone.zone_code;
    this.props.deleteLocation(row.id).then((result) => {
      if (!result.error) {
        message.info('库位已删除');
        this.props.loadLocations(whseCode, zoneCode);
      }
    });
  }
  handleDeleteZone = () => {
    const whseCode = this.props.warehouse.code;
    const zoneCode = this.state.zone.zone_code;
    this.props.deleteZone(whseCode, zoneCode).then((result) => {
      if (!result.error) {
        message.info('库区已删除');
        this.props.loadZones(whseCode).then((data) => {
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
        });
      }
    });
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
          selectedRowKeys: [result.data[0].zone_code],
        });
        this.props.loadLocations(whseCode, result.data[0].zone_code);
      }
    });
  }
  exportLocations = () => {
    const whseCode = this.props.warehouse.code;
    window.open(`${API_ROOTS.default}v1/cwm/export/locations/${createFilename('locations')}.xlsx?whseCode=${whseCode}`);
  }
  locationColumns = [{
    title: '库位编号',
    dataIndex: 'location',
    key: 'location',
  }, {
    title: '库位类型',
    dataIndex: 'type',
    key: 'type',
    render: o => (CWM_LOCATION_TYPES.find(item => item.value === o) ? CWM_LOCATION_TYPES.find(item => item.value === o).text : ''),
  }, {
    title: '库位状态',
    dataIndex: 'status',
    key: 'status',
    render: o => (CWM_LOCATION_STATUS.find(item => item.value === o) ? CWM_LOCATION_STATUS.find(item => item.value === o).text : ''),
  }, {
    title: '最后修改时间',
    dataIndex: 'last_updated_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 80,
    render: record => (
      <span>
        <RowAction onClick={this.handleEditLocation} icon="edit" row={record} />
        <RowAction danger confirm="确定删除?" onConfirm={this.handleDeleteLocation} icon="delete" row={record} />
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  render() {
    const {
      form: { getFieldDecorator }, zoneList, locations, locationLoading, warehouse,
    } = this.props;
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
              rules: [{ required: true, message: 'please input zoneCode' }],
            })(<Input placeholder="库区编号" />)
          }
        </FormItem>
        <FormItem>
          {
            getFieldDecorator('zoneName', {
              rules: [{ required: true, message: 'please input zoneName' }],
            })(<Input placeholder="库区描述" />)
          }
        </FormItem>
        <FormItem>
          <Button type="primary" style={{ width: '100%' }} onClick={this.createZone}>创建</Button>
        </FormItem>
      </Form>);
    return (
      <Layout>
        <Sider className="nav-sider">
          <div className="nav-sider-head">
            <ExcelUploader
              endpoint={`${API_ROOTS.default}v1/cwm/warehouse/locations/import`}
              formData={{
                data: JSON.stringify({
                  loginId: this.props.loginId,
                }),
              }}
              onUploaded={this.locationsUploaded}
            >
              <Button type="primary" icon="upload">
                导入库区库位
              </Button>
            </ExcelUploader>
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
            <Popover
              content={zonePopoverContent}
              placement="bottom"
              title="创建库区"
              trigger="click"
              visible={this.state.visible}
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
            {zoneList.length > 0 && <Button icon="export" onClick={this.exportLocations}>
              导出库位
            </Button>}
            {this.state.selectedRowKeys.length > 0 &&
            <Popconfirm title="确定删除?" onConfirm={this.batchDeleteLocations} okText="是" cancelText="否">
              <Button type="danger" ghost icon="delete">批量删除库位</Button>
            </Popconfirm>
            }
            <div className="toolbar-right">
              { zoneList.length > 0 && <Button icon="edit" onClick={this.showZoneModal}>编辑库区</Button> }
              { zoneList.length > 0 &&
              <Popconfirm title="确定删除?" onConfirm={this.handleDeleteZone} okText="是" cancelText="否">
                <Button type="danger" icon="delete" >删除库区</Button>
              </Popconfirm>
              }
            </div>
            <ZoneEditModal
              zone={zone}
              whseCode={warehouse.code}
              stateChange={this.handleStateChange}
            />
          </div>
          <div className="panel-body table-panel table-fixed-layout">
            <Table columns={this.locationColumns} dataSource={locations} rowKey="id" loading={locationLoading} rowSelection={rowSelection} />
          </div>
          <LocationModal whseCode={warehouse.code} zoneCode={zone.zone_code} />
        </Content>
      </Layout>
    );
  }
}
