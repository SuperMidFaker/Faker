import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Popconfirm, Radio, message } from 'antd';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';
import { loadPodTable, loadShipmtDetail, hidePreviewer } from 'common/reducers/shipment';
import { deliverConfirm } from 'common/reducers/trackingLandStatus';
import { columnDef } from './columnDef';
import { SHIPMENT_POD_STATUS, SHIPMENT_VEHICLE_CONNECT } from 'common/constants';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    podList: state.shipment.statistics.todos.podList,
  }), { loadPodTable, loadShipmtDetail, deliverConfirm, hidePreviewer }
)
export default class TodoAcceptPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loadPodTable: PropTypes.func.isRequired,
    podList: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    deliverConfirm: PropTypes.func.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
  }
  state = {
    type: 'todoAll',
  }
  componentDidMount() {
    this.handleTableLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.filter.tabKey === 'todoPod' && (this.props.filter.viewStatus !== nextProps.filter.viewStatus ||
      this.props.filter.type !== nextProps.filter.type || this.props.filter.tabKey !== nextProps.filter.tabKey)) {
      this.handleTableLoad(nextProps);
    }
  }
  handleTableLoad = (props) => {
    this.props.loadPodTable({
      tenantId: this.props.tenantId,
      filters: [
        { name: 'viewStatus', value: props.filter.viewStatus },
        { name: 'loginId', value: props.loginId },
        { name: 'type', value: this.state.type },
      ],
      pageSize: this.props.podList.pageSize,
      currentPage: 1,
      sortField: '',
      sortOrder: '',
    });
  }
  msg = formatMsg(this.props.intl)
  handleLoadShipmtDetail = (record) => {
    this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, 'sr', 'tracking');
  }
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value }, () => {
      this.handleTableLoad(this.props);
    });
    this.props.hidePreviewer();
  }
  handleDeliverConfirm = (shipmtNo, dispId) => {
    this.props.deliverConfirm(shipmtNo, dispId).then((result) => {
      if (!result.error) {
        this.handleTableLoad(this.props);
      } else {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const { tenantId } = this.props;
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadPodTable(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
          filters: [
            { name: 'viewStatus', value: this.props.filter.viewStatus },
            { name: 'loginId', value: this.props.loginId },
            { name: 'type', value: this.state.type },
          ],
        };
        return params;
      },
      remotes: this.props.podList,
    });
    const columns = columnDef(this).concat([{
      dataIndex: 'status',
      width: 180,
      className: 'table-cell-vertical-align-top',
      render: (o, record) => {
        let toUploadPodEle = null;
        let toAuditPodEle = null;
        let relatedTime = null;
        let smsConfirm = null;
        let statusStr = '';
        if (record.sp_tenant_id === -1) {
          statusStr = '回单待';
        } else if (record.sp_tenant_id === 0 && record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            statusStr = '回单待';
          } else {
            // 司机更新
            statusStr = '回单待司机';
          }
        } else {
          statusStr = '回单待承运商';
        }
        if (tenantId === record.tenant_id && record.deliver_confirmed === 0) {
          smsConfirm = (<Badge status="success" text={
            <Popconfirm title="是否确定短信确认?" onConfirm={() => this.handleDeliverConfirm(record.shipmt_no, record.disp_id)} okText="确定" cancelText="取消">
              <a>短信确认</a>
            </Popconfirm>}
          />);
        }
        if (record.pod_status === null || record.pod_status === SHIPMENT_POD_STATUS.unsubmit || record.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          statusStr = `${statusStr}上传`;
          toUploadPodEle = <Badge status="warning" text={statusStr} />;
        } else {
          relatedTime = (<span>
            <Tooltip title={moment(record.pod_recv_date).format('YYYY.MM.DD HH:mm')}>
              <span>回单上传时间：{moment(record.pod_recv_date).fromNow()}</span>
            </Tooltip>
          </span>);
        }
        if (record.pod_status === SHIPMENT_POD_STATUS.pending) {
          toAuditPodEle = <Badge status="warning" text={this.msg('toAuditPod')} />;
        }
        return (
          <div className="table-cell-border-left">
            <div>{toUploadPodEle} {toAuditPodEle} {smsConfirm}</div>
            <div className="mdc-text-grey dashboard-table-font-small">{relatedTime}</div>
          </div>
        );
      },
    }]);
    const toolbarActions = (<span>
      <RadioGroup onChange={this.handleTodoFilter} value={this.state.type}>
        <RadioButton value="todoAll">{this.msg('all')}</RadioButton>
        <RadioButton value="toUploadPod">{this.msg('toUploadPod')}</RadioButton>
        <RadioButton value="toAuditPod">{this.msg('toAuditPod')}</RadioButton>
        <RadioButton value="toConfirm">{this.msg('toConfirm')}</RadioButton>
      </RadioGroup>
    </span>);
    return (
      <div>
        <DataTable toolbarActions={toolbarActions} size="middle" dataSource={dataSource} columns={columns} showHeader={false}
          locale={{ emptyText: '没有待办事项' }} rowKey="id" loading={this.props.podList.loading}
        />
      </div>
    );
  }
}
