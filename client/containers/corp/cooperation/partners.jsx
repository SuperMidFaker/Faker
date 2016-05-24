import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, Icon, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { loadPartners, showPartnerModal, showInviteModal } from
'common/reducers/partner';
import PartnerModal from 'client/components/partner-setup-modal';
import InviteModal from 'client/components/partner-invite-modal';
import SearchBar from 'client/components/search-bar';
import connectFetch from 'client/common/connect-fetch';
import connectNav from 'client/common/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { PARTNERSHIP_TYPE_INFO } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/containers/message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadPartners(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.partner.partnerlist.pageSize,
    currentPage: state.partner.partnerlist.current
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
    text: formatContainerMsg(props.intl, 'partners'),
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    partnershipTypes: state.partner.partnershipTypes,
    partnerlist: state.partner.partnerlist,
    filters: state.partner.filters,
    loading: state.partner.loading
  }),
  { showPartnerModal, showInviteModal, loadPartners })
export default class PartnersView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    filters: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    partnershipTypes: PropTypes.array.isRequired,
    partnerlist: PropTypes.object.isRequired,
    loadPartners: PropTypes.func.isRequired,
    showInviteModal: PropTypes.func.isRequired,
    showPartnerModal: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }
  handleSendInvitation(partner) {
    this.props.showInviteModal(partner);
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
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadPartners(null, params),
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
    remotes: this.props.partnerlist
  })

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('partnerName'),
    dataIndex: 'name',
    width: 250
  }, {
    title: this.msg('partnerCode'),
    dataIndex: 'partnerCode',
    width: 150
  }, {
    title: this.msg('partnerType'),
    dataIndex: 'types',
    width: 100,
    render: (o, record) =>
    record.types.map(t => formatGlobalMsg(this.props.intl, t.code)).join('/') ||
      formatGlobalMsg(this.props.intl, PARTNERSHIP_TYPE_INFO.customer) // fallback to '客户'
  }, {
    title: this.msg('tenantType'),
    dataIndex: 'tenantType',
    width: 100,
    render: (o, record) => formatContainerMsg(this.props.intl, record.tenantType)
  }, {
    title: this.msg('volume'),
    dataIndex: 'volume',
    width: 150
  }, {
    title: this.msg('revenue'),
    dataIndex: 'revenue',
    width: 150,
    render: (o, record) => (record.revenue || 0.0).toFixed(2)
  }, {
    title: this.msg('cost'),
    dataIndex: 'cost',
    width: 150,
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
    this.props.loadPartners(null, {
      tenantId: this.props.tenantId,
      pageSize: this.props.partnerlist.pageSize,
      currentPage: 1,
      filters
    });
  }
  handleAddPartner = () => {
    this.props.showPartnerModal();
  }
  handlePartnershipFilter = (ev) => {
    const { partnerlist, tenantId, filters } = this.props;
    const partnerType = ev.target.value;
    const typeValue = partnerType !== 'all' ? parseInt(partnerType, 10) : undefined;
    const filterArray = this.mergeFilters(filters, 'partnerType', typeValue);
    this.props.loadPartners(null, {
      tenantId,
      filters: JSON.stringify(filterArray),
      pageSize: partnerlist.pageSize,
      currentPage: 1
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const { partnershipTypes, partnerlist, filters, loading, intl } = this.props;
    this.dataSource.remotes = partnerlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      }
    };
    const pts = filters.filter(flt => flt.name === 'partnerType');
    let radioVal = 'all';
    if (pts.length > 0 && pts[0].value !== undefined) {
      radioVal = `${pts[0].value}`;
    }
    return (
      <div className="main-content">
        <div className="page-header fixed">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
            <a className="hidden-xs" role="button">{formatContainerMsg(intl, 'advancedSearch')}</a>
          </div>
          <RadioGroup onChange={this.handlePartnershipFilter} value={radioVal}>
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
        <div className="page-body fixed">
          <div className="panel-header">
            <Button type="primary" onClick={this.handleAddPartner}>
              <Icon type="plus-circle-o" /><span>{this.msg('newPartner')}</span>
            </Button>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={loading}
              dataSource={this.dataSource} useFixedHeader
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(intl, 'clearSelection')}
            </Button>
          </div>
          <PartnerModal />
          <InviteModal />
        </div>
      </div>
    );
  }
}
