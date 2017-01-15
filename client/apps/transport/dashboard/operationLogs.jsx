import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Tag, Layout } from 'antd';
import Table from 'client/components/remoteAntTable';
import { loadShipmentEvents, loadShipmtDetail } from 'common/reducers/shipment';
import TrimSpan from 'client/components/trimSpan';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { renderConsignLoc } from '../common/consignLocation';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import '../index.less';
import PreviewPanel from '../shipment/modals/preview-panel';
import ActDate from '../common/actDate';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ state, dispatch, cookie, location }) {
  const { startDate, endDate, type } = location.query;
  const { pageSize } = state.shipment.statistics.logs;
  return dispatch(loadShipmentEvents(cookie, {
    tenantId: state.account.tenantId,
    startDate,
    endDate,
    type,
    pageSize,
    currentPage: 1,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.shipment.statistics,
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
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { startDate, endDate, type } = this.props.location.query;

    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      render: (o, record) => (<a onClick={() => this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'detail', record)}>{record.shipmt_no}</a>),
    }, {
      title: this.msg('departurePlace'),
      render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />,
    }, {
      title: this.msg('shipmtEstPickupDate'),
      dataIndex: 'pickup_est_date',
      render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtActPickupDate'),
      dataIndex: 'pickup_act_date',
      render: (o, record) => o ? (<ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />) : '',
    }, {
      title: this.msg('arrivalPlace'),
      render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />,
    }, {
      title: this.msg('shipmtEstDeliveryDate'),
      dataIndex: 'deliver_est_date',
      render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
    }, {
      title: this.msg('shipmtActDeliveryDate'),
      dataIndex: 'deliver_act_date',
      render: (o, record) => o ? (<ActDate actDate={record.deliver_act_date} estDate={record.deliver_est_date} />) : '',
    }, {
      title: this.msg('shipmtStatus'),
      dataIndex: 'status',
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
      render: o => <TrimSpan text={o} maxLen={10} />,
    }, {
      title: this.msg('shipmtMode'),
      dataIndex: 'transport_mode',
    }, {
      title: '操作人员',
      dataIndex: 'login_name',
    }, {
      title: '操作时间',
      dataIndex: 'created_date',
      render(o) {
        return moment(o).format('YYYY-MM-DD HH:mm:ss');
      },
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
      getParams: (pagination) => {
        const params = {
          type,
          tenantId: this.props.tenantId,
          startDate,
          endDate,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
        };
        return params;
      },
      remotes: this.props.statistics.logs,
    });

    return (
      <div>
        <Header className="top-bar" key="header">
          <span>{this.msg(type)}</span>
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={dataSource} rowKey="id" />
            </div>
          </div>
        </Content>
        <PreviewPanel stage="dashboard" />
      </div>
    );
  }
}
