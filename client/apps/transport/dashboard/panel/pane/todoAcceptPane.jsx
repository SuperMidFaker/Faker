import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Radio, Badge } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import ShipmtnoColumn from '../../../common/shipmtnoColumn';
import AddressColumn from '../../../common/addressColumn';
import ActDate from '../../../common/actDate';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadAcceptanceTable } from 'common/reducers/shipment';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    acceptanceList: state.shipment.statistics.todos.acceptanceList,
  }), { loadAcceptanceTable }
)
export default class TodoAcceptPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    onShipmtPreview: PropTypes.func.isRequired,
    loadAcceptanceTable: PropTypes.func.isRequired,
    acceptanceList: PropTypes.object.isRequired,
  }
  state = {
    type: 'all',
  }
  componentDidMount() {
    this.props.loadAcceptanceTable(null, {
      tenantId: this.props.tenantId,
      filters: [{ name: 'viewStatus', value: 'all' }],
      pageSize: this.props.acceptanceList.pageSize,
      currentPage: this.props.acceptanceList.current,
      sortField: '',
      sortOrder: '',
    });
  }
  msg = formatMsg(this.props.intl)
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value });
  }

  render() {
    // const {  } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadAcceptanceTable(null, params),
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
          filters: [{ name: 'viewStatus', value: 'all' }],
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
            shipment={record} onClick={this.props.onShipmtPreview}
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
          <div>{record.pickup_act_date ? (<ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} />) : ''}</div>
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
          deliverActDate = (<ActDate actDate={record.deliver_act_date} estDate={deliverPrmDate} />);
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
      dataIndex: 'status',
      width: 150,
      render: (o, record) => {
        let statusEle = null;
        let relatedTime = null;
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          statusEle = <Badge status="default" text={this.msg('pendingShipmt')} />;
          relatedTime = `创建时间：${moment(record.created_date).format('YYYY.MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
          statusEle = <Badge status="default" text={this.msg('acceptedShipmt')} />;
        } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          statusEle = <Badge status="warning" text={this.msg('dispatchedShipmt')} />;
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          statusEle = <Badge status="processing" text={this.msg('intransitShipmt')} />;
          relatedTime = `创建时间：${moment(record.disp_time).format('YYYY.MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
          statusEle = <Badge status="success" text={this.msg('deliveredShipmt')} />;
        } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          statusEle = <Badge status="success" text={this.msg('proofOfDelivery')} />;
        } else {
          statusEle = <span />;
        }
        return (
          <div>
            <div>{statusEle}</div>
            <div>{relatedTime}</div>
          </div>
        );
      },
    }];
    return (
      <div>
        <div className="pane-header">
          <RadioGroup onChange={this.handleTodoFilter} value={this.state.type}>
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="toAccept">{this.msg('toAccept')}</RadioButton>
            <RadioButton value="toDispatch">{this.msg('toDispatch')}</RadioButton>
            <RadioButton value="prompt">{this.msg('prompt')}</RadioButton>
          </RadioGroup>
        </div>
        <div className="pane-content">
          <Table size="middle" dataSource={dataSource} columns={columns} showHeader={false}
            locale={{ emptyText: '没有待办事项' }}
          />
        </div>
      </div>
    );
  }
}
