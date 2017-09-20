import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tooltip, message } from 'antd';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadShipmtDetail } from 'common/reducers/shipment';
import {
  loadTransitTable, showDateModal, showVehicleModal,
  showLocModal, loadShipmtLastPoint, deliverConfirm,
  changeStatusFilter,
} from 'common/reducers/trackingLandStatus';
import RowUpdater from 'client/components/rowUpdater';
import VehicleModal from './modals/vehicle-updater';
import PickupDeliverModal from './modals/pickup-deliver-updater';
import LocationModal from './modals/intransitLocationUpdater';
import SearchBar from 'client/components/SearchBar';
import makeColumns from './columnDef';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import RevokejectModal from '../../shipment/dock/revoke-reject';
import { sendMessage } from 'common/reducers/notification';
import AdvancedSearchBar from '../../common/advanced-search-bar';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
import CustomerSelect from '../../common/customerSelect';
import { SHIPMENT_VEHICLE_CONNECT } from 'common/constants';

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
  if (!newfilters.find(item => item.name === 'loginId')) {
    newfilters.push({
      name: 'loginId',
      value: state.account.loginId,
    });
  }
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
    loaded: state.trackingLandStatus.loaded,
    carriers: state.shipment.partners,
  }),
  {
    loadTransitTable,
    loadShipmtDetail,
    showDateModal,
    showVehicleModal,
    showLocModal,
    loadShipmtLastPoint,
    sendMessage,
    deliverConfirm,
    changeStatusFilter,
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
    loaded: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    reportedShipmts: PropTypes.array.isRequired,
    showVehicleModal: PropTypes.func.isRequired,
    showDateModal: PropTypes.func.isRequired,
    showLocModal: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadTransitTable: PropTypes.func.isRequired,
    loadShipmtLastPoint: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    deliverConfirm: PropTypes.func.isRequired,
    changeStatusFilter: PropTypes.func.isRequired,
    carriers: PropTypes.array.isRequired,
  }
  state = {
    lastLocReportTime: null,
    selectedRowKeys: [],
    searchInput: '',
    advancedSearchVisible: false,
  }
  componentWillMount() {
    let searchInput;
    const nos = this.props.filters.filter(flt => flt.name === 'shipmt_no');
    if (nos.length === 1) {
      searchInput = nos[0].value;
    }
    this.setState({ searchInput });
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
    if (!nextProps.loading && (!nextProps.loaded || newfilters)) {
      this.props.loadTransitTable(null, {
        tenantId: nextProps.tenantId,
        filters: JSON.stringify(newfilters || this.props.filters),
        pageSize: nextProps.shipmentlist.pageSize,
        currentPage: 1,
        /*
           sortField: state.transportTracking.transit.sortField,
           sortOrder: state.transportTracking.transit.sortOrder,
           */
      });
    }
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadTransitTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const newFilters = [...this.props.filters];
      const index = newFilters.findIndex(item => item.name === 'sp_name');
      if (index >= 0) {
        newFilters.splice(index, 1);
      }
      if (filters.sp_name && filters.sp_name.length > 0) {
        newFilters.push({ name: 'sp_name', value: filters.sp_name });
      }
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
        filters: JSON.stringify(newFilters),
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
  handleShowVehicleModal = (row) => {
    this.props.showVehicleModal(row.disp_id, row.shipmt_no);
  }
  handleShowPickModal = (row) => {
    const location = {
      province: row.consigner_province,
      city: row.consigner_city,
      district: row.consigner_district,
      address: row.consigner_addr,
    };
    const shipments = [{
      dispId: row.disp_id,
      shipmtNo: row.shipmt_no,
      parentNo: row.parent_no,
      estDate: row.pickup_est_date,
      location,
    }];
    this.props.showDateModal(shipments, 'pickup');
  }
  handleShowDeliverModal = (row) => {
    const location = {
      province: row.consignee_province,
      city: row.consignee_city,
      district: row.consignee_district,
      address: row.consignee_addr,
    };
    const shipments = [{
      dispId: row.disp_id,
      shipmtNo: row.shipmt_no,
      parentNo: row.parent_no,
      estDate: row.deliver_est_date,
      location,
    }];
    this.props.showDateModal(shipments, 'deliver');
  }
  handleShowBatchPickModal = () => {
    const listData = this.props.shipmentlist.data;
    const diffShipments = [];
    const shipments = this.state.selectedRowKeys.map((item) => {
      let shipment = {};
      for (let i = 0; i < listData.length; i++) {
        if (listData[i].shipmt_no === item) {
          const location = {
            province: listData[i].consigner_province,
            city: listData[i].consigner_city,
            district: listData[i].consigner_district,
            address: listData[i].consigner_addr,
          };
          shipment = {
            shipmtNo: item,
            dispId: listData[i].disp_id,
            parentNo: listData[i].parent_no,
            estDate: listData[i].pickup_est_date,
            location,
          };
          if (listData[i].sp_tenant_id > 0 || listData[i].sp_tenant_id === 0 && listData[i].vehicle_connect_type !== SHIPMENT_VEHICLE_CONNECT.disconnected) {
            diffShipments.push(item);
          }
          break;
        }
      }
      return shipment;
    });
    if (diffShipments.length === 0) {
      this.props.showDateModal(shipments, 'pickup');
    } else {
      message.warn(`运单 ${diffShipments.join(',')} 不能进行此操作`, 5);
    }
  }
  handleShowBatchDeliverModal = () => {
    const listData = this.props.shipmentlist.data;
    const diffShipments = [];
    const shipments = this.state.selectedRowKeys.map((item) => {
      let shipment = {};
      for (let i = 0; i < listData.length; i++) {
        if (listData[i].shipmt_no === item) {
          const location = {
            province: listData[i].consignee_province,
            city: listData[i].consignee_city,
            district: listData[i].consignee_district,
            address: listData[i].consignee_addr,
          };
          shipment = {
            shipmtNo: item,
            dispId: listData[i].disp_id,
            parentNo: listData[i].parent_no,
            estDate: listData[i].deliver_est_date,
            location,
          };
          if (listData[i].sp_tenant_id > 0 || listData[i].sp_tenant_id === 0 && listData[i].vehicle_connect_type !== SHIPMENT_VEHICLE_CONNECT.disconnected) {
            diffShipments.push(item);
          }
          break;
        }
      }
      return shipment;
    });
    if (diffShipments.length === 0) {
      this.props.showDateModal(shipments, 'deliver');
    } else {
      message.warn(`运单 ${diffShipments.join(',')} 不能进行此操作`, 5);
    }
  }
  handleShowTransitModal = (row) => {
    this.props.showLocModal({
      shipmt_no: row.shipmt_no,
      parent_no: row.parent_no,
      disp_id: row.disp_id,
    });
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'activity').then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
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
        message.error(result.error.message, 10);
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

  handleShipmentViewSelect = (searchVals) => {
    this.props.changeStatusFilter('viewStatus', searchVals.viewStatus);
  }

  handleSearchInput = (value) => {
    this.setState({ searchInput: value });
    this.props.changeStatusFilter('shipmt_no', value);
  }

  toggleAdvancedSearch = () => {
    this.setState({ advancedSearchVisible: !this.state.advancedSearchVisible });
  }

  showAdvancedSearch = (advancedSearchVisible) => {
    this.setState({ advancedSearchVisible });
  }

  handleAdvancedSearch = (searchVals) => {
    Object.keys(searchVals).forEach((key) => {
      this.props.changeStatusFilter(key, searchVals[key]);
    });
    this.showAdvancedSearch(false);
  }

  handleCustomerChange = (srPartnerId, srTenantId) => {
    let value;
    if (srPartnerId !== -1) {
      value = srPartnerId;
    }
    this.props.changeStatusFilter('sr_tenant_id', srTenantId);
    this.props.changeStatusFilter('sr_partner_id', value);
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
      <PrivilegeCover module="transport" feature="tracking" action="edit">
        <span>
          <RowUpdater label={locLabel} onHover={this.handleReportLocHover}
            onHit={this.handleShowTransitModal} row={record}
            className={reported ? 'mdc-text-grey' : ''}
          />
        </span>
      </PrivilegeCover>
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
            <Button onClick={this.handleShowBatchDeliverModal}>批量送货</Button>
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
    const columns = makeColumns('status', {
      onShipmtPreview: this.handleShipmtPreview,
      onShowVehicleModal: this.handleShowVehicleModal,
      onShowPickModal: this.handleShowPickModal,
      renderIntransitUpdater: this.renderIntransitUpdater,
      onShowDeliverModal: this.handleShowDeliverModal,
      onTableLoad: this.handleTableLoad,
      sendMessage: this.props.sendMessage,
      deliverConfirm: this.handleDeliverConfirm,
      tenantId: this.props.tenantId,
      carriers: this.props.carriers,
    }, this.msg);
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchShipmtPH')} onInputSearch={this.handleSearchInput}
        value={this.state.searchInput} size="large"
      />
      <span />
      <CustomerSelect onChange={this.handleCustomerChange} size="large" />
      <span />
      <MyShipmentsSelect onChange={this.handleShipmentViewSelect} size="large" />
      <span />
      <a onClick={this.toggleAdvancedSearch}>过滤选项</a>
    </span>);
    return (
      <div>
        <AdvancedSearchBar visible={this.state.advancedSearchVisible} onSearch={this.handleAdvancedSearch} toggle={this.toggleAdvancedSearch} />
        <DataTable toolbarActions={toolbarActions} rowSelection={rowSelection} columns={columns} loading={loading}
          dataSource={this.dataSource} scroll={{ x: 2720 }} selectedRowKeys={this.state.selectedRowKeys}
          handleDeselectRows={this.handleSelectionClear}
        />
        <VehicleModal onOK={this.handleTableLoad} />
        <PickupDeliverModal onOK={this.handleTableLoad} />
        <LocationModal onOK={this.handleTableLoad} />
        <RevokejectModal reload={this.handleTableLoad} />
      </div>
    );
  }
}
