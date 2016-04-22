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
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

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
    text: formatMsg(props.intl, 'listTitle'),
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shipmentlist: state.shipment.shipmentlist,
    shipmentStatusTypes: state.shipment.statusTypes,
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
    shipmentStatusTypes: PropTypes.array.isRequired,
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
    dataIndex: 'shipNo'
  }, {
    title: this.msg('shipCarrier'),
    dataIndex: 'carrier'
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'mode'
  }, {
    title: this.msg('shipSource'),
    dataIndex: 'source'
  }, {
    title: this.msg('shipDestination'),
    dataIndex: 'destination'
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickupDate',
    render: (o, record) => moment(record.pickupDate).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliveryDate',
    render: (o, record) => moment(record.deliveryDate).format('YYYY.MM.DD')
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'packageNum'
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'weight'
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'volume'
  }, {
    title: this.msg('shipStatus'),
    dataIndex: 'status',
    width: 150,
    render: (text, record) => {
      // record.logStatus --> active exception
      const percent = record.status === 1 ? 0 : 100;
      return (
        <div>
          <span>未接单</span>
          <span style={{ float: 'right' }}>在途异常</span>
        </div>
      );
    }
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
    const { shipmentStatusTypes, shipmentlist, loading, intl } = this.props;
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
            <a className="hidden-xs" role="button">{formatContainerMsg(intl, 'advancedSearch')}</a>
          </div>
          <RadioGroup onChange={this.handleShipmentFilter} defaultValue="all">
            <RadioButton value="all">{formatContainerMsg(intl, 'allTypes')}</RadioButton>
            {
              shipmentStatusTypes.map(
                sst =>
                  <RadioButton value={sst} key={sst}>
                  {this.msg(sst)}
                  </RadioButton>
              )
            }
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <NavLink to="/transport/shipment/new">
              <Button type="primary">
                <Icon type="plus-circle-o" /><span>{this.msg('newShipment')}</span>
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
