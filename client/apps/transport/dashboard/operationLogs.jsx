import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Tag, Layout, Radio, Button } from 'antd';
import DataTable from 'client/components/DataTable';
import { loadShipmentEvents, loadShipmtDetail } from 'common/reducers/shipment';
import TrimSpan from 'client/components/trimSpan';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import { createFilename } from 'client/util/dataTransform';
import ShipmentAdvanceModal from 'client/apps/transport/tracking/land/modals/shipment-advance-modal';
import CreateSpecialCharge from 'client/apps/transport/tracking/land/modals/create-specialCharge';
import { ShipmentDock, DelegationDock, FreightDock } from 'client/components/Dock';
import AddressColumn from '../common/addressColumn';
import messages from './message.i18n';
import '../index.less';
import ActualDate from '../common/actualDate';
import ExceptionsPopover from '../common/popover/exceptionsPopover';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({
  state, dispatch, cookie, location,
}) {
  const {
    startDate, endDate, type, srPartnerId, srTenantId,
  } = location.query;
  const { pageSize, filters } = state.shipment.statistics.logs;
  return dispatch(loadShipmentEvents(cookie, {
    tenantId: state.account.tenantId,
    startDate,
    endDate,
    type,
    pageSize,
    currentPage: 1,
    filters: { ...filters, srPartnerId: Number(srPartnerId), srTenantId: Number(srTenantId) },
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.shipment.statistics,
    filters: state.shipment.statistics.logs.filters,
  }),
  { loadShipmentEvents, loadShipmtDetail }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'transportDashboard'),
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'dashboard' })
export default class Dashboard extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadShipmentEvents: PropTypes.func.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleStatusTypeChange = (e) => {
    const { startDate, endDate, type } = this.props.location.query;
    const { filters, statistics, tenantId } = this.props;
    this.props.loadShipmentEvents(null, {
      tenantId,
      startDate,
      endDate,
      type,
      pageSize: statistics.logs.pageSize,
      currentPage: 1,
      filters: { ...filters, statusType: e.target.value },
    });
  }
  handleExportExcel = () => {
    const { startDate, endDate, type } = this.props.location.query;
    const { tenantId } = this.props;
    const filters = JSON.stringify(this.props.filters);
    window.open(`${API_ROOTS.default}v1/transport/dashboard/exportOperationExcel/${createFilename('operation')}.xlsx?tenantId=${tenantId}&startDate=${startDate}&endDate=${endDate}&type=${type}&currentPage=1&pageSize=999999&filters=${filters}`);
  }
  render() {
    const { startDate, endDate, type } = this.props.location.query;

    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
      render: (o, record) => (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'order')}>{record.shipmt_no}</a>),
    }, {
      title: this.msg('departurePlace'),
      width: 250,
      render: (o, record) => <AddressColumn shipment={record} consignType="consigner" />,
    }, {
      title: this.msg('shipmtEstPickupDate'),
      dataIndex: 'pickup_est_date',
      width: 100,
      render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtActPickupDate'),
      dataIndex: 'pickup_act_date',
      width: 100,
      render: (o, record) => o &&
      <ActualDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />,
    }, {
      title: this.msg('arrivalPlace'),
      width: 250,
      render: (o, record) => <AddressColumn shipment={record} consignType="consignee" />,
    }, {
      title: this.msg('shipmtEstDeliveryDate'),
      dataIndex: 'deliver_est_date',
      width: 100,
      render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtPrmDeliveryDate'),
      dataIndex: 'deliver_prm_date',
      width: 100,
      render: o => o && moment(o).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtActDeliveryDate'),
      dataIndex: 'deliver_act_date',
      width: 100,
      render: (o, record) => o &&
      <ActualDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />,
    }, {
      title: this.msg('overtime'),
      key: 'late',
      width: 100,
      render(o, record) {
        if (record.pickup_act_date) {
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
      title: this.msg('exception'),
      dataIndex: 'excp_count',
      width: 50,
      render(o, record) {
        return (<ExceptionsPopover
          shipmtNo={record.shipmt_no}
          dispId={record.disp_id}
          excpCount={o}
        />);
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
        }
        return <span />;
      },
    }, {
      title: this.msg('srName'),
      dataIndex: 'p_sr_name',
      width: 180,
      render: o => <TrimSpan text={o} maxLen={10} />,
    }, {
      title: this.msg('shipmtMode'),
      dataIndex: 'transport_mode',
      width: 80,
    }];
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadShipmentEvents(null, params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters) => {
        const params = {
          type,
          tenantId: this.props.tenantId,
          startDate,
          endDate,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          filters: { ...this.props.filters, ...filters },
        };
        return params;
      },
      remotes: this.props.statistics.logs,
    });
    let radio = null;
    if (type === 'overtime') {
      radio = (
        <RadioGroup onChange={this.handleStatusTypeChange} value={this.props.filters.statusType} >
          <RadioButton value="all">所有</RadioButton>
          <RadioButton value="intransit">在途</RadioButton>
          <RadioButton value="delivered">已送货</RadioButton>
        </RadioGroup>
      );
    }
    return (
      <div>
        <Header className="page-header">
          <span>{this.msg(type)}</span>
          {radio}
          <div className="page-header-tools">
            <Button type="primary" ghost icon="export" onClick={this.handleExportExcel}>{this.msg('export')}</Button>
          </div>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="panel-body table-panel table-fixed-layout">
              <DataTable columns={columns} dataSource={dataSource} rowKey="id" scroll={{ x: 1700 }} />
            </div>
          </div>
        </Content>
        <ShipmentDock />
        <FreightDock />
        <DelegationDock />
        <ShipmentAdvanceModal />
        <CreateSpecialCharge />
      </div>
    );
  }
}
