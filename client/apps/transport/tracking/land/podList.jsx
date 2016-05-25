import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { loadPodTable, loadPod, showAuditModal } from
  'common/reducers/trackingLandPod';
import { SHIPMENT_POD_STATUS } from 'common/constants';
import RowUpdater from './rowUpdater';
import PodAuditModal from './modals/pod-audit';
import PreviewPanel from '../../shipment/modals/preview-panel';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const formatGlobalMsg = format(globalMessages);

function fetchData({ state, dispatch, params, cookie }) {
  const newfilters = state.trackingLandPod.filters.map(flt => {
    if (flt.name === 'type') {
      return {
        name: 'type',
        value: params.state
      };
    } else {
      return flt;
    }
  });
  return dispatch(loadPodTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(newfilters),
    pageSize: state.trackingLandPod.shipmentlist.pageSize,
    currentPage: state.trackingLandPod.shipmentlist.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.trackingLandPod.shipmentlist,
    filters: state.trackingLandPod.filters,
    loading: state.trackingLandPod.loading,
  }),
  { loadPodTable, loadShipmtDetail, loadPod, showAuditModal })
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
    loadPod: PropTypes.func.isRequired,
    showAuditModal: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadPodTable: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
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
      this.props.loadPodTable(null, {
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
    fetcher: params => this.props.loadPodTable(null, params),
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
      return (
        <RowUpdater label={o} onAnchored={this.handleShipmtPreview}
        row={record}
        />
      );
    }
  }, {
    title: this.msg('shipmtStatus'),
    dataIndex: 'status',
    width: 140,
    render: () => {
      return `6 ${this.msg('proofOfDelivery')}`;
    }
  }, {
    title: this.msg('shipmtPrevTrack'),
    width: 140,
    render: (o, record) => {
      return `${this.msg('podUploadAction')}
      ${moment(record.pod_recv_date).format('MM.DD HH:mm')}`;
    },
  }, {
    title: this.msg('proofOfDelivery'),
    width: 140,
    render: (o, record) => {
      if (record.pod_status === SHIPMENT_POD_STATUS.pending) {
        return (
          <div>
            <Icon type="tags" />
            <RowUpdater label={this.msg('auditPod')}
              onAnchored={this.handleShowAuditModal} row={record}
            />
          </div>
        );
      } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
        return (
          <span>
            <i className="mdc-text-red anticon anticon-tags" />
            {this.msg('rejectByUs')}
          </span>
        );
      } else if (record.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
        return (
          <span>
            <Icon type="tags" />
            {this.msg('submitToUpper')}
          </span>
        );
      } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
        return (
          <div>
            <i className="mdc-text-red anticon anticon-tags" />
            <RowUpdater label={this.msg('resubmitPod')}
              onAnchored={this.handleShowVehicleModal} row={record}
            />
          </div>
        );
      } else {
        const tagIcon = record.pod_type === 'qrcode' ? <Icon type="qrcode" /> :
          <Icon type="tags" />;
        return (
          <span>
            {tagIcon}
            {this.msg('acceptByUpper')}
          </span>
        );
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
  }]
  handleTableLoad = (filters, current/* , sortField, sortOrder */) => {
    this.props.loadPodTable(null, {
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
  handleShowAuditModal = (row) => {
    this.props.loadPod(row.pod_id).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.showAuditModal(row.disp_id);
      }
    });
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr').then(result => {
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
    return (
      <div>
        <div className="page-body">
          <div className="panel-header">
            <NavLink to="/transport/acceptance/shipment/new">
              <Button icon="export" type="primary">
                <span>{formatGlobalMsg(intl, 'export')}</span>
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
        <PodAuditModal onOK={this.handleTableLoad} />
      </div>
    );
  }
}
