import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import ShipmtnoColumn from '../../../common/shipmtnoColumn';
import AddressColumn from '../../../common/addressColumn';
import ActDate from '../../../common/actDate';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadAcceptanceTable, loadShipmtDetail } from 'common/reducers/shipment';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    acceptanceList: state.shipment.statistics.todos.acceptanceList,
  }), { loadAcceptanceTable, loadShipmtDetail }
)
export default class TodoAcceptPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loadAcceptanceTable: PropTypes.func.isRequired,
    acceptanceList: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
  }
  componentDidMount() {
    this.handleTableLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.filter.tabKey === 'todoAccept' && (this.props.filter.viewStatus !== nextProps.filter.viewStatus ||
      this.props.filter.type !== nextProps.filter.type)) {
      this.handleTableLoad(nextProps);
    }
  }
  handleTableLoad = (props) => {
    this.props.loadAcceptanceTable({
      tenantId: this.props.tenantId,
      filters: [
        { name: 'viewStatus', value: props.filter.viewStatus },
        { naeme: 'loginId', value: props.loginId },
        { name: 'type', value: props.filter.type },
      ],
      pageSize: this.props.acceptanceList.pageSize,
      currentPage: this.props.acceptanceList.current,
      sortField: '',
      sortOrder: '',
    });
  }
  msg = formatMsg(this.props.intl)

  render() {
    const { tenantId } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadAcceptanceTable(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId: this.props.tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
          filters: [
            { name: 'viewStatus', value: this.props.filter.viewStatus },
            { naeme: 'loginId', value: this.props.loginId },
            { name: 'type', value: this.props.filter.type },
          ],
        };
        return params;
      },
      remotes: this.props.acceptanceList,
    });
    const columns = [{
      dataIndex: 'shipment',
      width: 200,
      render: (o, record) => (
        <div>
          <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key}
            shipment={record} onClick={() => this.props.loadShipmtDetail(record.shipmt_no, tenantId, 'sp', 'detail')}
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
          <div className="table-cell-border-right">
            <AddressColumn shipment={record} consignType="consignee" />
            <div>{this.msg('shipmtEstDeliveryDate')}: {moment(record.deliver_est_date).format('YYYY.MM.DD')}</div>
            <div>{deliverActDate}</div>
          </div>
        );
      },
    }, {
      dataIndex: 'status',
      width: 150,
      render: (o, record) => {
        let statusEle = null;
        let relatedTime = null;
        let prompt = null;
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
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          statusEle = <Badge status="processing" text={this.msg('intransitShipmt')} />;
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
          statusEle = <Badge status="success" text={this.msg('deliveredShipmt')} />;
        } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          statusEle = <Badge status="success" text={this.msg('proofOfDelivery')} />;
        } else {
          statusEle = <span />;
        }
        return (
          <div>
            <div>{statusEle} {prompt}</div>
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
