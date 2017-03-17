import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import ShipmtnoColumn from '../../../common/shipmtnoColumn';
import AddressColumn from '../../../common/addressColumn';
import { renderLoc } from '../../../common/consignLocation';
import ActDate from '../../../common/actDate';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadTransitTable, loadShipmtDetail } from 'common/reducers/shipment';

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
          tenantId: this.props.tenantId,
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
    const columns = [{
      dataIndex: 'shipment',
      width: 200,
      render: (o, record) => (
        <div>
          <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key}
            shipment={record} onClick={() => this.props.loadShipmtDetail(record.shipmt_no, tenantId, 'sr', 'detail')}
          />
          <div>{record.ref_external_no}</div>
          <div>{record.customer_name}</div>
        </div>
        ),
    }, {
      dataIndex: 'departurePlace',
      width: 150,
      render: (o, record) => (
        <div>
          <AddressColumn shipment={record} consignType="consigner" />
          <div>{this.msg('shipmtEstPickupDate')}: {moment(record.pickup_est_date).format('YYYY.MM.DD')}</div>
          <div>{record.pickup_act_date ? (<ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} textBefore={`${this.msg('shipmtActPickupDate')}:`} />) : ''}</div>
        </div>
      ),
    }, {
      dataIndex: 'arrivalPlace',
      width: 150,
      render: (o, record) => {
        let deliverActDate = null;
        if (record.deliver_act_date) {
          const deliverPrmDate = new Date(record.pickup_act_date);
          deliverPrmDate.setDate(deliverPrmDate.getDate() + record.transit_time);
          deliverActDate = (<ActDate actDate={record.deliver_act_date} estDate={deliverPrmDate} textBefore={`${this.msg('shipmtActDeliveryDate')}:`} />);
        }
        return (
          <div>
            <AddressColumn shipment={record} consignType="consignee" />
            <div>{this.msg('shipmtEstDeliveryDate')}: {moment(record.deliver_est_date).format('YYYY.MM.DD')}</div>
            <div>{deliverActDate}</div>
          </div>
        );
      },
    }, {
      dataIndex: 'lastLocation',
      width: 150,
      render: (o, record) => {
        if (record.last_location_date) {
          return (
            <div className="table-cell-border-right">
              <div>{renderLoc(record, 'province', 'city', 'district')}</div>
              <div>{record.address || ''}</div>
              <div>上报位置时间: {moment(record.last_location_date).format('YYYY.MM.DD HH:mm')}</div>
            </div>
          );
        }
        return '';
      },
    }, {
      dataIndex: 'status',
      width: 150,
      render: (o, record) => {
        let statusEle = null;
        let relatedTime = null;
        let prompt = null;
        let toLocate = null;
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          statusEle = <Badge status="default" text={this.msg('pendingShipmt')} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.created_date).format('YYYY.MM.DD HH:mm')}>
              <span>创建时间：{moment(record.created_date).fromNow()}</span>
            </Tooltip>
          </span>);
          if (record.prompt_last_action === PROMPT_TYPES.promptAccept) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
          statusEle = <Badge status="default" text={this.msg('acceptedShipmt')} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.acpt_time).format('YYYY.MM.DD HH:mm')}>
              <span>接单时间：{moment(record.acpt_time).fromNow()}</span>
            </Tooltip>
          </span>);
          if (record.prompt_last_action === PROMPT_TYPES.promptDispatch) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          statusEle = <Badge status="warning" text={this.msg('dispatchedShipmt')} />;
          if (record.prompt_last_action === PROMPT_TYPES.promptSpPickup) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
          relatedTime = (<span>
            <Tooltip title={moment(record.disp_time).format('YYYY.MM.DD HH:mm')}>
              <span>分配时间：{moment(record.disp_time).fromNow()}</span>
            </Tooltip>
          </span>);
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          statusEle = <Badge status="processing" text={this.msg('toDeliverShipmt')} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.pickup_act_date).format('YYYY.MM.DD HH:mm')}>
              <span>提货时间：{moment(record.pickup_act_date).fromNow()}</span>
            </Tooltip>
          </span>);
          if (!record.last_location_date || record.last_location_date && new Date(moment(record.last_location_date).format('YYYY.MM.DD')) < new Date(moment().format('YYYY.MM.DD'))) {
            toLocate = <Badge status="warning" text={this.msg('toLocateShipmt')} />;
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
          statusEle = <Badge status="success" text={this.msg('deliveredShipmt')} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.deliver_act_date).format('YYYY.MM.DD HH:mm')}>
              <span>到达时间：{moment(record.deliver_act_date).fromNow()}</span>
            </Tooltip>
          </span>);
        } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          statusEle = <Badge status="success" text={this.msg('proofOfDelivery')} />;
        } else {
          statusEle = <span />;
        }

        return (
          <div>
            <div>{statusEle} {toLocate} {prompt}</div>
            <div>{relatedTime}</div>
          </div>
        );
      },
    }];
    return (
      <Table size="middle" dataSource={dataSource} columns={columns} showHeader={false}
        locale={{ emptyText: '没有待办事项' }} rowKey="id"
      />
    );
  }
}
