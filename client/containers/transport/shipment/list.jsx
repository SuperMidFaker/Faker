import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import SearchBar from 'reusable/components/search-bar';
import connectFetch from 'reusable/decorators/connect-fetch';
import connectNav from 'reusable/decorators/connect-nav';
import { loadTable } from 'universal/redux/reducers/shipment';
import { setNavTitle } from 'universal/redux/reducers/navbar';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import containerMessages from 'client/containers/message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadTable(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.partner.shipmentlist.pageSize,
    currentPage: state.partner.shipmentlist.current
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
    filters: state.shipment.filters,
    loading: state.shipment.loading
  }),
  { loadTable })
export default class ShipmentList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.object.isRequired,
    loadTable: PropTypes.func.isRequired,
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
    title: this.msg('partnerName'),
    dataIndex: 'name'
  }, {
    title: this.msg('partnerType'),
    dataIndex: 'types',
    render: (o, record) =>
    record.types.map(t => formatGlobalMsg(this.props.intl, t.code)).join('/') ||
      formatGlobalMsg(this.props.intl, PARTNERSHIP_TYPE_INFO.customer) // fallback to '客户'
  }, {
    title: this.msg('tenantType'),
    dataIndex: 'tenantType',
    render: (o, record) => formatContainerMsg(this.props.intl, record.tenantType)
  }, {
    title: this.msg('volume'),
    dataIndex: 'volume'
  }, {
    title: this.msg('revenue'),
    dataIndex: 'revenue',
    render: (o, record) => (record.revenue || 0.0).toFixed(2)
  }, {
    title: this.msg('cost'),
    dataIndex: 'cost',
    render: (o, record) => record.cost ? record.cost.toFixed(2) : '0.00'
  }, {
    title: formatContainerMsg(this.props.intl, 'opColumn'),
    width: 150,
    render: (text, record) => {
      if (record.partnerTenantId === -1) {
        return (
          <span>
            <a role="button" onClick={() => this.handleSendInvitation(record)}>
            {this.msg('sendInvitation')}
            </a>
          </span>
        );
      } else {
        return <span />;
      }
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
  handleAddPartner = () => {
    this.props.showPartnerModal();
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
            <a className="hidden-xs" role="button">{formatContainerMsg(intl, 'advancedSearch')}</a>
          </div>
          <RadioGroup onChange={this.handleShipmentFilter} defaultValue="all">
            <RadioButton value="all">{formatContainerMsg(intl, 'allTypes')}</RadioButton>
            {
              partnershipTypes.map(
                pst =>
                  <RadioButton value={pst.key} key={pst.key}>
                  {formatGlobalMsg(intl, pst.code)}({pst.count})
                  </RadioButton>
              )
            }
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-header">
            <Button type="primary" onClick={this.handleAddPartner}>
              <Icon type="plus-circle-o" /><span>{this.msg('newPartner')}</span>
            </Button>
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
