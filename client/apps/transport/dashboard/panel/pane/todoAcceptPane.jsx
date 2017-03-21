import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Badge, Tooltip, Tag, Radio } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import { SHIPMENT_TRACK_STATUS, PROMPT_TYPES } from 'common/constants';
import { formatMsg } from '../../message.i18n';
import { loadAcceptanceTable, loadShipmtDetail, hidePreviewer } from 'common/reducers/shipment';
import { columnDef } from './columnDef';
import AccepterModal from '../../../shipment/modals/accepter';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    acceptanceList: state.shipment.statistics.todos.acceptanceList,
  }), { loadAcceptanceTable, loadShipmtDetail, hidePreviewer }
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
    hidePreviewer: PropTypes.func.isRequired,
  }
  state = {
    type: 'all',
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
        { name: 'type', value: this.state.type },
      ],
      pageSize: this.props.acceptanceList.pageSize,
      currentPage: 1,
      sortField: '',
      sortOrder: '',
    });
  }
  msg = formatMsg(this.props.intl)
  handleLoadShipmtDetail = (shipmtNo) => {
    this.props.loadShipmtDetail(shipmtNo, this.props.tenantId, 'sp', 'detail');
  }
  handleTableReload = () => {
    this.handleTableLoad(this.props);
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
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
          filters: [
            { name: 'viewStatus', value: this.props.filter.viewStatus },
            { naeme: 'loginId', value: this.props.loginId },
            { name: 'type', value: this.state.type },
          ],
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
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          statusEle = <Badge status="warning" text={this.msg('pendingShipmt')} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.created_date).format('YYYY.MM.DD HH:mm')}>
              <span>创建时间：{moment(record.created_date).fromNow()}</span>
            </Tooltip>
          </span>);
          if (record.prompt_last_action === PROMPT_TYPES.promptAccept) {
            prompt = (<Tooltip title={moment(record.prompt_last_date).format('YYYY.MM.DD HH:mm')}><Tag color="orange-inverse">客户催促</Tag></Tooltip>);
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
          statusEle = <Badge status="warning" text={this.msg('acceptedShipmt')} />;
          relatedTime = (<span>
            <Tooltip title={moment(record.acpt_time).format('YYYY.MM.DD HH:mm')}>
              <span>接单时间：{moment(record.acpt_time).fromNow()}</span>
            </Tooltip>
          </span>);
          if (record.prompt_last_action === PROMPT_TYPES.promptDispatch) {
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
          <AccepterModal reload={this.handleTableReload} clearSelection={() => {}} />
        </div>
      </div>
    );
  }
}
