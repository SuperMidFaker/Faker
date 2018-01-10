import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Icon, Layout, message, Tooltip, Tag } from 'antd';
import QueueAnim from 'rc-queue-anim';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import TrimSpan from 'client/components/trimSpan';
import SearchBar from 'client/components/SearchBar';
import RowAction from 'client/components/RowAction';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { Logixon } from 'client/components/FontIcon';
import { loadTable, revokeOrReject, delDraft, acceptDispShipment, returnShipment } from
  'common/reducers/transport-acceptance';
import { loadShipmtDetail } from 'common/reducers/shipment';
import { SHIPMENT_SOURCE, SHIPMENT_EFFECTIVES, DEFAULT_MODULES, SHIPMENT_TRACK_STATUS, TRANS_MODE_INDICATOR } from 'common/constants';
import ShipmentAdvanceModal from 'client/apps/transport/tracking/land/modals/shipment-advance-modal';
import CreateSpecialCharge from 'client/apps/transport/tracking/land/modals/create-specialCharge';
import { format } from 'client/common/i18n/helpers';
import RevokeModal from '../common/modal/revokeModal';
import ShipmentDockPanel from '../shipment/dock/shipmentDockPanel';
import ShipmtnoColumn from '../common/shipmtnoColumn';
import AddressColumn from '../common/addressColumn';
import messages from './message.i18n';
import OrderDockPanel from '../../scof/orders/docks/orderDockPanel';
import DelegationDockPanel from '../../cms/common/dock/delegationDockPanel';
import DispatchDock from '../dispatch/dispatchDock';
import SegmentDock from '../dispatch/segmentDock';
import CustomerSelect from '../common/customerSelect';
import CreatorSelect from '../common/creatorSelect';

const formatMsg = format(messages);
const { Header, Content } = Layout;

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

function isCompleteShipment(shipmt) {
  return shipmt.consigner_name && shipmt.consignee_province &&
      shipmt.deliver_est_date && shipmt.pickup_est_date;
}

function mergeFilters(curFilters, name, value) {
  const merged = curFilters.filter(flt => flt.name !== name);
  if (value !== null && value !== undefined && value !== '') {
    merged.push({
      name,
      value,
    });
  }
  return merged;
}
// 暂时由 CreatorSelect 触发获取list
// function fetchData({ state, dispatch, cookie }) {
//   if (!state.transportAcceptance.table.loaded) {
//     return dispatch(loadTable(cookie, {
//       tenantId: state.account.tenantId,
//       filters: JSON.stringify(state.transportAcceptance.table.filters),
//       pageSize: state.transportAcceptance.table.shipmentlist.pageSize,
//       currentPage: state.transportAcceptance.table.shipmentlist.current,
//       sortField: state.transportAcceptance.table.sortField,
//       sortOrder: state.transportAcceptance.table.sortOrder,
//     }));
//   }
// }

// @connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    acpterId: state.account.loginId,
    acpterName: state.account.username,
    shipmentlist: state.transportAcceptance.table.shipmentlist,
    filters: state.transportAcceptance.table.filters,
    loading: state.transportAcceptance.table.loading,
    loaded: state.transportAcceptance.table.loaded,
    sortField: state.transportAcceptance.table.sortField,
    sortOrder: state.transportAcceptance.table.sortOrder,
    todos: state.shipment.statistics.todos,
  }),
  {
    loadTable, revokeOrReject, loadShipmtDetail, delDraft, acceptDispShipment, returnShipment,
  }
)
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
    loginId: PropTypes.number.isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })).isRequired,
    sortField: PropTypes.string.isRequired,
    sortOrder: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    shipmentlist: PropTypes.shape({ currentPage: PropTypes.number }).isRequired,
    delDraft: PropTypes.func.isRequired,
    revokeOrReject: PropTypes.func.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadTable: PropTypes.func.isRequired,
    returnShipment: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchValue: '',
    selectedPartnerIds: [],
  }
  componentWillMount() {
    const { filters } = this.props;
    const filter = filters.find(item => item.name === 'name');
    this.setState({ searchValue: filter ? filter.value : '' });
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded && !nextProps.loading) {
      this.handleTableLoad();
    }
  }
  dataSource = new DataTable.DataSource({
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
    width: 160,
    fixed: 'left',
    render: (o, record) => {
      let style;
      if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
        style = { color: '#999' };
        return (<span style={style} >{record.shipmt_no}</span>);
      }
      return (
        <ShipmtnoColumn
          shipmtNo={record.shipmt_no}
          style={style}
          shipment={record}
          onClick={this.handleShipmtPreview}
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
    dataIndex: 'transport_mode_code',
    width: 100,
    render: (o, record) => {
      const mode = TRANS_MODE_INDICATOR.filter(ts => ts.value === o)[0];
      return mode ? <span><Logixon type={mode.icon} /> {mode.text}</span>
        : <span>{record.transport_mode}</span>;
    },
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 100,
    render: (o, record) => (o ? moment(record.pickup_est_date).format('YYYY.MM.DD') : ''),
  }, {
    title: this.msg('shipTransitTime'),
    dataIndex: 'transit_time',
    width: 80,
    render: (o, record) => <TransitTimeLabel time={record.transit_time} tformat={this.msg} />,
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 100,
    render: (o, record) => (o ? moment(record.deliver_est_date).format('YYYY.MM.DD') : ''),
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={8} />,
  }, {
    title: this.msg('consignorPlace'),
    width: 250,
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
    width: 250,
    render: (o, record) => <AddressColumn shipment={record} consignType="consignee" />,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 150,
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 60,
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
      }
      return <span />;
    },
  }, {
    dataIndex: 'effective',
    width: 80,
    render: (o) => {
      switch (o) {
        case 0:
          return <Tag>未生效</Tag>;
        case 1:
          return <Tag color="green">已释放</Tag>;
        case -1:
          return <Tag color="red">已取消</Tag>;
        default:
          return '';
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
  }, {
    title: this.msg('opColumn'),
    fixed: 'right',
    width: 160,
    dataIndex: 'OPS_COL',
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        if (record.effective === SHIPMENT_EFFECTIVES.cancelled) {
          return (<span />);
        } else if (record.source === SHIPMENT_SOURCE.consigned) {
          return (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <span>
                <RowAction onClick={this.handleShipmtAccept} icon="play-circle-o" label={this.msg('shipmtRelease')} row={record} />
                <RowAction onClick={this.handleShipmtEdit} icon="edit" tooltip={this.msg('shipmtModify')} row={record} />
                <RowAction danger confirm={this.msg('deleteConfirm')} onConfirm={ev => this.handleShipmtRevoke(record.shipmt_no, record.key, ev)} icon="delete" />
              </span>
            </PrivilegeCover>
          );
        } else if (record.source === SHIPMENT_SOURCE.subcontracted) {
          return (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <RowAction onClick={this.handleShipmtAccept} icon="check-circle-o" label={this.msg('shipmtAccept')} row={record} />
            </PrivilegeCover>
          );
        }
        return null;
      } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
        return (
          <PrivilegeCover module="transport" feature="shipment" action="edit">
            <RowAction confirm="退回至未接单状态" onConfirm={() => this.handleReturn(record.disp_id)} icon="close-circle-o" label="退回" />
          </PrivilegeCover>
        );
      }
      return null;
    },
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
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleSearch = (searchVal) => {
    const filters = mergeFilters(this.props.filters, 'name', searchVal);
    this.handleTableLoad(filters, 1);
    this.setState({ searchValue: searchVal });
  }
  handleCustomerChange = (srPartnerId, srTenantId) => {
    let value;
    if (srPartnerId !== -1) {
      value = srPartnerId;
    }
    let filters = mergeFilters(this.props.filters, 'sr_partner_id', value);
    filters = mergeFilters(filters, 'sr_tenant_id', srTenantId);
    this.handleTableLoad(filters, 1);
  }
  handleCreatorChange = (fieldsValue) => {
    let filters = mergeFilters(this.props.filters, 'creator', fieldsValue.creator);
    filters = mergeFilters(filters, 'loginId', this.props.loginId);
    this.handleTableLoad(filters, 1);
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/transport/shipment/create');
  }
  handleShipmtAccept = (row) => {
    if (!isCompleteShipment(row)) {
      message.error('运单信息未完整, 请完善');
      return;
    }

    this.props.acceptDispShipment(
      [row.key], this.props.acpterId, this.props.acpterName,
      this.props.acpterId, this.props.acpterName
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
        this.handleSelectionClear();
      }
    });
  }
  handleShipmtEdit = (row) => {
    const link = `/transport/shipment/edit/${row.shipmt_no}`;
    this.context.router.push(link);
  }
  handleShipmtsAccept = () => {
    const partnerIds = this.state.selectedPartnerIds;
    for (let i = 0; i < partnerIds.length; i++) {
      for (let j = 0; j < partnerIds.length; j++) {
        if (partnerIds[i] !== partnerIds[j]) {
          message.info('批量接单需选择同一客户');
          return;
        }
      }
    }
    const dispIds = this.state.selectedRowKeys;
    let valid = true;
    for (let i = 0; i < dispIds.length; i++) {
      const shipmt = this.props.shipmentlist.data.filter(shl => shl.key === dispIds[i])[0];
      if (!isCompleteShipment(shipmt)) {
        message.error('运单信息未完整, 请完善');
        valid = false;
        break;
      }
    }
    if (!valid) {
      return;
    }
    this.props.acceptDispShipment(
      dispIds, this.props.acpterId, this.props.acpterName,
      this.props.acpterId, this.props.acpterName
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
        this.handleSelectionClear();
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
  handleReturn = (dispId) => {
    const { tenantId, loginId, loginName } = this.props;
    const shipmtDispIds = [dispId];
    this.props.returnShipment({
      shipmtDispIds, tenantId, loginId, loginName,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleTableLoad();
      }
    });
  }
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
    this.props.loadShipmtDetail(row.shipmt_no, this.props.tenantId, 'sp', 'order').then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { shipmentlist, loading } = this.props;
    this.dataSource.remotes = shipmentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        const partnerIds = [];
        for (let i = 0; i < selectedRowKeys.length; i++) {
          const { partnerId } = shipmentlist.data.find(item =>
            item.key === selectedRowKeys[i]);
          partnerIds.push(partnerId);
        }
        this.setState({
          selectedRowKeys,
          selectedPartnerIds: partnerIds,
        });
      },
    };
    const bulkActions = (
      <PrivilegeCover module="transport" feature="shipment" action="edit">
        <Button type="default" onClick={this.handleShipmtsAccept}>
          批量接单
        </Button>
      </PrivilegeCover>
    );
    const toolbarActions = (<span>
      <SearchBar placeholder={this.msg('searchPlaceholder')} onInputSearch={this.handleSearch} value={this.state.searchValue} />
      <span />
      <CustomerSelect onChange={this.handleCustomerChange} />
      <span />
      <CreatorSelect onChange={this.handleCreatorChange} onInitialize={this.handleCreatorChange} />
    </span>);

    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('transportShipment')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="primary" icon="plus" onClick={this.handleCreateBtnClick} disabled>
              {this.msg('shipmtCreate')}
            </Button>
            <span><Tooltip title="此功能已由客户订单流中的创建订单替代" placement="left"><Icon type="question-circle-o" /></Tooltip></span>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <DataTable
            toolbarActions={toolbarActions}
            bulkActions={bulkActions}
            rowSelection={rowSelection}
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
            columns={this.columns}
            loading={loading}
            dataSource={this.dataSource}
          />
        </Content>
        <RevokeModal reload={this.handleTableLoad} />
        <ShipmentDockPanel reload={this.handleTableLoad} />
        <OrderDockPanel />
        <DelegationDockPanel />
        <ShipmentAdvanceModal />
        <CreateSpecialCharge />
        <DispatchDock />
        <SegmentDock />
      </QueueAnim>
    );
  }
}
