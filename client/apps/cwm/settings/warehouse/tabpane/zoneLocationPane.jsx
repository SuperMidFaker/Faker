import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Layout, Table, Button, Input, Popover, Menu, Form, message } from 'antd';
import LocationModal from '../modal/locationModal';
import MdIcon from 'client/components/MdIcon';
import RowUpdater from 'client/components/rowUpdater';
import ZoneEditPopover from '../popover/zoneEditPopover';
import { addZone, loadZones, showLocationModal, loadLocations, deleteLocation,
  editLocation, deleteZone } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;
const FormItem = Form.Item;
const SubMenu = Menu.SubMenu;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenanId,
    warehouseList: state.cwmWarehouse.warehouseList,
    zoneList: state.cwmWarehouse.zoneList,
    locations: state.cwmWarehouse.locations,
  }),
  { addZone,
    loadZones,
    showLocationModal,
    loadLocations,
    deleteLocation,
    editLocation,
    deleteZone }
)
@Form.create()
export default class ZoneLocationPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    warehouse: PropTypes.object.isRequired,
  }
  state = {
    warehouse: {},
    zoneName: '',
    zoneCode: '',
    visible: false,
    zones: [],
    zone: {},
    selectKeys: [],
  }
  componentWillReceiveProps() {
    this.props.loadZones(this.props.warehouse.whse_code).then(
        (result) => {
          if (!result.error && result.data.length !== 0) {
            this.props.loadLocations(this.props.warehouse.whse_code, result.data[0].zone_code);
            this.setState({
              zone: result.data[0],
              zones: result.data,
              selectKeys: [result.data[0].zone_code],
            });
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
  handleVisibleChange = (visible) => {
    this.setState({ visible });
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
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, zoneList } = this.props;
    const { warehouse, zone, selectKeys } = this.state;
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
      <Layout className="main-wrapper">
        <Sider className="nav-sider">
          <Menu defaultOpenKeys={['zoneMenu']} mode="inline" selectedKeys={selectKeys} onClick={this.handleZoneClick}>
            <SubMenu key="zoneMenu" title={<span><MdIcon mode="fontello" type="sitemap" />库区</span>} >
              {
                          zoneList.map(item => (<Menu.Item key={item.zone_code}>
                            <span>{item.zone_name}</span>
                            <ZoneEditPopover id={item.id} zoneCode={item.zone_code} whseCode={warehouse.whse_code} stateChange={this.handleStateChange} deleteZone={this.handleDeleteZone} />
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
    );
  }
}
