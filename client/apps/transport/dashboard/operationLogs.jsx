import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Tag, Layout, Radio } from 'antd';
import Table from 'client/components/remoteAntTable';
import { loadShipmentEvents, loadShipmtDetail } from 'common/reducers/shipment';
import TrimSpan from 'client/components/trimSpan';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { renderConsignLoc } from '../common/consignLocation';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import '../index.less';
import PreviewPanel from '../shipment/modals/preview-panel';
import ActDate from '../common/actDate';
import ExceptionListPopover from '../tracking/land/modals/exception-list-popover';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie, location }) {
  const { startDate, endDate, type } = location.query;
  const { pageSize, filters } = state.shipment.statistics.logs;
  return dispatch(loadShipmentEvents(cookie, {
    tenantId: state.account.tenantId,
    startDate,
    endDate,
    type,
    pageSize,
    currentPage: 1,
    filters,
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
  { loadShipmentEvents, loadShipmtDetail })
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'transportDashboard'),
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'dashboard' })
export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object,
    tenantId: PropTypes.number.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadShipmentEvents: PropTypes.func.isRequired,
    statistics: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
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
  render() {
    const { startDate, endDate, type } = this.props.location.query;

    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      fixed: 'left',
      width: 150,
      render: (o, record) => (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'detail', record)}>{record.shipmt_no}</a>),
    }, {
      title: this.msg('departurePlace'),
      width: 140,
      render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />,
    }, {
      title: this.msg('shipmtEstPickupDate'),
      dataIndex: 'pickup_est_date',
      width: 100,
      render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtActPickupDate'),
      dataIndex: 'pickup_act_date',
      width: 100,
      render: (o, record) => o ? (<ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />) : '',
    }, {
      title: this.msg('arrivalPlace'),
      width: 140,
      render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />,
    }, {
      title: this.msg('shipmtEstDeliveryDate'),
      dataIndex: 'deliver_est_date',
      width: 100,
      render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtPrmDeliveryDate'),
      dataIndex: 'deliver_prm_date',
      width: 100,
      render: o => o ? moment(o).format('YYYY.MM.DD') : '',
    }, {
      title: this.msg('shipmtActDeliveryDate'),
      dataIndex: 'deliver_act_date',
      width: 100,
      render: (o, record) => {
        if (record.deliver_act_date) {
          const deliverPrmDate = new Date(record.pickup_act_date);
          deliverPrmDate.setDate(deliverPrmDate.getDate() + record.transit_time);
          return (<ActDate actDate={record.deliver_act_date} estDate={deliverPrmDate} />);
        } else {
          return '';
        }
      },
    }, {
      title: this.msg('overtime'),
      key: 'late',
      width: 100,
      render(o, record) {
        if (record.pickup_act_date) {
          const deliveredActDate = new Date(record.deliver_act_date || new Date());
          deliveredActDate.setHours(0, 0, 0, 0);
          const pickupActDate = new Date(record.pickup_act_date);
          pickupActDate.setHours(0, 0, 0, 0);
          const daysDiff = moment(deliveredActDate).diff(pickupActDate, 'days');
          if (daysDiff > record.transit_time) {
            return `超时${daysDiff - record.transit_time}天`;
          }
        }
        return '';
      },
    }, {
      title: this.msg('exception'),
      dataIndex: 'excp_count',
      width: 50,
      render(o, record) {
        return (<ExceptionListPopover
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
        } else {
          return <span />;
        }
      },
    }, {
      title: this.msg('shipmtCustomer'),
      dataIndex: 'customer_name',
      width: 180,
      render: o => <TrimSpan text={o} maxLen={10} />,
    }, {
      title: this.msg('shipmtMode'),
      dataIndex: 'transport_mode',
      width: 80,
    }];
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadShipmentEvents(null, params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.currentPage, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
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
        <RadioGroup onChange={this.handleStatusTypeChange} value={this.props.filters.statusType} size="large">
          <RadioButton value="all">所有</RadioButton>
          <RadioButton value="intransit">在途</RadioButton>
          <RadioButton value="delivered">已送货</RadioButton>
        </RadioGroup>
      );
    }
    return (
      <div>
        <Header className="top-bar">
          <span>{this.msg(type)}</span>
          {radio}
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={dataSource} rowKey="id" scroll={{ x: 1480 }} />
            </div>
          </div>
        </Content>
        <PreviewPanel stage="dashboard" />
      </div>
    );
  }
}
