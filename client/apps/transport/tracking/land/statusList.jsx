import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Tooltip, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadShipmtDetail } from 'common/reducers/shipment';
import {
  loadTransitTable, showDateModal, showVehicleModal,
  showLocModal, loadShipmtLastPoint, deliverConfirm,
} from 'common/reducers/trackingLandStatus';
import { showPodModal } from 'common/reducers/trackingLandPod';
import { showExcpModal } from 'common/reducers/trackingLandException';
import RowUpdater from './rowUpdater';
import VehicleModal from './modals/vehicle-updater';
import ExcpEventsModal from './modals/excpEventsModal';
import PickupDeliverModal from './modals/pickup-deliver-updater';
import LocationModal from './modals/intransitLocationUpdater';
import PodModal from './modals/pod-submit';
import makeColumns from './columnDef';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import ExportExcel from './modals/export-excel';
import RevokejectModal from '../../shipment/modals/revoke-reject';
import ShipmentAdvanceModal from './modals/shipment-advance-modal';
import { sendMessage } from 'common/reducers/corps';

const formatMsg = format(messages);

function fetchData({ state, dispatch, params, cookie }) {
  const newfilters = state.trackingLandStatus.filters.map((flt) => {
    if (flt.name === 'type') {
      return {
        name: 'type',
        value: params.state,
      };
    } else {
      return flt;
    }
  });
  return dispatch(loadTransitTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(newfilters),
    pageSize: state.trackingLandStatus.shipmentlist.pageSize,
    currentPage: state.trackingLandStatus.shipmentlist.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.trackingLandStatus.shipmentlist,
    filters: state.trackingLandStatus.filters,
    loading: state.trackingLandStatus.loading,
    reportedShipmts: state.trackingLandStatus.locReportedShipments,
  }),
  {
    loadTransitTable, loadShipmtDetail, showPodModal, showDateModal,
    showVehicleModal, showLocModal, loadShipmtLastPoint, showExcpModal,
    sendMessage, deliverConfirm,
  }
)
export default class LandStatusList extends React.Component {
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
    reportedShipmts: PropTypes.array.isRequired,
    showVehicleModal: PropTypes.func.isRequired,
    showDateModal: PropTypes.func.isRequired,
    showPodModal: PropTypes.func.isRequired,
    showLocModal: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadTransitTable: PropTypes.func.isRequired,
    loadShipmtLastPoint: PropTypes.func.isRequired,
    showExcpModal: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    deliverConfirm: PropTypes.func.isRequired,
  }
  constructor(...args) {
    super(...args);
    this.columns = makeColumns('status', {
      onShipmtPreview: this.handleShipmtPreview,
      onShowVehicleModal: this.handleShowVehicleModal,
      onShowPickModal: this.handleShowPickModal,
      renderIntransitUpdater: this.renderIntransitUpdater,
      onShowPodModal: this.handleShowPodModal,
      onShowDeliverModal: this.handleShowDeliverModal,
      onTableLoad: this.handleTableLoad,
      onShowExcpModal: this.handleShowExcpModal,
      sendMessage: this.props.sendMessage,
      deliverConfirm: this.handleDeliverConfirm,
      tenantId: this.props.tenantId,
    }, this.msg);
  }
  state = {
    lastLocReportTime: null,
    selectedRowKeys: [],
  }

  componentWillReceiveProps(nextProps) {
    let newfilters;
    if (nextProps.params.state !== this.props.params.state) {
      newfilters = nextProps.filters.map((flt) => {
        if (flt.name === 'type') {
          return {
            name: 'type',
            value: nextProps.params.state,
          };
        } else {
          return flt;
        }
      });
      this.handleSelectionClear();
    } else if (JSON.stringify(this.props.filters) !== JSON.stringify(nextProps.filters)) {
      newfilters = nextProps.filters;
    }
    if (newfilters) {
      this.props.loadTransitTable(null, {
        tenantId: nextProps.tenantId,
        filters: JSON.stringify(newfilters),
        pageSize: nextProps.shipmentlist.pageSize,
        currentPage: 1,
        /*
           sortField: state.transportTracking.transit.sortField,
           sortOrder: state.transportTracking.transit.sortOrder,
           */
      });
    }
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTransitTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
        filters: JSON.stringify(this.props.filters),
      };
      return params;
    },
    remotes: this.props.shipmentlist,
  })
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleTableLoad = (filters, current/* , sortField, sortOrder */) => {
    this.handleSelectionClear();
    this.props.loadTransitTable(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.shipmentlist.pageSize,
      currentPage: current || this.props.shipmentlist.current,
      /*
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
     */
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleShowVehicleModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showVehicleModal(row.disp_id, row.shipmt_no);
  }
  handleShowPickModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const shipments = [{ dispId: row.disp_id, shipmtNo: row.shipmt_no }];
    this.props.showDateModal(shipments, 'pickup');
  }
  handleShowDeliverModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const shipments = [{ dispId: row.disp_id, shipmtNo: row.shipmt_no }];
    this.props.showDateModal(shipments, 'deliver');
  }
  handleShowBatchPickModal = () => {
    const listData = this.props.shipmentlist.data;
    const shipments = this.state.selectedRowKeys.map((item) => {
      let shipment = {};
      for (let i = 0; i < listData.length; i++) {
        if (listData[i].shipmt_no === item) {
          shipment = { shipmtNo: item, dispId: listData[i].disp_id };
          break;
        }
      }
      return shipment;
    });
    this.props.showDateModal(shipments, 'pickup');
  }
  handleShowBatchDeliverModal = () => {
    const listData = this.props.shipmentlist.data;
    const shipments = this.state.selectedRowKeys.map((item) => {
      let shipment = {};
      for (let i = 0; i < listData.length; i++) {
        if (listData[i].shipmt_no === item) {
          shipment = { shipmtNo: item, dispId: listData[i].disp_id };
          break;
        }
      }
      return shipment;
    });
    this.props.showDateModal(shipments, 'deliver');
  }
  handleShowTransitModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showLocModal({
      shipmt_no: row.shipmt_no,
      parent_no: row.parent_no,
      pickup_act_date: row.pickup_act_date,
    });
  }
  handleShowPodModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showPodModal(-1, row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShowExcpModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showExcpModal(row.disp_id, row.shipmt_no);
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'detail', row).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleReportLocHover = (row) => {
    this.props.loadShipmtLastPoint(row.shipmt_no).then((result) => {
      if (!result.error) {
        this.setState({ lastLocReportTime: result.data.location_time });
      }
    });
  }
  handleDeliverConfirm = (shipmtNo, dispId) => {
    this.props.deliverConfirm(shipmtNo, dispId).then((result) => {
      if (!result.error) {
        this.handleTableLoad();
      } else {
        message.error(result.error.message);
      }
    });
  }
  mergeFilters(curFilters, name, value) {
    const merged = curFilters.filter(flt => flt.name !== name);
    if (value !== null && value !== undefined && value !== '') {
      merged.push({
        name,
        value,
      });
    }
    return merged;
  }

  renderIntransitUpdater = (record) => {
    const reported = this.props.reportedShipmts.indexOf(record.shipmt_no) >= 0;
    const ttMsg = this.state.lastLocReportTime ?
      this.msg('reportTooltipTitle', {
        lastTime: moment(this.state.lastLocReportTime).format('MM-DD HH:mm'),
      }) : this.msg('noReportTooltipTitle');
    const locLabel = (
      <Tooltip title={ttMsg}>
        <span>{this.msg('reportTransitLoc')}</span>
      </Tooltip>
    );
    return (
      <span>
        <RowUpdater label={locLabel} onHover={this.handleReportLocHover}
          onAnchored={this.handleShowTransitModal} row={record}
          className={reported ? 'mdc-text-grey' : ''}
        />
        <span className="ant-divider" />
        <RowUpdater label={this.msg('updateEvents')}
          onAnchored={this.handleShowExcpModal} row={record}
        />
      </span>
    );
  }

  renderBatchOperationButtons() {
    let type = '';
    const types = this.props.filters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      type = types[0].value;
    }
    let buttons = null;
    if (type === 'dispatched') {
      buttons = (
        <div style={{ display: 'inline-block' }}>
          <PrivilegeCover module="transport" feature="tracking" action="edit">
            <Button onClick={this.handleShowBatchPickModal}>批量提货</Button>
          </PrivilegeCover>
        </div>
      );
    } else if (type === 'intransit') {
      buttons = (
        <div style={{ display: 'inline-block' }}>
          <PrivilegeCover module="transport" feature="tracking" action="edit">
            <Button onClick={this.handleShowBatchDeliverModal}>批量交货</Button>
          </PrivilegeCover>
        </div>
      );
    }
    return buttons;
  }

  render() {
    const { shipmentlist, loading } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <div>
        <div className="page-body">
          <div className="panel-header">
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <ExportExcel />
            </PrivilegeCover>
            <span className={`mass-action-btn ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            {this.renderBatchOperationButtons()}
            </span>
          </div>
          <div className="panel-body table-panel">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2000 }}
            />
          </div>
        </div>
        <VehicleModal onOK={this.handleTableLoad} />
        <PickupDeliverModal onOK={this.handleTableLoad} />
        <LocationModal onOK={this.handleTableLoad} />
        <PodModal onOK={this.handleTableLoad} />
        <RevokejectModal reload={this.handleTableLoad} />
        <ExcpEventsModal />
        <ShipmentAdvanceModal />
      </div>
    );
  }
}
