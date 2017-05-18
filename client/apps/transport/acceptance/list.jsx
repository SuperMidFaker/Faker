import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Dropdown, Menu, Icon, Radio, Layout, message, Popconfirm } from 'antd';
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
import AccepterModal from '../shipment/dock/accepter';
import RevokejectModal from '../shipment/dock/revoke-reject';
import ShipmentDockPanel from '../shipment/dock/shipmentDockPanel';
import ShipmtnoColumn from '../common/shipmtnoColumn';
import AddressColumn from '../common/addressColumn';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import containerMessages from 'client/apps/message.i18n';
import globalMessages from 'client/common/root.i18n';
import OrderDockPanel from '../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../cms/common/dockhub/delegationDockPanel';
import ShipmentAdvanceModal from 'client/apps/transport/tracking/land/modals/shipment-advance-modal';
import CreateSpecialCharge from 'client/apps/transport/tracking/land/modals/create-specialCharge';

const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);
const formatGlobalMsg = format(globalMessages);
const { Header, Content } = Layout;

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
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    advancedSearchVisible: false,
    searchValue: '',
  }
  componentWillMount() {
    const { filters } = this.props;
    const filter = filters.find(item => item.name === 'name');
    this.setState({ searchValue: filter ? filter.value : '' });
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
      showTotal: total => `共 ${total} 条`,
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
        <ShipmtnoColumn shipmtNo={record.shipmt_no}
          style={style} shipment={record} onClick={this.handleShipmtPreview}
        />
      );
    },
  }, {
    title: this.msg('shipRequirement'),
    dataIndex: 'sr_name',
    width: 190,
    render: o => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('refCustomerNo'),
    dataIndex: 'ref_external_no',
    width: 110,
    render: o => <TrimSpan text={o} />,
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'transport_mode',
    width: 80,
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 100,
    render: (o, record) => o ? moment(record.pickup_est_date).format('YYYY.MM.DD') : '',
  }, {
    title: this.msg('shipTransitTime'),
    dataIndex: 'transit_time',
    width: 70,
    render: (o, record) => <TransitTimeLabel time={record.transit_time} tformat={this.msg} />,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 100,
    render: (o, record) => o ? moment(record.deliver_est_date).format('YYYY.MM.DD') : '',
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consignorPlace'),
    width: 120,
    render: (o, record) => <AddressColumn shipment={record} consignType="consigner" />,
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consigneePlace'),
    width: 120,
    render: (o, record) => <AddressColumn shipment={record} consignType="consignee" />,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 40,
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 60,
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 60,
  }, {
    title: this.msg('shipSource'),
    dataIndex: 'source',
    width: 50,
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
    width: 120,
    render: (text, record) => moment(record.created_date).format('MM-DD HH:mm'),
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    sorter: true,
    width: 120,
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
    this.setState({ searchValue: searchVal });
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
  handleCreateBtnClick = () => {
    this.context.router.push('/transport/shipment/create');
  }
  isCompleteShipment(shipmt) {
    return shipmt.consigner_name && shipmt.consignee_province &&
      shipmt.deliver_est_date && shipmt.pickup_est_date;
  }
  handleShipmtAccept(row, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.isCompleteShipment(row)) {
      message.error('运单信息未完整, 请完善');
      return;
    }
    this.props.loadAcceptDispatchers(
      this.props.tenantId, [row.key]
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
    this.setState({ selectedRowKeys: [row.key] });
  }
  handleShipmtsAccept(dispIds, ev) {
    ev.preventDefault();
    ev.stopPropagation();
    let valid = true;
    for (let i = 0; i < dispIds.length; i++) {
      const shipmt = this.props.shipmentlist.data.filter(shl => shl.key === dispIds[i])[0];
      if (!this.isCompleteShipment(shipmt)) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      return;
    }
    this.props.loadAcceptDispatchers(
      this.props.tenantId, dispIds
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
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
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad(undefined, 1);
      }
    });
  }
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sp', 'detail').then((result) => {
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
    let bulkBtns = '';
    if (radioValue === 'unaccepted') {
      columns = [...columns, {
        title: formatContainerMsg(intl, 'opColumn'),
        fixed: 'right',
        width: 80,
        render: (o, record) => {
          if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
            return (<span />);
          } else if (record.source === SHIPMENT_SOURCE.consigned) {
            return (
              <PrivilegeCover module="transport" feature="shipment" action="edit">
                <span>
                  <a role="button" onClick={ev => this.handleShipmtAccept(record, ev)}>
                    {this.msg('shipmtAccept')}
                  </a>
                  <span className="ant-divider" />
                  <Dropdown overlay={(
                    <Menu onClick={this.handleMenuClick}>
                      <Menu.Item key="edit">
                        <NavLink to={`/transport/shipment/edit/${record.shipmt_no}`}>
                          {formatGlobalMsg(intl, 'modify')}
                        </NavLink>
                      </Menu.Item>
                      <Menu.Item key="delete">
                        <Popconfirm title={this.msg('deleteConfirm')} onConfirm={ev => this.handleShipmtRevoke(record.shipmt_no, record.key, ev)}>
                          <a role="button">
                            {this.msg('shipmtRevoke')}
                          </a>
                        </Popconfirm>
                      </Menu.Item>
                    </Menu>)}
                  >
                    <a><Icon type="down" /></a>
                  </Dropdown>
                </span>
              </PrivilegeCover>
            );
          } else if (record.source === SHIPMENT_SOURCE.subcontracted) {
            return (
              <span>
                <PrivilegeCover module="transport" feature="shipment" action="edit">
                  <a role="button" onClick={ev => this.handleShipmtAccept(record, ev)}>
                    {this.msg('shipmtAccept')}
                  </a>
                </PrivilegeCover>
              </span>
            );
          }
        },
      }];
      bulkBtns = (
        <PrivilegeCover module="transport" feature="shipment" action="edit">
          <Button type="default" onClick={ev => this.handleShipmtsAccept(this.state.selectedRowKeys, ev)}>
          批量接单
          </Button>
        </PrivilegeCover>
      );
    } else if (radioValue === 'draft') {
      columns = [...columns, {
        title: formatContainerMsg(intl, 'opColumn'),
        width: 110,
        fixed: 'right',
        render: (o, record) => (
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
          ),
      }];
    }
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('transportShipment')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue} size="large">
            <RadioButton value="draft">{this.msg('draftShipmt')}</RadioButton>
            <RadioButton value="unaccepted">{this.msg('unacceptedShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            <PrivilegeCover module="transport" feature="shipment" action="create">
              <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick}>
                {this.msg('shipmtCreate')}
              </Button>
            </PrivilegeCover>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar placeholder={this.msg('searchPlaceholder')} size="large" onInputSearch={this.handleSearch} value={this.state.searchValue} />
              <span />
              <a onClick={this.toggleAdvancedSearch}>过滤选项</a>
              <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
                <h3>已选中{this.state.selectedRowKeys.length}项</h3> {bulkBtns}
              </div>
            </div>
            <AdvancedSearchBar visible={this.state.advancedSearchVisible} onSearch={this.handleAdvancedSearch}
              toggle={this.toggleAdvancedSearch}
            />
            <div className="panel-body table-panel">
              <Table rowSelection={rowSelection} columns={columns} loading={loading}
                dataSource={this.dataSource} scroll={{ x: 2300 }}
              />
            </div>
          </div>
        </Content>
        <AccepterModal reload={this.handleTableLoad} clearSelection={this.handleSelectionClear} />
        <RevokejectModal reload={this.handleTableLoad} />
        <ShipmentDockPanel />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentAdvanceModal />
        <CreateSpecialCharge />
      </QueueAnim>
    );
  }
}
