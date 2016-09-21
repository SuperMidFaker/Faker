import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import { loadShipmentEvents } from 'common/reducers/shipment';
import TrimSpan from 'client/components/trimSpan';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { renderConsignLoc } from '../common/consignLocation';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import '../index.less';

const formatMsg = format(messages);

function fetchData({ state, dispatch, cookie, location }) {
  const { startDate, endDate, type } = location.query;
  const { pageSize, currentPage } = state.shipment.statistics.logs;
  return dispatch(loadShipmentEvents(cookie, {
    tenantId: state.account.tenantId,
    startDate,
    endDate,
    type,
    pageSize,
    currentPage,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    statistics: state.shipment.statistics,
  }),
  { loadShipmentEvents })
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
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  renderActDate(recordActDate, recordEstDate) {
    if (recordActDate) {
      const actDate = new Date(recordActDate);
      actDate.setHours(0, 0, 0, 0);
      const estDate = new Date(recordEstDate);
      estDate.setHours(0, 0, 0, 0);
      if (actDate.getTime() > estDate.getTime()) {
        return (
          <span className="mdc-text-red">
          {moment(recordActDate).format('YYYY.MM.DD')}
          </span>);
      } else {
        return (
          <span className="mdc-text-green">
          {moment(recordActDate).format('YYYY.MM.DD')}
          </span>);
      }
    } else {
      return <span />;
    }
  }
  render() {
    const { startDate, endDate, type } = this.props.location.query;

    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      render(text) {
        return text;
      },
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
      render: (o, record) => {
        return this.renderActDate(record.pickup_act_date, record.pickup_est_date);
      },
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
      render: (o, record) => {
        return this.renderActDate(record.deliver_act_date, record.deliver_est_date);
      },
    }, {
      title: this.msg('shipmtStatus'),
      dataIndex: 'status',
      render: (o, record) => {
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          return <Tag>{`1 ${this.msg('pendingShipmt')}`}</Tag>;
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
          return <Tag>{`2 ${this.msg('acceptedShipmt')}`}</Tag>;
        } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          return <Tag color="yellow">{`3 ${this.msg('dispatchedShipmt')}`}</Tag>;
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          return <Tag color="blue">{`4 ${this.msg('intransitShipmt')}`}</Tag>;
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
          return <Tag color="green">{`5 ${this.msg('deliveredShipmt')}`}</Tag>;
        } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          return <Tag color="green">{`6 ${this.msg('proofOfDelivery')}`}</Tag>;
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
        <header className="top-bar" key="header">
          <span>{this.msg(type)}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={dataSource} rowKey="id" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
