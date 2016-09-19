import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import { Card } from 'antd';
import Table from 'client/components/remoteAntTable';
import { loadShipmentLogs } from 'common/reducers/shipment';
import './index.less';
import messages from './message.i18n';
const formatMsg = format(messages);

function fetchData({ state, dispatch, cookie, location }) {
  const { startDate, endDate, type } = location.query;
  const { pageSize, currentPage } = state.shipment.statistics.logs;
  return dispatch(loadShipmentLogs(cookie, {
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
  { loadShipmentLogs })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null,
  }));
})

export default class Dashboard extends React.Component {
  static propTypes = {
    children: PropTypes.object,
    tenantId: PropTypes.number.isRequired,
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { startDate, endDate, type } = this.props.location.query;

    const columns = [{
      title: '运单号',
      dataIndex: 'shipmt_no',
      render(text) {
        return text;
      },
    }, {
      title: '操作时间',
      dataIndex: 'created_date',
      render(o) {
        return moment(o).format('YYYY-MM-DD HH:mm:ss');
      },
    }];
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadShipmentLogs(null, params),
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
        <div className="main-content">
          <div className="page-body">
            <Card title={this.msg(type)}>
              <Table size="small" columns={columns} dataSource={dataSource} rowKey="id" />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
