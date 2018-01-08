import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Badge, Input, Layout, Tooltip, Table } from 'antd';
import { loadFlowList, loadFlowTrackingFields, openCreateFlowModal, openFlow, reloadFlowList, editFlow, toggleFlowDesigner } from 'common/reducers/scofFlow';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import DockPanel from 'client/components/DockPanel';
import PageHeader from 'client/components/PageHeader';
import EditableCell from 'client/components/EditableCell';
import CreateFlowModal from './modal/createFlowModal';
import FlowDesigner from './designer';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { Search } = Input;

function fetchData({ state, dispatch }) {
  return dispatch(loadFlowList({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ ...state.scofFlow.listFilter, name: '' }),
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
    designerVisible: state.scofFlow.flowDesigner.visible,
  }),
  {
    openCreateFlowModal,
    loadFlowList,
    loadFlowTrackingFields,
    openFlow,
    reloadFlowList,
    editFlow,
    toggleFlowDesigner,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class FlowList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadFlowTrackingFields();
  }
  componentWillReceiveProps(nextProps) {

  }
  msg = formatMsg(this.props.intl)
  flowDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadFlowList(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, tblfilters) => {
      const newfilters = { ...this.state.flowFilter, ...tblfilters[0] };
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.flowList,
  })
  columns = [{
    title: this.msg('流程名称'),
    dataIndex: 'name',
    render: (o, record) => (<EditableCell
      value={record.name}
      cellTrigger={false}
      onSave={name => this.handleFlowNameChange(record.id, name)}
    />),
  }, {
    title: this.msg('关联客户'),
    dataIndex: 'customer',
    render: (o, record) => (record.customer_tenant_id === -1 ?
      <Tooltip title="线下企业" placement="left"><Badge status="default" />{record.customer}</Tooltip> :
      <Tooltip title="线上租户" placement="left"><Badge status="processing" />{record.customer}</Tooltip>),
  }]
  handleTableChange = (pagination, filters, sorter) => {
    const params = {
      pageSize: pagination.pageSize,
      current: pagination.current,
      sorter: {
        field: sorter.field,
        order: sorter.order === 'descend' ? 'DESC' : 'ASC',
      },
    };
    this.props.loadFlowList({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: params.pageSize,
      current: params.current,
    });
  }
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
    this.props.toggleFlowDesigner(true);
    this.props.openFlow(row);
  }
  handleCreateFlow = () => {
    this.props.openCreateFlowModal();
  }
  handleFlowNameChange = (flowid, name) => {
    this.props.editFlow(flowid, { name });
  }
  handleDelReload = () => {
    let current = this.props.flowList.current;
    if (this.props.flowList.data.length === 1 && this.props.flowList.current > 1) {
      current -= 1;
    }
    this.props.loadFlowList({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(this.props.listFilter),
      pageSize: this.props.flowList.pageSize,
      current,
    });
  }
  render() {
    const {
      thisFlow, flowList, loading, designerVisible,
    } = this.props;
    this.flowDataSource.remotes = flowList;
    const toolbarActions = (<Search onSearch={this.handleSearch} style={{ width: 200 }} />);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flowName')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" icon="plus" onClick={this.handleCreateFlow} >{this.msg('createFlow')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <DataTable
            toolbarActions={toolbarActions}
            dataSource={this.flowDataSource}
            columns={this.columns}
            rowClassName={record => (thisFlow && record.id === thisFlow.id ? 'table-row-selected' : '')}
            loading={loading}
            rowKey="id"
            onRow={record => ({
              onDoubleClick: () => { this.handleRowClick(record); },
            })}
          />
        </Content>
        <CreateFlowModal />
        <DockPanel title={thisFlow && thisFlow.name} size="large" visible={designerVisible} onClose={() => this.props.toggleFlowDesigner(false)}>
          <FlowDesigner currentFlow={thisFlow} reloadOnDel={this.handleDelReload} />
        </DockPanel>
      </Layout>
    );
  }
}
