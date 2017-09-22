import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, message, Popover, Tag } from 'antd';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { loadExcpShipments, changeExcpFilter } from 'common/reducers/trackingLandException';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import ShipmtnoColumn from '../../common/shipmtnoColumn';
import AddressColumn from '../../common/addressColumn';
import ExceptionsPopover from '../../common/popover/exceptionsPopover';
import MyShipmentsSelect from '../../common/myShipmentsSelect';
import CustomerSelect from '../../common/customerSelect';
import AdvancedSearchBar from '../../common/advanced-search-bar';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

function fetchData({ state, dispatch, params, cookie }) {
  const newfilters = state.trackingLandException.filters.map((flt) => {
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
  return dispatch(loadExcpShipments(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(newfilters),
    pageSize: state.trackingLandException.shipmentlist.pageSize,
    currentPage: state.trackingLandException.shipmentlist.current,
  }));
}
function renderActDate(recordActDate, recordEstDate) {
  if (recordActDate) {
    const actDate = new Date(recordActDate);
    actDate.setHours(0, 0, 0, 0);
    const estDate = new Date(recordEstDate);
    estDate.setHours(0, 0, 0, 0);
    if (actDate.getTime() > estDate.getTime()) {
      return (
        <span className="mdc-text-red">
          {moment(recordActDate).format('YYYY.MM.DD')}
        </span>);
    } else {
      return (
        <span className="mdc-text-green">
          {moment(recordActDate).format('YYYY.MM.DD')}
        </span>);
    }
  } else {
    return <span />;
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.trackingLandException.shipmentlist,
    filters: state.trackingLandException.filters,
    loading: state.trackingLandException.loading,
    clients: state.shipment.formRequire.clients,
    carriers: state.shipment.partners,
  }),
  { loadExcpShipments, loadShipmtDetail, changeExcpFilter })
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
    loadShipmtDetail: PropTypes.func.isRequired,
    loadExcpShipments: PropTypes.func.isRequired,
    changeExcpFilter: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired,
    carriers: PropTypes.array.isRequired,
  }
  state = {
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
    } else if (JSON.stringify(this.props.filters) !== JSON.stringify(nextProps.filters)) {
      newfilters = nextProps.filters;
    }
    if (!nextProps.loading && newfilters) {
      this.props.loadExcpShipments(null, {
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
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadExcpShipments(null, params),
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
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  columns = () => [{
    title: this.msg('shipNo'),
    dataIndex: 'shipmt_no',
    fixed: 'left',
    width: 130,
    render: (o, record) => <ShipmtnoColumn shipmtNo={record.shipmt_no} shipment={record} onClick={this.handleShipmtPreview} />,
  }, {
    fixed: 'left',
    dataIndex: 'excp_count',
    width: 60,
    render: (o, record) => (<ExceptionsPopover
      shipmtNo={record.shipmt_no}
      dispId={record.disp_id}
      excpCount={o}
    />),
  }, {
    title: this.msg('shipmtLastException'),
    fixed: 'left',
    width: 190,
    dataIndex: 'excp_level',
    render: (o, record) => {
      const excpLastEvent = record.excp_last_event.length > 12 ? record.excp_last_event.substr(0, 12).concat('...') : record.excp_last_event;
      let ExcpLastEventWithIcon = '';
      if (o === 'INFO') {
        ExcpLastEventWithIcon = (<span className="alert-tag ant-alert-info"><Icon type="info-circle" /> {excpLastEvent}</span>);
      } else if (o === 'WARN') {
        ExcpLastEventWithIcon = (<span className="alert-tag ant-alert-warning"><Icon type="exclamation-circle" /> {excpLastEvent}</span>);
      } else if (o === 'ERROR') {
        ExcpLastEventWithIcon = (<span className="alert-tag ant-alert-error"><Icon type="cross-circle" /> {excpLastEvent}</span>);
      }
      return (
        <Popover placement="rightTop" title={record.shipmt_no} content={record.excp_last_event} trigger="hover">
          {ExcpLastEventWithIcon}
        </Popover>
      );
    },
  }, {
    title: this.msg('shipmtStatus'),
    dataIndex: 'status',
    width: 100,
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return <Tag>{this.msg('pendingShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
        return <Tag>{this.msg('acceptedShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
        return <Tag color="yellow">{this.msg('dispatchedShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
        return <Tag color="blue">{this.msg('intransitShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
        return <Tag color="green">{this.msg('deliveredShipmt')}</Tag>;
      } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
        return <Tag color="green">{this.msg('proofOfDelivery')}</Tag>;
      } else {
        return <span />;
      }
    },
  }, {
    title: this.msg('shipmtPrevTrack'),
    width: 140,
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return `${this.msg('sendAction')}
          ${moment(record.disp_time).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
        return `${this.msg('acceptAction')}
          ${moment(record.acpt_time).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
        return `${this.msg('dispatchAction')}
          ${moment(record.disp_time).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
        return `${this.msg('pickupAction')}
          ${moment(record.pickup_act_date).format('MM.DD HH:mm')}`;
      } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
        return `${this.msg('deliverAction')}
          ${moment(record.deliver_act_date).format('MM.DD HH:mm')}`;
      } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
        return `${this.msg('podUploadAction')}
          ${moment(record.pod_recv_date).format('MM.DD HH:mm')}`;
      }
      return '';
    },
  }, {
    title: this.msg('shipmtCarrier'),
    dataIndex: 'sp_name',
    width: 180,
    render: (o, record) => {
      if (record.sp_name) {
        if (record.sp_tenant_id > 0) {
          return (
            <span>
              <i className="zmdi zmdi-circle mdc-text-green" />
              <TrimSpan text={record.sp_name} maxLen={10} />
            </span>
          );
        } else if (record.sp_tenant_id === -1) {
          return (
            <span>
              <i className="zmdi zmdi-circle mdc-text-grey" />
              <TrimSpan text={record.sp_name} maxLen={10} />
            </span>
          );
        } else {
          return record.sp_name;
        }
      } else {
        return this.msg('ownFleet');
      }
    },
    filters: this.props.carriers.map(item => ({ text: item.partner_code ? `${item.partner_code} | ${item.name}` : item.name, value: item.partner_id })),
  }, {
    title: this.msg('shipmtVehicle'),
    dataIndex: 'task_vehicle',
    width: 120,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 70,
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 70,
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 70,
  }, {
    title: this.msg('srName'),
    dataIndex: 'p_sr_name',
    width: 180,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('departurePlace'),
    width: 250,
    render: (o, record) => <AddressColumn shipment={record} consignType="consigner" />,
  }, {
    title: this.msg('arrivalPlace'),
    width: 250,
    render: (o, record) => <AddressColumn shipment={record} consignType="consignee" />,
  }, {
    title: this.msg('shipmtMode'),
    dataIndex: 'transport_mode',
    width: 80,
  }, {
    title: this.msg('shipmtEstPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 100,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('shipmtActPickupDate'),
    dataIndex: 'pickup_act_date',
    width: 100,
    render: (o, record) => renderActDate(record.pickup_act_date, record.pickup_est_date),
  }, {
    title: this.msg('shipmtEstDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 100,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('shipmtPrmDeliveryDate'),
    dataIndex: 'deliver_prm_date',
    width: 100,
    render: o => o ? moment(o).format('YYYY.MM.DD') : '',
  }, {
    title: this.msg('shipmtActDeliveryDate'),
    dataIndex: 'deliver_act_date',
    width: 100,
    render: (o, record) => renderActDate(record.deliver_act_date, record.deliver_est_date),
  }, {
    title: this.msg('overtime'),
    key: 'late',
    width: 100,
    render(o, record) {
      if (record.status >= SHIPMENT_TRACK_STATUS.delivered) {
        const deliveredActDate = new Date(record.deliver_act_date);
        deliveredActDate.setHours(0, 0, 0, 0);
        const deliverEstDate = new Date(record.deliver_est_date);
        deliverEstDate.setHours(0, 0, 0, 0);
        const daysDiff = moment(deliveredActDate).diff(deliverEstDate, 'days');
        if (daysDiff > 0) {
          return `超时${daysDiff}天`;
        }
      }
      return '';
    },
  }, {
    title: this.msg('proofOfDelivery'),
    dataIndex: 'pod_type',
    width: 50,
    render: (text, record) => {
      if (record.pod_type === 'none') {
        return <Icon type="tags-o" />;
      } else if (record.pod_type === 'ePOD') {
        return <Icon type="tags" />;
      } else {
        return <Icon type="qrcode" />;
      }
    },
  }, {
    title: this.msg('spDispLoginName'),
    dataIndex: 'sp_disp_login_name',
    width: 80,
  }]
  handleTableLoad = (filters, current/* , sortField, sortOrder */) => {
    this.props.loadExcpShipments(null, {
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
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sr', 'track').then((result) => {
      if (result.error) {
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
    this.props.changeExcpFilter('viewStatus', searchVals.viewStatus);
  }

  handleSearchInput = (value) => {
    this.setState({ searchInput: value });
    this.props.changeExcpFilter('shipmt_no', value);
  }

  toggleAdvancedSearch = () => {
    this.setState({ advancedSearchVisible: !this.state.advancedSearchVisible });
  }

  showAdvancedSearch = (advancedSearchVisible) => {
    this.setState({ advancedSearchVisible });
  }

  handleAdvancedSearch = (searchVals) => {
    Object.keys(searchVals).forEach((key) => {
      this.props.changeExcpFilter(key, searchVals[key]);
    });
    this.showAdvancedSearch(false);
  }

  handleCustomerChange = (srPartnerId, srTenantId) => {
    let value;
    if (srPartnerId !== -1) {
      value = srPartnerId;
    }
    this.props.changeExcpFilter('sr_tenant_id', srTenantId);
    this.props.changeExcpFilter('sr_partner_id', value);
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
    const columns = this.columns();
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
          dataSource={this.dataSource} scroll={{ x: 2780 }} selectedRowKeys={this.state.selectedRowKeys}
          handleDeselectRows={this.handleSelectionClear}
        />
      </div>
    );
  }
}
