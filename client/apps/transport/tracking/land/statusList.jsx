import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Tooltip, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadShipmtDetail } from 'common/reducers/shipment';
import {
  loadTransitTable, showPodModal, showDateModal, showVehicleModal,
  showLocModal, loadShipmtLastPoint,
} from 'common/reducers/trackingLandStatus';
import RowUpdater from './rowUpdater';
import VehicleModal from './modals/vehicle-updater';
import PickupOrDeliverModal from './modals/pickup-deliver-updater';
import LocationModal from './modals/intransitLocationUpdater';
import PodModal from './modals/pod-submit';
import PreviewPanel from '../../shipment/modals/preview-panel';
import makeColumns from './columnDef';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

function fetchData({ state, dispatch, params, cookie }) {
  const newfilters = state.trackingLandStatus.filters.map(flt => {
    if (flt.name === 'type') {
      return {
        name: 'type',
        value: params.state
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
    showVehicleModal, showLocModal, loadShipmtLastPoint,
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
  }
  constructor(...args) {
    super(...args);
    this.columns = makeColumns('status', {
      onShipmtPreview: this.handleShipmtPreview,
      onShowVehicleModal: this.handleShowVehicleModal,
      onShowPickModal: this.handleShowPickModal,
      renderIntransitUpdater: this.renderIntransitUpdater,
      onShowPodModal: this.handleShowPodModal,
    }, this.msg);
  }
  state = {
    lastLocReportTime: null,
    selectedRowKeys: [],
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.state !== this.props.params.state) {
      const newfilters = nextProps.filters.map(flt => {
        if (flt.name === 'type') {
          return {
            name: 'type',
            value: nextProps.params.state
          };
        } else {
          return flt;
        }
      });
      this.props.loadTransitTable(null, {
        tenantId: nextProps.tenantId,
        filters: JSON.stringify(newfilters),
        pageSize: nextProps.shipmentlist.pageSize,
        currentPage: nextProps.shipmentlist.current,
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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
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
    this.props.showVehicleModal(row.disp_id, row.shipmt_no);
  }
  handleShowPickModal = row => {
    this.props.showDateModal(row.disp_id, row.shipmt_no, 'pickup');
  }
  handleShowDeliverModal = row => {
    this.props.showDateModal(row.disp_id, row.shipmt_no, 'deliver');
  }
  handleShowTransitModal = row => {
    this.props.showLocModal({
      shipmt_no: row.shipmt_no,
      parent_no: row.parent_no,
      pickup_act_date: row.pickup_act_date,
    });
  }
  handleShowPodModal = (row) => {
    this.props.showPodModal(row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShipmtPreview = row => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'tracking').then(result => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleReportLocHover = row => {
    this.props.loadShipmtLastPoint(row.shipmt_no).then(result => {
      if (!result.error) {
        this.setState({ lastLocReportTime: result.data.location_time });
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

  renderIntransitUpdater = (record) => {
    const reported = this.props.reportedShipmts.indexOf(record.shipmt_no) >= 0;
    const ttMsg = this.state.lastLocReportTime ?
      this.msg('reportTooltipTitle', {
        lastTime: moment(this.state.lastLocReportTime).format('MM-DD HH:mm')
    }) : this.msg('noReportTooltipTitle');
    const locLabel = (
      <Tooltip title={ttMsg}>
        <span>{this.msg('reportTransitLoc')}</span>
      </Tooltip>
    );
    return (
      <span>
        <RowUpdater label={locLabel}
          onAnchored={this.handleShowTransitModal} row={record}
          anchorProps={{
            className: reported ? 'mdc-text-grey' : '',
            onHover: this.handleReportLocHover,
          }}
        />
        <span className="ant-divider" />
        <RowUpdater label={this.msg('updateDelivery')}
        onAnchored={this.handleShowDeliverModal} row={record}
        />
      </span>
    );
  }

  render() {
    const { shipmentlist, loading } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      }
    };
    return (
      <div>
        <div className="page-body">
          <div className="panel-body">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2200, y: 460 }}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button shape="circle-outline" icon="cross" onClick={this.handleSelectionClear} className="pull-right" />
          </div>
        </div>
        <PreviewPanel />
        <VehicleModal onOK={this.handleTableLoad} />
        <PickupOrDeliverModal onOK={this.handleTableLoad} />
        <LocationModal onOK={this.handleTableLoad} />
        <PodModal onOK={this.handleTableLoad} />
      </div>
    );
  }
}
