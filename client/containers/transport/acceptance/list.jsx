import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'reusable/components/nav-link';
import SearchBar from 'reusable/components/search-bar';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { loadTable } from 'universal/redux/reducers/shipment';
import { setNavTitle } from 'universal/redux/reducers/navbar';
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
    pageSize: state.shipment.shipmentlist.pageSize,
    currentPage: state.shipment.shipmentlist.current
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
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
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.shipment.shipmentlist,
    filters: state.shipment.filters,
    loading: state.shipment.loading
  }),
  { loadTable })
export default class AcceptList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
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
        sortOrder: sorter.order,
        filters: this.props.filters
      };
      params.filters = params.filters.filter(
        flt => flt.name in filters && filters[flt.name].length
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
    dataIndex: 'shipmt_no'
  }, {
    title: this.msg('shipRequirement'),
    dataIndex: 'sr_name'
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    render: (o, record) => moment(record.pickupDate).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipTransitTime'),
    dataIndex: 'transit_time'
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'delivery_est_date',
    render: (o, record) => moment(record.deliveryDate).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consiger_name'
  }, {
    title: this.msg('consignorPlace'),
    dataIndex: 'consiger_city'
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consiger_addr'
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consigee_name'
  }, {
    title: this.msg('consigneePlace'),
    dataIndex: 'consigee_city'
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consigee_addr'
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'mode'
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count'
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight'
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume'
  }, {
    title: this.msg('shipSource'),
    dataIndex: 'source'
  }, {
    title: this.msg('shipCreateDate'),
    dataIndex: 'created_date',
    render: (text, record) => moment(record.created_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    render: (text, record) => moment(record.acpt_time).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipmtOP')
  }]
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleSearch = (searchVal) => {
    const filters = JSON.stringify(
      this.mergeFilters(this.props.filters, 'name', searchVal)
    );
    this.props.loadTable(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.shipmentlist.pageSize,
      currentPage: 1,
      filters
    });
  }
  handleShipmentFilter = (ev) => {
    const { shipmentlist, tenantId, filters } = this.props;
    const partnerType = ev.target.value;
    const typeValue = partnerType !== 'all' ? parseInt(partnerType, 10) : undefined;
    const filterArray = this.mergeFilters(filters, 'partnerType', typeValue);
    this.props.loadTable(null, {
      tenantId,
      filters: JSON.stringify(filterArray),
      pageSize: shipmentlist.pageSize,
      currentPage: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
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
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          </div>
          <RadioGroup onChange={this.handleShipmentFilter} defaultValue="unaccepted">
            <RadioButton value="unaccepted">{this.msg('unacceptedShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <NavLink to="/transport/acceptance/shipment/new">
              <Button type="primary">
                <Icon type="plus-circle-o" /><span>{formatGlobalMsg(intl, 'createNew')}</span>
              </Button>
            </NavLink>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(intl, 'clearSelection')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
