import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { loadPodTable, loadPod, showAuditModal, resubmitPod } from
  'common/reducers/trackingLandPod';
import PodAuditModal from './modals/pod-audit';
import PreviewPanel from '../../shipment/modals/preview-panel';
import makeColumns from './columnDef';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatMsg = format(messages);
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
  { loadPodTable, loadShipmtDetail, loadPod, showAuditModal, resubmitPod })
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
    resubmitPod: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadPodTable: PropTypes.func.isRequired
  }
  constructor(...args) {
    super(...args);
    this.columns = makeColumns('pod', {
      onShipmtPreview: this.handleShipmtPreview,
      onShowAuditModal: this.handleShowAuditModal,
      onResubmit: this.handleResubmit,
    }, this.msg);
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
        this.props.showAuditModal(row.disp_id, row.parent_id, row.pod_id);
      }
    });
  }
  handleResubmit = row => {
    this.props.resubmitPod(row.disp_id, row.parent_id).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleTableLoad();
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
          <div className="panel-body">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2400, y: 460 }}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button shape="circle-outline" icon="cross" onClick={this.handleSelectionClear} className="pull-right" />
          </div>
        </div>
        <PreviewPanel />
        <PodAuditModal onOK={this.handleTableLoad} />
      </div>
    );
  }
}
