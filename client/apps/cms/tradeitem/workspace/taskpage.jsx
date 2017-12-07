import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Popconfirm, Icon, notification, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import DataTable from 'client/components/DataTable';
import NavLink from 'client/components/NavLink';
import { loadWorkspaceTask, loadTaskEmergeItems, loadTaskConflictItems, delWorkspaceItem, resolveWorkspaceItem,
  submitAudit } from 'common/reducers/cmsTradeitem';
import PageHeader from 'client/components/PageHeader';
import RowUpdater from 'client/components/rowUpdater';
import makeColumns from './commonCols';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    loading: state.cmsTradeitem.workspaceLoading,
    task: state.cmsTradeitem.workspaceTask,
    emergeList: state.cmsTradeitem.taskEmergeList,
    conflictList: state.cmsTradeitem.taskConflictList,
    units: state.cmsTradeitem.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    currencies: state.cmsTradeitem.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
    tradeCountries: state.cmsTradeitem.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
  }),
  { loadWorkspaceTask,
    loadTaskEmergeItems,
    loadTaskConflictItems,
    delWorkspaceItem,
    resolveWorkspaceItem,
    submitAudit,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class TaskPage extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    task: PropTypes.shape({
      title: PropTypes.string,
      master_repo_id: PropTypes.number,
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    emergeSelRowKeys: [],
    emergeSelRows: [],
    conflictSelRowKeys: [],
    conflictSelRows: [],
    emergeFilter: { taskId: this.props.params.id, status: 'emerge' },
    conflictFilter: { taskId: this.props.params.id, status: 'conflict' },
  }
    /* componentWillMount() {
    const emergeFilter = { ...this.emergeFilter };
    emergeFilter.taskId = this.props.params.id;
    const conflictFilter = { ...this.conflictFilter };
    conflictFilter.taskId = this.props.params.id;
    this.setState({ emergeFilter, conflictFilter });
  } */
  componentDidMount() {
    this.props.loadWorkspaceTask(this.props.params.id);
    this.props.loadTaskConflictItems({
      pageSize: this.props.emergeList.pageSize,
      current: 1,
      filter: JSON.stringify(this.state.emergeFilter),
    });
    this.props.loadTaskEmergeItems({
      pageSize: this.props.conflictList.pageSize,
      current: 1,
      filter: JSON.stringify(this.state.conflictFilter),
    });
  }
  msg = formatMsg(this.props.intl)
  emergeDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadTaskEmergeItems(params),
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
      const newfilters = { ...this.state.emergeFilter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.emergeList,
  })
  conflictDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadTaskConflictItems(params),
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
      const newfilters = { ...this.state.conflictFilter, ...tblfilters[0] };
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        filter: JSON.stringify(newfilters),
      };
      return params;
    },
    remotes: this.props.emergeList,
  })
  emergeColumns = makeColumns({ msg: this.msg,
    units: this.props.units,
    tradeCountries: this.props.tradeCountries,
    currencies: this.props.currencies,
    withRepoItem: true,
  }).concat({
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (_, record) => {
      const itemUrl = '/clearance/tradeitem/workspace/item/edit';
      return (<span>
        <NavLink to={`${itemUrl}/${record.id}`}><Icon type="edit" /> {this.msg('modify')}</NavLink>
        <span className="ant-divider" />
        <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id, 'emerge')}>
          <a role="presentation"><Icon type="delete" /></a>
        </Popconfirm>
      </span>);
    },
  })
  conflictColumns = makeColumns({ msg: this.msg,
    units: this.props.units,
    tradeCountries: this.props.tradeCountries,
    currencies: this.props.currencies,
    withRepoItem: true,
  }).concat([{
    title: '解决状态',
    dataIndex: 'status',
    width: 100,
    fixed: 'right',
    render: (resolved) => {
      if (resolved === 2) {
        return '标准项';
      } else if (resolved === 3) {
        return '非标准项';
      } else if (resolved === 4) {
        return '新来源';
      }
    },
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 200,
    fixed: 'right',
    render: (_, record) => {
      const itemUrl = '/clearance/tradeitem/workspace/item/edit';
      const spanElms = [];
      if (record.classified && record.status === 1) {
        spanElms.push(
          <RowUpdater key="standard" onHit={this.handleConflictResolve} label={<Icon type="star-o" />}
            row={record}
            tooltip="设为标准"
          />,
          <span className="ant-divider" key="standard-div" />
        );
        if (!record.duplicate) {
          spanElms.push(
            <RowUpdater key="stage" onHit={this.handleConflictResolve} label={<Icon type="fork" />}
              row={record} tooltip="标志为新来源"
            />,
            <span className="ant-divider" key="stage-div" />
        );
        }
      }
      return (<span>
        <NavLink to={`${itemUrl}/${record.id}`}><Icon type="edit" /> {this.msg('modify')}</NavLink>
        <span className="ant-divider" />
        {spanElms}
        <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id, 'conflict')}>
          <a role="presentation"><Icon type="delete" /></a>
        </Popconfirm>
      </span>);
    },
  }])
  handleItemDel = (itemId, key) => {
    this.props.delWorkspaceItem([itemId]).then((result) => {
      if (!result.error) {
        if (key === 'emerge') {
          this.props.loadTaskEmergeItems({
            pageSize: this.props.conflictList.pageSize,
            current: this.props.conflictList.current,
            filter: JSON.stringify(this.state.emergeFilter),
          });
        } else {
          this.props.loadTaskConflictItems({
            pageSize: this.props.conflictList.pageSize,
            current: this.props.conflictList.current,
            filter: JSON.stringify(this.state.conflictFilter),
          });
        }
      } else {
        notification.error({ title: 'Error', description: result.error.message });
      }
    });
  }
  handleConflictResolve = (item, index, extra) => {
    this.props.resolveWorkspaceItem([item.id], extra.key).then((result) => {
      if (!result.error) {
        this.props.loadTaskConflictItems({
          pageSize: this.props.conflictList.pageSize,
          current: this.props.conflictList.current,
          filter: JSON.stringify(this.state.conflictFilter),
        });
      } else {
        notification.error({ title: 'Error', description: result.error.message });
      }
    });
  }
  handleLocalAudit = () => {
    this.props.submitAudit({ taskId: this.props.params.id, auditor: 'local' });
  }
  handleMasterAudit = () => {
    this.props.submitAudit({ taskId: this.props.params.id, auditor: 'master' });
  }
  handleTabChange = (tabKey) => {
    if (tabKey === 'attachedDocs') {
      this.props.loadDocuDatas({ billSeqNo: this.props.billHead.bill_seq_no });
    }
  }
  handleRowDeselect= (key) => {
    if (key === 'emerge') {
      this.setState({ emergeSelRows: [], emergeSelRowKeys: [] });
    } else {
      this.setState({ conflictSelRows: [], conflictSelRowKeys: [] });
    }
  }
  render() {
    const { loading, task, emergeList, conflictList } = this.props;
    const { emergeSelRowKeys, emergeSelRows, conflictSelRowKeys, conflictSelRows } = this.state;
    this.emergeDataSource.remotes = emergeList;
    this.conflictDataSource.remotes = conflictList;
    return (
      <Layout>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {task.repo_owner_name}
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {task.title}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" icon="save" onClick={this.handleLocalAudit}>提交审核</Button>
              {task.master_repo_id && <Button type="primary" icon="save" onClick={this.handleMasterAudit}>提交主库审核</Button>}
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            <Tabs defaultActiveKey="emerge">
              <TabPane tab="新物料区" key="emerge">
                <DataTable selectedRowKeys={emergeSelRowKeys} handleDeselectRows={() => this.handleRowDeselect('emerge')} loading={loading}
                  columns={this.emergeColumns} dataSource={this.emergeDataSource} rowSelection={emergeSelRows} rowKey="id"
                  locale={{ emptyText: '当前没有新的料件' }}
                />
              </TabPane>
              <TabPane tab="冲突区" key="conflict">
                <DataTable selectedRowKeys={conflictSelRowKeys} handleDeselectRows={() => this.handleRowDeselect('conflict')} loading={loading}
                  columns={this.conflictColumns} dataSource={this.conflictDataSource} rowSelection={conflictSelRows} rowKey="id"
                  locale={{ emptyText: '当前没有新的料件' }}
                />
              </TabPane>
            </Tabs>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

