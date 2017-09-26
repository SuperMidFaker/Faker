import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag, Radio } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadDispatchTable, loadShipmtDetail, hideDock } from 'common/reducers/shipment';
import { columnDef } from './columnDef';
import RevokeModal from '../../../common/modal/revokeModal';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    acceptanceList: state.shipment.statistics.todos.acceptanceList,
  }), { loadDispatchTable, loadShipmtDetail, hideDock }
)
export default class TodoAcceptPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loadDispatchTable: PropTypes.func.isRequired,
    acceptanceList: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    hideDock: PropTypes.func.isRequired,
  }
  state = {
    type: 'all',
  }
  componentDidMount() {
    this.handleTableLoad(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.filter.tabKey === 'todoAccept' && (this.props.filter.viewStatus !== nextProps.filter.viewStatus ||
      this.props.filter.type !== nextProps.filter.type || this.props.filter.tabKey !== nextProps.filter.tabKey)) {
      this.handleTableLoad(nextProps);
    }
  }
  handleTableLoad = (props) => {
    this.props.loadDispatchTable({
      tenantId: this.props.tenantId,
      filters: {
        viewStatus: props.filter.viewStatus,
        loginId: props.loginId,
        status: this.state.type,
      },
      pageSize: this.props.acceptanceList.pageSize,
      current: 1,
      sortField: '',
      sortOrder: '',
    });
  }
  msg = formatMsg(this.props.intl)
  handleLoadShipmtDetail = (record) => {
    const { tenantId } = this.props;
    let sourceType = 'sp';
    if (tenantId === record.sr_tenant_id) sourceType = 'sr';
    else if (tenantId === record.sp_tenant_id) sourceType = 'sp';
    this.props.loadShipmtDetail(record.shipmt_no, this.props.tenantId, sourceType, 'order');
  }
  handleTableReload = () => {
    this.handleTableLoad(this.props);
  }
  handleTodoFilter = (e) => {
    this.setState({ type: e.target.value }, () => {
      this.handleTableLoad(this.props);
    });
    this.props.hideDock();
  }
  render() {
    const { tenantId } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadDispatchTable(params),
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
          current: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
          filters: {
            viewStatus: this.props.filter.viewStatus,
            loginId: this.props.loginId,
            status: this.state.type,
          },
        };
        return params;
      },
      remotes: this.props.acceptanceList,
    });
    const columns = columnDef(this).concat([{
      dataIndex: 'status',
      width: 180,
      className: 'table-cell-vertical-align-top',
      render: (o, record) => {
        let statusEle = null;
        let relatedTime = null;
        let prompt = null;
        let statusStr = '';
        if (tenantId === record.sr_tenant_id) statusStr = '待承运商';
        else if (tenantId === record.sp_tenant_id) statusStr = '待';
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          statusStr = `${statusStr}接单`;
          statusEle = <Badge status="warning" text={statusStr} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.created_date).format('YYYY.MM.DD HH:mm')}>
              <span>创建时间：{moment(record.created_date).fromNow()}</span>
            </Tooltip>
          </span>);
          if (record.prompt_last_action === PROMPT_TYPES.promptAccept && tenantId === record.sp_tenant_id) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
          statusStr = `${statusStr}调度`;
          statusEle = <Badge status="warning" text={statusStr} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.acpt_time).format('YYYY.MM.DD HH:mm')}>
              <span>接单时间：{moment(record.acpt_time).fromNow()}</span>
            </Tooltip>
          </span>);
          if (record.prompt_last_action === PROMPT_TYPES.promptDispatch && tenantId === record.sp_tenant_id) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
        }
        return (
          <div className="table-cell-border-left">
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
            <RadioButton value="all">{this.msg('all')}</RadioButton>
            <RadioButton value="toAccept">{this.msg('toAccept')}</RadioButton>
            <RadioButton value="toDispatch">{this.msg('toDispatch')}</RadioButton>
            <RadioButton value="prompt">{this.msg('prompt')}</RadioButton>
          </RadioGroup>
        </div>
        <div>
          <Table size="middle" dataSource={dataSource} columns={columns} showHeader={false}
            locale={{ emptyText: '没有待办事项' }} rowKey="id" loading={this.props.acceptanceList.loading}
          />
          <RevokeModal reload={this.handleTableReload} />
        </div>
      </div>
    );
  }
}
