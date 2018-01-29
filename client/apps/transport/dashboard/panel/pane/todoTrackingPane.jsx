import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag, Radio } from 'antd';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import * as Location from 'client/util/location';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES, SHIPMENT_VEHICLE_CONNECT } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadTransitTable, loadShipmtDetail, hideDock } from 'common/reducers/shipment';
import RevokeModal from '../../../common/modal/revokeModal';
import { columnDef } from './columnDef';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
  loginId: state.account.loginId,
  trackingList: state.shipment.statistics.todos.trackingList,
}), { loadTransitTable, loadShipmtDetail, hideDock })
export default class TodoTrackingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loadTransitTable: PropTypes.func.isRequired,
    trackingList: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    hideDock: PropTypes.func.isRequired,
  }
  state = {
    type: 'dispatchedOrIntransit',
  }
  componentDidMount() {
    this.handleTableLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.filter.tabKey === 'todoTrack' && (this.props.filter.viewStatus !== nextProps.filter.viewStatus ||
      this.props.filter.type !== nextProps.filter.type || this.props.filter.tabKey !== nextProps.filter.tabKey ||
      nextProps.filter.srTenantId !== this.props.filter.srTenantId || nextProps.filter.srPartnerId !== this.props.filter.srPartnerId)) {
      this.handleTableLoad(nextProps);
    }
  }
  handleTableLoad = (props) => {
    this.props.loadTransitTable({
      tenantId: this.props.tenantId,
      filters: [
        { name: 'viewStatus', value: props.filter.viewStatus },
        { name: 'sr_tenant_id', value: props.filter.srTenantId },
        { name: 'sr_partner_id', value: props.filter.srPartnerId },
        { name: 'loginId', value: props.loginId },
        { name: 'type', value: this.state.type },
      ],
      pageSize: this.props.trackingList.pageSize,
      currentPage: 1,
    });
  }
  handleTableReload = () => {
    this.handleTableLoad(this.props);
  }
  msg = formatMsg(this.props.intl)
  handleLoadShipmtDetail = (record) => {
    this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'tracking');
  }
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value }, () => {
      this.handleTableLoad(this.props);
    });
    this.props.hideDock();
  }
  render() {
    const { tenantId } = this.props;
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadTransitTable(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination) => {
        const params = {
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          filters: [
            { name: 'viewStatus', value: this.props.filter.viewStatus },
            { name: 'sr_tenant_id', value: this.props.filter.srTenantId },
            { name: 'sr_partner_id', value: this.props.filter.srPartnerId },
            { name: 'loginId', value: this.props.loginId },
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
        let statusStr = '';
        if (record.sp_tenant_id === -1) {
          statusStr = '待';
        } else if (record.sp_tenant_id === 0 && record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            statusStr = '待';
          } else {
            // 司机更新
            statusStr = '待司机';
          }
        } else {
          statusStr = '待承运商';
        }
        if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          const newDate = new Date();
          newDate.setHours(0, 0, 0, 0);
          const lastLocationDate = new Date(record.last_location_date);
          lastLocationDate.setHours(0, 0, 0, 0);
          if (!record.last_location_date || lastLocationDate < newDate) {
            statusStr = `${statusStr}上报位置`;
            toLocate = <Badge status="warning" text={statusStr} />;
          }
        }
        const area = Location.renderLocation(record, 'province', 'city', 'district');
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
        let statusStr = '';
        if (record.sp_tenant_id === -1) {
          statusStr = '待';
        } else if (record.sp_tenant_id === 0 && record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            statusStr = '待';
          } else {
            // 司机更新
            statusStr = '待司机';
          }
        } else {
          statusStr = '待承运商';
        }
        if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          statusStr = `${statusStr}提货`;
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
          if (pickupEstDate <= newDate) {
            statusEle = <Badge status={badgeColor} text={statusStr} />;
          }
          relatedTime = (<span>
            <Tooltip title={record.pickup_est_date ? moment(record.pickup_est_date).format('YYYY.MM.DD') : ''}>
              <span>{pickupEstDateStr}</span>
            </Tooltip>
          </span>);
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          statusStr = `${statusStr}交货`;
          let badgeColor = 'warning';
          let deliverEstDateStr = '';
          const newDate = new Date();
          newDate.setHours(0, 0, 0, 0);
          const deliverEstDate = new Date(record.deliver_est_date);
          deliverEstDate.setHours(0, 0, 0, 0);

          if (moment(newDate).diff(deliverEstDate, 'days') === 0) {
            deliverEstDateStr = '计划送货：今天';
            statusEle = <Badge status={badgeColor} text={statusStr} />;
          } else if (newDate > deliverEstDate) {
            deliverEstDateStr = `计划送货：超时 ${moment(newDate).diff(deliverEstDate, 'days')} 天`;
            badgeColor = 'error';
            statusEle = <Badge status={badgeColor} text={statusStr} />;
          }


          relatedTime = (<span>
            <Tooltip title={deliverEstDate ? moment(deliverEstDate).format('YYYY.MM.DD') : ''}>
              <span>{deliverEstDateStr}</span>
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
        <div>
          <DataTable
            size="middle"
            dataSource={dataSource}
            columns={columns}
            showHeader={false}
            locale={{ emptyText: '没有待办事项' }}
            rowKey="id"
            loading={this.props.trackingList.loading}
          />
          <RevokeModal reload={this.handleTableReload} />
        </div>
      </div>

    );
  }
}
