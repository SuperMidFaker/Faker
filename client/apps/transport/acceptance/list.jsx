import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio, message, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import NavLink from 'client/components/nav-link';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/search-bar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { loadTable, loadAcceptDispatchers, revokeOrReject, delDraft } from
'common/reducers/transport-acceptance';
import { setNavTitle } from 'common/reducers/navbar';
import { SHIPMENT_SOURCE, SHIPMENT_EFFECTIVES } from 'common/constants';
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
  } else {
    msg = `${time}${tformat('day')}`;
  }
  return <span>{msg}</span>;
}

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
    goBackFn: null,
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
    loadTable: PropTypes.func.isRequired,
  }
  state = {
    selectedRowKeys: [],
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
        filters: this.props.filters,
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
    remotes: this.props.shipmentlist,
  })

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('shipNo'),
    dataIndex: 'shipmt_no',
    width: 150,
    fixed: 'left',
    render: (o, record) => {
      let style;
      if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
        style = { color: '#999' };
      }
      return (
        <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key}
          style={style}
        />
      );
    },
  }, {
    title: this.msg('shipRequirement'),
    dataIndex: 'sr_name',
    width: 240,
    render: (o) => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('refCustomerNo'),
    dataIndex: 'ref_external_no',
    width: 190,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'transport_mode',
    width: 80,
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 90,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('shipTransitTime'),
    dataIndex: 'transit_time',
    width: 80,
    render: (o, record) => <TransitTimeLabel time={record.transit_time} tformat={this.msg} />,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 90,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 200,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('consignorPlace'),
    width: 200,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} />,
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    width: 220,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 200,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('consigneePlace'),
    width: 200,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} />,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 220,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 80,
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 80,
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 80,
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
    width: 100,
    sorter: true,
    render: (text, record) => moment(record.created_date).format('MM-DD HH:mm'),
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    width: 110,
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
  handleShipmtPreview = (row) => {
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sp').then(result => {
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
    const { shipmentlist, loading, intl } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({ selectedRowKeys });
      },
    };
    let radioValue;
    const types = this.props.filters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    let columns = this.columns;
    if (radioValue === 'unaccepted') {
      columns = [...columns, {
        title: formatContainerMsg(intl, 'opColumn'),
        fixed: 'right',
        width: 150,
        render: (o, record) => {
          if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
            return (<span className="na-operation">NA</span>);
          } else if (record.source === SHIPMENT_SOURCE.consigned) {
            return (
              <span>
              <a role="button" onClick={() => this.handleShipmtAccept(record.key)}>
              {this.msg('shipmtAccept')}
              </a>
              <span className="ant-divider" />
              <NavLink to={`/transport/acceptance/shipment/edit/${record.shipmt_no}`}>
                {formatGlobalMsg(intl, 'modify')}
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
        },
      }];
    } else if (radioValue === 'draft') {
      columns = [...columns, {
        title: formatContainerMsg(intl, 'opColumn'),
        width: 110,
        fixed: 'right',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/transport/acceptance/shipment/draft/${record.shipmt_no}`}>
              {formatGlobalMsg(intl, 'modify')}
              </NavLink>
              <span className="ant-divider" />
              <Popconfirm placement="topRight" title="确定要删除吗？" onConfirm={() => this.handleShipmtDraftDel(record.shipmt_no)}>
                <a role="button">
                {formatGlobalMsg(intl, 'delete')}
                </a>
              </Popconfirm>
            </span>
          );
        },
      }];
    }
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <NavLink to="/transport/acceptance/shipment/new">
              <Button type="primary" size="large" icon="plus-circle-o">
                {this.msg('shipmtCreate')}
              </Button>
            </NavLink>
          </div>
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue} size="large">
            <RadioButton value="unaccepted">{this.msg('unacceptedShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
          </RadioGroup>
          <span style={{ marginLeft: '8px' }} />
          <RadioGroup onChange={this.handleShipmentFilter} value={radioValue} size="large">
            <RadioButton value="draft">{this.msg('draftShipmt')}</RadioButton>
            <RadioButton value="archived">{this.msg('archivedShipmt')}</RadioButton>
          </RadioGroup>
          <span style={{ marginLeft: '8px' }} />
          <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} />
        </div>
        <div className="page-body">
          <div className="panel-body">
            <Table rowSelection={rowSelection} columns={columns} loading={loading}
              dataSource={this.dataSource} scroll={{ x: 2800, y: 460 }}
              onRowClick={this.handleShipmtPreview}
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button shape="circle-outline" icon="cross" onClick={this.handleSelectionClear} className="pull-right" />
          </div>
        </div>
        <AccepterModal reload={this.handleTableLoad} />
        <RevokejectModal reload={this.handleTableLoad} />
        <PreviewPanel />
      </div>
    );
  }
}
