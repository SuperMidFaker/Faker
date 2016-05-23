import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'reusable/components/nav-link';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { loadShipmtDetail } from 'universal/redux/reducers/shipment';
import { loadTransitTable, showPodModal, showDateModal, showVehicleModal } from
  'universal/redux/reducers/transport-tracking';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_VEHICLE_CONNECT } from
  'universal/constants';
import VehicleModal from './modals/vehicle-updater';
import PickupOrDeliverModal from './modals/pickup-deliver-updater';
import PodModal from './modals/pod-submit';
import PreviewPanel from '../shipment/modals/preview-panel';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/containers/message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const formatGlobalMsg = format(globalMessages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadTransitTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(state.transportTracking.transit.filters),
    pageSize: state.transportTracking.transit.shipmentlist.pageSize,
    currentPage: state.transportTracking.transit.shipmentlist.current,
    /*
    sortField: state.transportTracking.transit.sortField,
    sortOrder: state.transportTracking.transit.sortOrder,
   */
  }));
}

function RowUpdater(props) {
  const { label, onAnchored, row } = props;
  function handleClick() {
    if (onAnchored) {
      onAnchored(row);
    }
  }
  return <a onClick={handleClick}>{label}</a>;
}

RowUpdater.propTypes = {
  label: PropTypes.string.isRequired,
  onAnchored: PropTypes.func,
  row: PropTypes.object,
};

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.transportTracking.transit.shipmentlist,
    filters: state.transportTracking.transit.filters,
    loading: state.transportTracking.transit.loading,
  }),
  { loadTransitTable, loadShipmtDetail, showPodModal, showDateModal, showVehicleModal })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'transportTracking'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
export default class TrackingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    /*
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
   */
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    showVehicleModal: PropTypes.func.isRequired,
    showDateModal: PropTypes.func.isRequired,
    showPodModal: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadTransitTable: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTransitTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
        filters: this.props.filters
      };
      params.filters = params.filters.filter(
        flt => flt.name === 'type' || (flt.name in filters && filters[flt.name].length)
      );
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          params.filters = this.mergeFilters(params.filters, key, filters[key][0]);
        }
      }
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.shipmentlist
  })

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('shipNo'),
    dataIndex: 'shipmt_no',
    width: 150,
    render: (o, record) => {
      return <a onClick={() => this.handleShipmtPreview(record.shipmt_no)}>{o}</a>;
    }
  }, {
    title: this.msg('shipmtStatus'),
    dataIndex: 'status',
    width: 140,
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return `1 ${this.msg('pendingShipmt')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.undispatched) {
        return `2 ${this.msg('acceptedShipmt')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.undelivered) {
        return `3 ${this.msg('dispatchedShipmt')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
        return `4 ${this.msg('intransitShipmt')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
        return `5 ${this.msg('deliveredShipmt')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.podsubmit) {
        return `6 ${this.msg('proofOfDelivery')}`;
      } else {
        return <span />;
      }
    }
  }, {
    title: this.msg('shipmtPrevTrack'),
    width: 140,
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return `${this.msg('sendAction')}
        ${moment(record.disp_time).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.undispatched) {
        return `${this.msg('acceptAction')}
        ${moment(record.acpt_time).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.undelivered) {
        return `${this.msg('dispatchAction')}
        ${moment(record.disp_time).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
        return `${this.msg('pickupAction')}
        ${moment(record.pickup_act_date).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
        return `${this.msg('deliverAction')}
        ${moment(record.deliver_act_date).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.podsubmit) {
        return `${this.msg('podUploadAction')}
        ${moment(record.pod_recv_date).format('MM.DD HH:mm')}`;
      }
    },
  }, {
    title: this.msg('shipmtNextUpdate'),
    width: 140,
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return this.msg('carrierUpdate');
      } else if (record.status === SHIPMENT_TRACK_STATUS.undispatched) {
        if (record.sp_tenant_id === -1) {
          // 线下客户手动更新
          return (
            <RowUpdater label={this.msg('updateVehicleDriver')}
              onAnchored={this.handleShowVehicleModal} row={record}
            />
          );
        } else {
          return this.msg('carrierUpdate');
        }
      } else if (record.status === SHIPMENT_TRACK_STATUS.undelivered) {
        if (record.sp_tenant_id === -1) {
          return (
            <RowUpdater label={this.msg('updatePickup')}
              onAnchored={this.handleShowPickModal} row={record}
            />
          );
        } else if (record.sp_tenant_id === 0) {
          // 已分配给车队
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            // 线下司机
            return (
              <RowUpdater label={this.msg('updatePickup')}
              onAnchored={this.handleShowPickModal} row={record}
              />
            );
          } else {
            return this.msg('driverUpdate');
          }
        } else {
          return this.msg('carrierUpdate');
        }
      } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (record.sp_tenant_id === -1) {
          return (
            <RowUpdater label={this.msg('updateDelivery')}
            onAnchored={this.handleShowDeliverModal} row={record}
            />
          );
        } else if (record.sp_tenant_id === 0) {
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            return (
              <RowUpdater label={this.msg('updateDelivery')}
              onAnchored={this.handleShowDeliverModal} row={record}
              />
            );
          } else {
            return this.msg('driverUpdate');
          }
        } else {
          return this.msg('carrierUpdate');
        }
      } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
        if (record.pod_status === SHIPMENT_POD_STATUS.unrequired) {
          return <span />;
        } else if (record.sp_tenant_id === -1) {
          return (
            <RowUpdater label={this.msg('submitPod')}
            onAnchored={this.handleShowPodModal} row={record}
            />
          );
        } else if (record.sp_tenant_id === 0) {
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            return (
              <RowUpdater label={this.msg('submitPod')}
              onAnchored={this.handleShowPodModal} row={record}
              />
            );
          } else {
            return this.msg('driverUpdate');
          }
        } else {
          return this.msg('carrierUpdate');
        }
      } else {
        return this.msg('carrierUpdate');
      }
    },
  }, {
    title: this.msg('shipmtException'),
    width: 140,
    dataIndex: 'excp_level',
  }, {
    title: this.msg('shipmtCarrier'),
    dataIndex: 'sp_name',
    width: 160,
    render: (o, record) => {
      if (record.sp_name) {
        if (record.sp_tenant_id > 0) {
          return (
            <span>
              <i className="zmdi zmdi-circle mdc-text-green" />
              {record.sp_name}
            </span>
          );
        } else if (record.sp_tenant_id === -1) {
          return (
            <span>
              <i className="zmdi zmdi-circle mdc-text-grey" />
              {record.sp_name}
            </span>
          );
        } else {
          return record.sp_name;
        }
      } else {
        return this.msg('ownFleet');
      }
    }
  }, {
    title: this.msg('shipmtVehicle'),
    dataIndex: 'task_vehicle',
    width: 120
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 50
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 50
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 50
  }, {
    title: this.msg('shipmtCustomer'),
    dataIndex: 'customer_name',
    width: 200
  }, {
    title: this.msg('departurePlace'),
    width: 150,
    render: (o, record) => this.renderConsignLoc(record, 'consigner')
  }, {
    title: this.msg('arrivalPlace'),
    width: 150,
    render: (o, record) => this.renderConsignLoc(record, 'consignee')
  }, {
    title: this.msg('shipmtMode'),
    dataIndex: 'transport_mode',
    width: 80
  }, {
    title: this.msg('shipmtEstPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 100,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipmtActPickupDate'),
    dataIndex: 'pickup_act_date',
    width: 100,
    render: (o, record) => record.pickup_act_date ?
      (<span className="mdc-text-green">
      {moment(record.pickup_act_date).format('YYYY.MM.DD')}
      </span>
      ) : <span />
  }, {
    title: this.msg('shipmtEstDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 100,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipmtActDeliveryDate'),
    dataIndex: 'deliver_act_date',
    width: 100,
    render: (o, record) => record.deliver_act_date ?
      (<span className="mdc-text-green">
      {moment(record.deliver_act_date).format('YYYY.MM.DD')}
      </span>
      ) : <span />
  }, {
    title: this.msg('proofOfDelivery'),
    dataIndex: 'pod_type',
    width: 100,
    render: (text, record) => {
      if (record.pod_type === 'none') {
        return <Icon type="tags-o" />;
      } else if (record.pod_type === 'dreceipt') {
        return <Icon type="tags" />;
      } else {
        return <Icon type="qrcode" />;
      }
    }
  }]
  handleTableLoad = (filters, current/* , sortField, sortOrder */) => {
    this.props.loadTransitTable(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.shipmentlist.pageSize,
      currentPage: current || this.props.shipmentlist.current,
      /*
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
     */
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleShowVehicleModal = row => {
    this.props.showVehicleModal(row.disp_id);
  }
  handleShowPickModal = row => {
    this.props.showDateModal(row.disp_id, 'pickup');
  }
  handleShowDeliverModal = row => {
    this.props.showDateModal(row.disp_id, 'deliver');
  }
  handleShowPodModal = (row) => {
    this.props.showPodModal(row.disp_id);
  }
  handleShipmentFilter = (ev) => {
    const targetVal = ev.target.value;
    const filterArray = this.mergeFilters(this.props.filters, 'type', targetVal);
    const sortOrder = 'desc';
    let sortField = 'created_date';
    if (targetVal === 'accepted') {
      sortField = 'acpt_date';
    }
    this.handleTableLoad(filterArray, 1, sortField, sortOrder);
  }
  handleShipmtPreview(shipmtNo) {
    this.props.loadShipmtDetail(shipmtNo, this.props.tenantId, 'sr').then(result => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  mergeFilters(curFilters, name, value) {
    const merged = curFilters.filter(flt => flt.name !== name);
    if (value !== null && value !== undefined && value !== '') {
      merged.push({
        name,
        value
      });
    }
    return merged;
  }
  renderConsignLoc(shipmt, field) {
    const province = `${field}_province`;
    const city = `${field}_city`;
    const names = [];
    if (shipmt[province]) {
      names.push(shipmt[province]);
    }
    if (shipmt[city] && !(shipmt[city] === '市辖区' || shipmt[city] === '县')) {
      names.push(shipmt[city]);
    }
    return names.join('-');
  }

  render() {
    const { shipmentlist, loading, intl } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      }
    };
    let radioValue;
    const types = this.props.filters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="all">{this.msg('allShipmt')}</RadioButton>
            <RadioButton value="pending">{this.msg('pendingShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransitShipmt')}</RadioButton>
            <RadioButton value="delivered">{this.msg('deliveredShipmt')}</RadioButton>
          </RadioGroup>
          <span style={{marginLeft: '10px'}} />
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="uploaded">{this.msg('uploadedPOD')}</RadioButton>
            <RadioButton value="submitted">{this.msg('submittedPOD')}</RadioButton>
            <RadioButton value="passed">{this.msg('passedPOD')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body fixed">
          <div className="panel-header">
            <NavLink to="/transport/acceptance/shipment/new">
              <Button type="primary">
                <Icon type="export" /><span>{formatGlobalMsg(intl, 'export')}</span>
              </Button>
            </NavLink>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2400, y: 460 }}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(intl, 'clearSelection')}
            </Button>
          </div>
        </div>
        <PreviewPanel />
        <VehicleModal onOK={this.handleTableLoad} />
        <PickupOrDeliverModal onOK={this.handleTableLoad} />
        <PodModal onOK={this.handleTableLoad} />
      </div>
    );
  }
}
