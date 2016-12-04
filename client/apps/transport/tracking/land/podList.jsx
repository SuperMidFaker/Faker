import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { loadPodTable, showAuditModal, resubmitPod, showPodModal } from
  'common/reducers/trackingLandPod';
import PodAuditModal from './modals/pod-audit';
import PodModal from './modals/pod-submit';
import makeColumns from './columnDef';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { sendMessage } from 'common/reducers/corps';
const formatMsg = format(messages);

function fetchData({ state, dispatch, params, cookie }) {
  const newfilters = state.trackingLandPod.filters.map((flt) => {
    if (flt.name === 'type') {
      return {
        name: 'type',
        value: params.state,
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
    loaded: state.trackingLandPod.loaded,
  }),
  { loadPodTable, loadShipmtDetail, showAuditModal, resubmitPod, showPodModal,
    sendMessage })
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
    showAuditModal: PropTypes.func.isRequired,
    resubmitPod: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadPodTable: PropTypes.func.isRequired,
    showPodModal: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
  }
  constructor(...args) {
    super(...args);
    this.columns = makeColumns('pod', {
      onShipmtPreview: this.handleShipmtPreview,
      onShowAuditModal: this.handleShowAuditModal,
      onResubmit: this.handleResubmit,
      onShowPodModal: this.handleShowPodModal,
      tenantId: this.props.tenantId,
      sendMessage: this.props.sendMessage,
    }, this.msg);
  }
  state = {
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
    } else if (JSON.stringify(this.props.filters) !== JSON.stringify(nextProps.filters)) {
      newfilters = nextProps.filters;
    }
    if (newfilters) {
      this.props.loadPodTable(null, {
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
    fetcher: params => this.props.loadPodTable(null, params),
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
  msg = descriptor => formatMsg(this.props.intl, descriptor)
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
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleShowPodModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showPodModal(-1, row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShowAuditModal = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showAuditModal(row.disp_id, row.parent_id, row.pod_id);
  }
  handleResubmit = (row, ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.showPodModal(row.pod_id, row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'pod', row).then((result) => {
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
        value,
      });
    }
    return merged;
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
            <span className={`mass-action-btn ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`} />
          </div>
          <div className="panel-body table-panel">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2260 }}
            />
          </div>
        </div>
        <PodAuditModal />
        <PodModal onOK={this.handleTableLoad} />
      </div>
    );
  }
}
