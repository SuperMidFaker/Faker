import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'reusable/components/nav-link';
import SearchBar from 'reusable/components/search-bar';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { loadShipmtDetail } from 'universal/redux/reducers/shipment';
import { loadTable, loadAcceptDispatchers, revokeOrReject, delDraft } from
  'universal/redux/reducers/transport-acceptance';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { SHIPMENT_SOURCE, SHIPMENT_EFFECTIVES } from 'universal/constants';
import AccepterModal from '../shipment/modals/accepter';
import RevokejectModal from '../shipment/modals/revoke-reject';
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
  return dispatch(loadTable(cookie, {
    tenantId: state.account.tenantId,
    filters: JSON.stringify(state.transportAcceptance.table.filters),
    pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
    currentPage: state.transportAcceptance.table.shipmentlist.current,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.transportAcceptance.table.shipmentlist,
    filters: state.transportAcceptance.table.filters,
    loading: state.transportAcceptance.table.loading,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
  }),
  { loadTable, loadAcceptDispatchers, revokeOrReject, loadShipmtDetail, delDraft })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentWillReceiveProps') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'transportAcceptance'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
export default class AcceptList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    delDraft: PropTypes.func.isRequired,
    revokeOrReject: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadAcceptDispatchers: PropTypes.func.isRequired,
    loadTable: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(null, params),
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
    width: 140,
    render: (o, record) => {
      if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
        return (
          <a style={{ color : '#999' }} onClick={() => this.handleShipmtPreview(record.shipmt_no)}>
          {o}
          </a>
        );
      } else {
        return <a onClick={() => this.handleShipmtPreview(record.shipmt_no)}>{o}</a>;
      }
    }
  }, {
    title: this.msg('shipRequirement'),
    dataIndex: 'sr_name',
    width: 200
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'transport_mode',
    width: 80
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 80,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipTransitTime'),
    dataIndex: 'transit_time',
    width: 80,
    render: (o, record) => <span>{record.transit_time}{this.msg('day')}</span>
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 80,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 150,
  }, {
    title: this.msg('consignorPlace'),
    width: 150,
    render: (o, record) => this.renderConsignLoc(record, 'consigner')
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    width: 150,
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 150,
  }, {
    title: this.msg('consigneePlace'),
    width: 150,
    render: (o, record) => this.renderConsignLoc(record, 'consignee')
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 150,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 150
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 150
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 150
  }, {
    title: this.msg('shipSource'),
    dataIndex: 'source',
    width: 40,
    render: (o, record) => {
      if (record.source === SHIPMENT_SOURCE.consigned) {
        return this.msg('consginSource');
      } else if (record.source === SHIPMENT_SOURCE.subcontracted) {
        return this.msg('subcontractSource');
      } else {
        return <span />;
      }
    }
  }, {
    title: this.msg('shipCreateDate'),
    dataIndex: 'created_date',
    sorter: true,
    render: (text, record) => moment(record.created_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    sorter: true,
    render: (text, record) => record.acpt_time ?
     moment(record.acpt_time).format('YYYY.MM.DD') : ' '
  }]
  handleTableLoad = (filters, current, sortField, sortOrder) => {
    this.props.loadTable(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.shipmentlist.pageSize,
      currentPage: current || this.props.shipmentlist.current,
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (searchVal) => {
    const filters = this.mergeFilters(this.props.filters, 'name', searchVal);
    this.handleTableLoad(filters, 1);
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
  handleShipmtAccept(dispId) {
    this.props.loadAcceptDispatchers(
      this.props.tenantId, dispId
    ).then(result => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleShipmtRevoke(dispId) {
    this.props.revokeOrReject('revoke', dispId);
  }
  handleShipmtReject(dispId) {
    this.props.revokeOrReject('reject', dispId);
  }
  handleShipmtDraftDel(shipmtNo) {
    this.props.delDraft(shipmtNo).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleTableLoad(undefined, 1);
      }
    });
  }
  handleShipmtPreview(shipmtNo) {
    this.props.loadShipmtDetail(shipmtNo, this.props.tenantId, 'sp').then(result => {
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
    const county = `${field}_district`;
    const names = [];
    if (shipmt[city] && (shipmt[city] === '市辖区' || shipmt[city] === '县')) {
      if (shipmt[province]) {
        names.push(shipmt[province]);
      }
      if (shipmt[county]) {
        names.push(shipmt[county]);
      }
      return names.join('-');
    } else if (shipmt[county] && (shipmt[county] === '市辖区' || shipmt[county] === '县')) {
      return shipmt[city] || '';
    } else {
      if (shipmt[city]) {
        names.push(shipmt[city]);
      }
      if (shipmt[county]) {
        names.push(shipmt[county]);
      }
      return names.join('-');
    }
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
    let columns = this.columns;
    if (radioValue === 'unaccepted') {
      columns = [ ...columns, {
        title: formatContainerMsg(this.props.intl, 'opColumn'),
        width: 100,
        render: (o, record) => {
          if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
            return <span />;
          } else if (record.source === SHIPMENT_SOURCE.consigned) {
            return (
              <span>
                <a role="button" onClick={() => this.handleShipmtAccept(record.key)}>
                {this.msg('shipmtAccept')}
                </a>
                <span className="ant-divider" />
                <NavLink to={`/transport/acceptance/shipment/edit/${record.shipmt_no}`}>
                {formatGlobalMsg(this.props.intl, 'modify')}
                </NavLink>
                <span className="ant-divider" />
                <a role="button" onClick={() => this.handleShipmtRevoke(record.key)}>
                {this.msg('shipmtRevoke')}
                </a>
              </span>
            );
          } else if (record.source === SHIPMENT_SOURCE.subcontracted) {
            return (
              <span>
                <a role="button" onClick={() => this.handleShipmtAccept(record.key)}>
                {this.msg('shipmtAccept')}
                </a>
                <span className="ant-divider" />
                <a role="button" onClick={() => this.handleShipmtReject(record.key)}>
                {this.msg('shipmtReject')}
                </a>
              </span>
            );
          }
        }
      }];
    } else if (radioValue === 'draft') {
      columns = [ ...columns, {
        title: formatContainerMsg(this.props.intl, 'opColumn'),
        width: 100,
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/transport/acceptance/shipment/draft/${record.shipmt_no}`}>
              {formatGlobalMsg(this.props.intl, 'modify')}
              </NavLink>
              <span className="ant-divider" />
              <a role="button" onClick={() => this.handleShipmtDraftDel(record.shipmt_no)}>
              {formatGlobalMsg(this.props.intl, 'delete')}
              </a>
            </span>
          );
        }
      }];
    }
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="unaccepted">{this.msg('unacceptedShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
          </RadioGroup>
          <span style={{marginLeft: '10px'}} />
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="draft">{this.msg('draftShipmt')}</RadioButton>
            <RadioButton value="archived">{this.msg('archivedShipmt')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body fixed">
          <div className="panel-header">
            <NavLink to="/transport/acceptance/shipment/new">
              <Button type="primary">
                <Icon type="plus-circle-o" /><span>{formatGlobalMsg(intl, 'createNew')}</span>
              </Button>
            </NavLink>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={columns} loading={loading}
              dataSource={this.dataSource} useFixedHeader columnsPageRange={[7, 18]} columnsPageSize={3}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(intl, 'clearSelection')}
            </Button>
          </div>
        </div>
        <AccepterModal reload={this.handleTableLoad} />
        <RevokejectModal reload={this.handleTableLoad} />
        <PreviewPanel />
      </div>
    );
  }
}
