import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag, Radio } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { renderLoc } from '../../../common/consignLocation';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadTransitTable, loadShipmtDetail, hidePreviewer } from 'common/reducers/shipment';
import { columnDef } from './columnDef';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    trackingList: state.shipment.statistics.todos.trackingList,
  }), { loadTransitTable, loadShipmtDetail, hidePreviewer }
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
    hidePreviewer: PropTypes.func.isRequired,
  }
  state = {
    type: 'dispatchedOrIntransit',
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
        { name: 'type', value: this.state.type },
      ],
      pageSize: this.props.trackingList.pageSize,
      currentPage: 1,
    });
  }
  msg = formatMsg(this.props.intl)
  handleLoadShipmtDetail = (shipmtNo) => {
    this.props.loadShipmtDetail(shipmtNo, this.props.tenantId, 'sr', 'detail');
  }
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value }, () => {
      this.handleTableLoad(this.props);
    });
    this.props.hidePreviewer();
  }
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
            { name: 'type', value: this.state.type },
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
        let toLocate = null;
        if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          if (!record.last_location_date || record.last_location_date && new Date(moment(record.last_location_date).format('YYYY.MM.DD')) < new Date(moment().format('YYYY.MM.DD'))) {
            toLocate = <Badge status="warning" text={this.msg('toLocateShipmt')} />;
          }
        }
        const area = renderLoc(record, 'province', 'city', 'district');
        const lastLocation = area || record.address || '';
        return (
          <div className="table-cell-border-left">
            <div>{toLocate}</div>
            <div className="mdc-text-grey dashboard-table-font-small">
              <Tooltip title={record.address || ''}>
                <span>{ lastLocation ? `位置：${lastLocation}` : '' }</span>
              </Tooltip>
            </div>
            <div className="mdc-text-grey dashboard-table-font-small">{record.last_location_date ? `更新时间: ${moment(record.last_location_date).fromNow()}` : ''}</div>
          </div>
        );
      },
    }, {
      dataIndex: 'status',
      width: 180,
      className: 'table-cell-vertical-align-top',
      render: (o, record) => {
        let statusEle = null;
        let relatedTime = null;
        let prompt = null;

        if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          if (record.p_prompt_last_action === PROMPT_TYPES.promptSpPickup) {
            prompt = (<Tooltip title={moment(record.p_prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
          const newDate = new Date();
          newDate.setHours(0, 0, 0, 0);
          const pickupEstDate = new Date(record.pickup_est_date);
          pickupEstDate.setHours(0, 0, 0, 0);
          let pickupEstDateStr = '';
          let badgeColor = 'warning';
          if (moment(newDate).diff(pickupEstDate, 'days') === 0) {
            pickupEstDateStr = '计划提货：今天';
          } else if (newDate > pickupEstDate) {
            pickupEstDateStr = `计划提货：超时 ${moment(newDate).diff(pickupEstDate, 'days')} 天`;
            badgeColor = 'error';
          }
          if (new Date(moment(record.pickup_est_date).format('YYYY.MM.DD')) <= new Date(moment().format('YYYY.MM.DD'))) {
            statusEle = <Badge status={badgeColor} text={this.msg('dispatchedShipmt')} />;
          }
          relatedTime = (<span>
            <Tooltip title={record.pickup_est_date ? moment(record.pickup_est_date).format('YYYY.MM.DD HH:mm') : ''}>
              <span>{pickupEstDateStr}</span>
            </Tooltip>
          </span>);
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          let badgeColor = 'warning';
          let deliverPrmDateStr = '';
          const deliverDate = record.deliver_prm_date || record.deliver_est_date;
          if (deliverDate) {
            const newDate = new Date();
            newDate.setHours(0, 0, 0, 0);
            const deliverPrmDate = new Date(deliverDate);
            deliverPrmDate.setHours(0, 0, 0, 0);
            if (moment(newDate).diff(deliverPrmDate, 'days') === 0) {
              deliverPrmDateStr = '承诺送货：今天';
            } else if (newDate > deliverPrmDate) {
              deliverPrmDateStr = `承诺送货：超时 ${moment(newDate).diff(deliverPrmDate, 'days')} 天`;
              badgeColor = 'error';
            }
            statusEle = <Badge status={badgeColor} text={this.msg('toDeliverShipmt')} />;
          }

          relatedTime = (<span>
            <Tooltip title={deliverDate ? moment(deliverDate).format('YYYY.MM.DD HH:mm') : ''}>
              <span>{deliverPrmDateStr}</span>
            </Tooltip>
          </span>);
        }

        return (
          <div>
            <div>{statusEle} {prompt}</div>
            <div className="mdc-text-grey dashboard-table-font-small">{relatedTime}</div>
          </div>
        );
      },
    }]);
    return (
      <div>
        <div className="pane-header">
          <RadioGroup onChange={this.handleTodoFilter} value={this.state.type}>
            <RadioButton value="dispatchedOrIntransit">{this.msg('all')}</RadioButton>
            <RadioButton value="toPickup">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="toLocate">{this.msg('toLocateShipmt')}</RadioButton>
            <RadioButton value="toDeliver">{this.msg('toDeliverShipmt')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="pane-content">
          <Table size="middle" dataSource={dataSource} columns={columns} showHeader={false}
            locale={{ emptyText: '没有待办事项' }} rowKey="id" loading={this.props.trackingList.loading}
          />
        </div>
      </div>

    );
  }
}
