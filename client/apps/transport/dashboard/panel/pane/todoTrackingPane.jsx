import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { renderLoc } from '../../../common/consignLocation';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadTransitTable, loadShipmtDetail } from 'common/reducers/shipment';
import { columnDef } from './columnDef';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    trackingList: state.shipment.statistics.todos.trackingList,
  }), { loadTransitTable, loadShipmtDetail }
)
export default class TodoAcceptPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loadTransitTable: PropTypes.func.isRequired,
    trackingList: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.handleTableLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.filter.tabKey === 'todoTrack' && (this.props.filter.viewStatus !== nextProps.filter.viewStatus ||
      this.props.filter.type !== nextProps.filter.type)) {
      this.handleTableLoad(nextProps);
    }
  }
  handleTableLoad = (props) => {
    this.props.loadTransitTable({
      tenantId: this.props.tenantId,
      filters: [
        { name: 'viewStatus', value: props.filter.viewStatus },
        { naeme: 'loginId', value: props.loginId },
        { name: 'type', value: props.filter.type },
      ],
      pageSize: this.props.trackingList.pageSize,
      currentPage: this.props.trackingList.current,
    });
  }
  msg = formatMsg(this.props.intl)

  render() {
    const { tenantId } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadTransitTable(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const params = {
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          filters: [
            { name: 'viewStatus', value: this.props.filter.viewStatus },
            { naeme: 'loginId', value: this.props.loginId },
            { name: 'type', value: this.props.filter.type },
          ],
        };
        return params;
      },
      remotes: this.props.trackingList,
    });
    const columns = columnDef(this).concat([{
      dataIndex: 'lastLocation',
      width: 150,
      className: 'table-cell-vertical-align-top',
      render: (o, record) => {
        if (record.last_location_date) {
          return (
            <div>
              <div>{renderLoc(record, 'province', 'city', 'district')}</div>
              <div className="dashboard-table-font-small">{record.address || ''}</div>
              <div className="dashboard-table-font-small">上报位置时间: {moment(record.last_location_date).fromNow()}</div>
            </div>
          );
        }
        return '';
      },
    }, {
      dataIndex: 'status',
      width: 180,
      className: 'table-cell-vertical-align-top',
      render: (o, record) => {
        let statusEle = null;
        let relatedTime = null;
        let prompt = null;
        let toLocate = null;
        if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          if (new Date(moment(record.pickup_est_date).format('YYYY.MM.DD')) <= new Date(moment().format('YYYY.MM.DD'))) {
            statusEle = <Badge status="warning" text={this.msg('dispatchedShipmt')} />;
          }
          if (record.prompt_last_action === PROMPT_TYPES.promptSpPickup) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
          relatedTime = (<span>
            <Tooltip title={moment(record.disp_time).format('YYYY.MM.DD HH:mm')}>
              <span>分配时间：{moment(record.disp_time).fromNow()}</span>
            </Tooltip>
          </span>);
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          if (new Date(moment(record.deliver_prm_date).format('YYYY.MM.DD')) <= new Date(moment().format('YYYY.MM.DD'))) {
            statusEle = <Badge status="processing" text={this.msg('toDeliverShipmt')} />;
          }
          relatedTime = (<span>
            <Tooltip title={moment(record.pickup_act_date).format('YYYY.MM.DD HH:mm')}>
              <span>提货时间：{moment(record.pickup_act_date).fromNow()}</span>
            </Tooltip>
          </span>);
          if (!record.last_location_date || record.last_location_date && new Date(moment(record.last_location_date).format('YYYY.MM.DD')) < new Date(moment().format('YYYY.MM.DD'))) {
            toLocate = <Badge status="warning" text={this.msg('toLocateShipmt')} />;
          }
        }

        return (
          <div className="table-cell-border-left">
            <div>{statusEle} {toLocate} {prompt}</div>
            <div className="mdc-text-grey dashboard-table-font-small">{relatedTime}</div>
          </div>
        );
      },
    }]);
    return (
      <Table size="middle" dataSource={dataSource} columns={columns} showHeader={false}
        locale={{ emptyText: '没有待办事项' }} rowKey="id"
      />
    );
  }
}
