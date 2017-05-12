import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Badge, Input, Layout, Tooltip } from 'antd';
import { loadFlowList, loadFlowTrackingFields, openCreateFlowModal, openFlow, reloadFlowList, editFlow } from 'common/reducers/scofFlow';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import Table from 'client/components/remoteAntTable';
import EditableCell from 'client/components/EditableCell';
import CreateFlowModal from './modal/createFlowModal';
import FlowDesigner from './designer';
import { formatMsg } from './message.i18n';

const Sider = Layout.Sider;
const Search = Input.Search;

function fetchData({ state, dispatch }) {
  return dispatch(loadFlowList({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.scofFlow.listFilter),
    pageSize: state.scofFlow.flowList.pageSize,
    current: state.scofFlow.flowList.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    reload: state.scofFlow.reloadFlowList,
    loading: state.scofFlow.flowListLoading,
    thisFlow: state.scofFlow.currentFlow,
    listFilter: state.scofFlow.listFilter,
    flowList: state.scofFlow.flowList,
    listCollapsed: state.scofFlow.listCollapsed,
  }),
  { openCreateFlowModal, loadFlowList, loadFlowTrackingFields, openFlow, reloadFlowList, editFlow }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class FlowList extends React.Component {
  static defaultProps ={
    listCollapsed: false,
  }
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    listCollapsed: PropTypes.bool.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
  }
  componentWillMount() {
    this.props.loadFlowTrackingFields();
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.reload && nextProps.reload) {
      let current = nextProps.flowList.current;
      if (nextProps.flowList.pageSize * current === nextProps.flowList.totalCount) {
        current += 1;
      }
      this.props.reloadFlowList({
        tenantId: nextProps.tenantId,
        filter: JSON.stringify(nextProps.listFilter),
        pageSize: nextProps.flowList.pageSize,
        current,
      });
    }
  }
  msg = formatMsg(this.props.intl)

  columns = [{
    render: (o, record) => (<div>
      <EditableCell value={record.name} cellTrigger={false} onSave={name => this.handleFlowNameChange(record.id, name)} />
      <div className="mdc-text-grey">
        {record.customer_tenant_id === -1 ?
          <Tooltip title="线下企业" placement="left"><Badge status="default" />{record.customer}</Tooltip> :
          <Tooltip title="线上租户" placement="left"><Badge status="processing" />{record.customer}</Tooltip>}
      </div>
    </div>),
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.loadFlowList({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: params.pageSize,
      current: params.current,
    }),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: false,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: {
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        },
      };
      return params;
    },
    remotes: this.props.flowList,
  })
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, name: value };
    this.props.loadFlowList({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter),
      pageSize: this.props.flowList.pageSize,
      current: 1,
    });
  }
  handleRowClick = (row) => {
    this.props.openFlow(row);
  }
  handleCreateFlow = () => {
    this.props.openCreateFlowModal();
  }
  handleFlowNameChange = (flowid, name) => {
    this.props.editFlow(flowid, { name });
  }
  render() {
    const { thisFlow, flowList, loading, listCollapsed } = this.props;
    this.dataSource.remotes = flowList;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible collapsed={listCollapsed} collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flowName')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title={this.msg('createFlow')}>
                <Button type="primary" shape="circle" icon="plus" onClick={this.handleCreateFlow} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search onSearch={this.handleSearch} size="large" />
            </div>
            <Table showHeader={false} size="middle" dataSource={this.dataSource} columns={this.columns} onRowClick={this.handleRowClick}
              rowClassName={record => thisFlow && record.id === thisFlow.id ? 'table-row-selected' : ''} loading={loading}
              rowKey="id" scroll={{ y: 640 }}
            />
          </div>
        </Sider>
        <CreateFlowModal />
        {thisFlow &&
        <FlowDesigner currentFlow={thisFlow} />
        }
      </Layout>
    );
  }
}
