import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Radio, message, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import AdvancedSearchBar from '../common/advanced-search-bar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadTable, loadAcceptDispatchers, revokeOrReject, delDraft } from
'common/reducers/transport-acceptance';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { SHIPMENT_SOURCE, SHIPMENT_EFFECTIVES, DEFAULT_MODULES } from 'common/constants';
import AccepterModal from '../shipment/modals/accepter';
import RevokejectModal from '../shipment/modals/revoke-reject';
import PreviewPanel from '../shipment/modals/preview-panel';
import { renderConsignLoc } from '../common/consignLocation';
import ShipmtnoColumn from '../common/shipmtnoColumn';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';
import globalMessages from 'client/common/root.i18n';

const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const formatGlobalMsg = format(globalMessages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function TransitTimeLabel(props) {
  const { time, tformat } = props;
  let msg;
  if (time === 0) {
    msg = tformat('transitTimeToday');
  } else if (time) {
    msg = `${time}${tformat('day')}`;
  } else {
    msg = '';
  }
  return <span>{msg}</span>;
}

function fetchData({ state, dispatch, cookie }) {
  if (!state.transportAcceptance.table.loaded) {
    return dispatch(loadTable(cookie, {
      tenantId: state.account.tenantId,
      filters: JSON.stringify(state.transportAcceptance.table.filters),
      pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
      currentPage: state.transportAcceptance.table.shipmentlist.current,
      sortField: state.transportAcceptance.table.sortField,
      sortOrder: state.transportAcceptance.table.sortOrder,
    }));
  }
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
    todos: state.shipment.statistics.todos,
  }),
  { loadTable, loadAcceptDispatchers, revokeOrReject, loadShipmtDetail, delDraft })
@connectNav({
  depth: 2,
  text: DEFAULT_MODULES.transport.text,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'shipment' })
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
    loadTable: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
    advancedSearchVisible: false,
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTable(null, params),
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
        sortField: sorter.field || this.props.sortField,
        sortOrder: this.props.sortOrder,
        filters: JSON.stringify(this.props.filters),
      };
      return params;
    },
    remotes: this.props.shipmentlist,
  })

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('shipNo'),
    dataIndex: 'shipmt_no',
    width: 150,
    fixed: 'left',
    render: (o, record) => {
      let style;
      if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
        style = { color: '#999' };
        return (<span style={style} >{record.shipmt_no}</span>);
      }
      return (
        <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key}
          style={style} shipment={record} onClick={this.handleShipmtPreview}
        />
      );
    },
  }, {
    title: this.msg('shipRequirement'),
    dataIndex: 'sr_name',
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('refCustomerNo'),
    dataIndex: 'ref_external_no',
    render: o => <TrimSpan text={o} />,
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'transport_mode',
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    render: (o, record) => {
      return o ? moment(record.pickup_est_date).format('YYYY.MM.DD') : '';
    },
  }, {
    title: this.msg('shipTransitTime'),
    dataIndex: 'transit_time',
    render: (o, record) => <TransitTimeLabel time={record.transit_time} tformat={this.msg} />,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    render: (o, record) => {
      return o ? moment(record.deliver_est_date).format('YYYY.MM.DD') : '';
    },
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consignorPlace'),
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />,
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consigneePlace'),
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
  }, {
    title: this.msg('shipSource'),
    dataIndex: 'source',
    render: (o, record) => {
      if (record.source === SHIPMENT_SOURCE.consigned) {
        return this.msg('consginSource');
      } else if (record.source === SHIPMENT_SOURCE.subcontracted) {
        return this.msg('subcontractSource');
      } else {
        return <span />;
      }
    },
  }, {
    title: this.msg('shipCreateDate'),
    dataIndex: 'created_date',
    sorter: true,
    render: (text, record) => moment(record.created_date).format('MM-DD HH:mm'),
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    sorter: true,
    render: (text, record) => (record.acpt_time ?
     moment(record.acpt_time).format('MM-DD HH:mm') : ' '),
  }]
  handleTableLoad = (filters, current, sortField, sortOrder) => {
    this.props.loadTable(null, {
      tenantId: this.props.tenantId,
      filters: JSON.stringify(filters || this.props.filters),
      pageSize: this.props.shipmentlist.pageSize,
      currentPage: current || this.props.shipmentlist.current,
      sortField: sortField || this.props.sortField,
      sortOrder: sortOrder || this.props.sortOrder,
    }).then((result) => {
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
  handleAdvancedSearch = (searchVals) => {
    let filters = this.props.filters;
    Object.keys(searchVals).forEach((key) => {
      filters = this.mergeFilters(filters, key, searchVals[key]);
    });
    this.handleTableLoad(filters, 1);
    this.showAdvancedSearch(false);
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
  handleShipmtAccept(dispId, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.loadAcceptDispatchers(
      this.props.tenantId, [dispId]
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
    this.setState({ selectedRowKeys: [dispId] });
  }
  handleShipmtsAccept(dispIds, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.loadAcceptDispatchers(
      this.props.tenantId, dispIds
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleShipmtRevoke(shipmtNo, dispId, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.revokeOrReject('revoke', shipmtNo, dispId);
  }
  // handleShipmtReject(dispId, ev) {
  //   ev.preventDefault();
  //   ev.stopPropagation();
  //   this.props.revokeOrReject('reject', dispId);
  // }
  handleShipmtDraftDel(shipmtNo, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.delDraft(shipmtNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.handleTableLoad(undefined, 1);
      }
    });
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sp', 'detail', row).then((result) => {
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
  toggleAdvancedSearch = () => {
    this.setState({ advancedSearchVisible: !this.state.advancedSearchVisible });
  }
  showAdvancedSearch = (advancedSearchVisible) => {
    this.setState({ advancedSearchVisible });
  }
  render() {
    const { shipmentlist, loading, intl } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    let radioValue;
    const types = this.props.filters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    let columns = this.columns;
    let btns = '';
    if (radioValue === 'unaccepted') {
      columns = [...columns, {
        title: formatContainerMsg(intl, 'opColumn'),
        fixed: 'right',
        width: 150,
        render: (o, record) => {
          if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
            return (<span />);
          } else if (record.source === SHIPMENT_SOURCE.consigned) {
            return (
              <PrivilegeCover module="transport" feature="shipment" action="edit">
                <span>
                  <a role="button" onClick={ev => this.handleShipmtAccept(record.key, ev)}>
                    {this.msg('shipmtAccept')}
                  </a>
                  <span className="ant-divider" />
                  <NavLink to={`/transport/shipment/edit/${record.shipmt_no}`}>
                    {formatGlobalMsg(intl, 'modify')}
                  </NavLink>
                  <span className="ant-divider" />
                  <a role="button" onClick={ev => this.handleShipmtRevoke(record.shipmt_no, record.key, ev)}>
                    {this.msg('shipmtRevoke')}
                  </a>
                </span>
              </PrivilegeCover>
            );
          } else if (record.source === SHIPMENT_SOURCE.subcontracted) {
            return (
              <span>
                <PrivilegeCover module="transport" feature="shipment" action="edit">
                  <a role="button" onClick={ev => this.handleShipmtAccept(record.key, ev)}>
                    {this.msg('shipmtAccept')}
                  </a>
                </PrivilegeCover>
              </span>
            );
          }
        },
      }];
      btns = (
        <div style={{ display: 'inline-block' }}>
          <PrivilegeCover module="transport" feature="shipment" action="edit">
            <Button onClick={ev => this.handleShipmtsAccept(this.state.selectedRowKeys, ev)}>
            批量接单
            </Button>
          </PrivilegeCover>
        </div>
      );
    } else if (radioValue === 'draft') {
      columns = [...columns, {
        title: formatContainerMsg(intl, 'opColumn'),
        width: 110,
        fixed: 'right',
        render: (o, record) => {
          return (
            <span>
              <PrivilegeCover module="transport" feature="shipment" action="edit">
                <NavLink to={`/transport/shipment/draft/${record.shipmt_no}`}>
                  {formatGlobalMsg(intl, 'modify')}
                </NavLink>
              </PrivilegeCover>
              <span className="ant-divider" />
              <PrivilegeCover module="transport" feature="shipment" action="delete">
                <Popconfirm placement="topRight" title="确定要删除吗？"
                  onConfirm={ev => this.handleShipmtDraftDel(record.shipmt_no, ev)}
                >
                  <a role="button">
                    {formatGlobalMsg(intl, 'delete')}
                  </a>
                </Popconfirm>
              </PrivilegeCover>
            </span>
          );
        },
      }];
    }
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>{this.msg('transportShipment')}</span>
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="unaccepted">{this.msg('unacceptedShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue}>
            <RadioButton value="draft">{this.msg('draftShipmt')}</RadioButton>
            <RadioButton value="archived">{this.msg('archivedShipmt')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="top-bar-tools">
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
          <span />
          <a onClick={this.toggleAdvancedSearch}>高级搜索</a>
        </div>
        <div className="main-content" key="main">
          <AdvancedSearchBar visible={this.state.advancedSearchVisible} onSearch={this.handleAdvancedSearch}
            toggle={this.toggleAdvancedSearch}
          />
          <div className="page-body">
            <div className="panel-header">
              <PrivilegeCover module="transport" feature="shipment" action="create">
                <NavLink to="/transport/shipment/new">
                  <Button type="primary" icon="plus-circle-o">
                    {this.msg('shipmtCreate')}
                  </Button>
                </NavLink>
              </PrivilegeCover>
              <span className={`mass-action-btn ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                {btns}
              </span>
            </div>
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} columns={columns} loading={loading}
                dataSource={this.dataSource} scroll={{ x: 2280 }}
              />
            </div>
          </div>
        </div>
        <AccepterModal reload={this.handleTableLoad} clearSelection={this.handleSelectionClear} />
        <RevokejectModal reload={this.handleTableLoad} />
        <PreviewPanel stage="acceptance" />
      </QueueAnim>
    );
  }
}
