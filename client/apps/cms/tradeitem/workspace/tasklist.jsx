import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Breadcrumb, Layout, Popconfirm, Icon, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import { loadWorkspaceTasks } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import ModuleMenu from '../menu';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repos: state.cmsTradeitem.repos.filter(rep => rep.permission === CMS_TRADE_REPO_PERMISSION.edit),
    loading: state.cmsTradeitem.workspaceLoading,
    workspaceTaskList: state.cmsTradeitem.workspaceTaskList,
  }),
  { loadWorkspaceTasks }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class TradeItemTaskList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    filter: { repoId: '' },
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '任务ID',
    dataIndex: 'id',
    width: 150,
  }, {
    title: '说明',
    dataIndex: 'desc',
  }, {
    title: '新料数',
    dataIndex: 'emerge_count',
    width: 100,
  }, {
    title: '冲突数',
    dataIndex: 'conflict_count',
    width: 100,
  }, {
    title: this.msg('repoOwner'),
    dataIndex: 'repo_owner_name',
    width: 300,
  }, {
    title: this.msg('repoCreator'),
    dataIndex: 'repo_creator_name',
    width: 300,
  }, {
    title: this.msg('createdDate'),
    dataIndex: 'created_date',
    render: crd => moment(crd).format('YYYY-MM-DD HH'),
    width: 200,
  }, {
    title: this.msg('createdBy'),
    dataIndex: 'created_by',
    width: 200,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (_, task) => {
      const taskUrl = '/clearance/tradeitem/workspace/task';
      return (
        <span>
          <a href={`${taskUrl}/${task.id}`} target="_blank" rel="noopener noreferrer">处理</a>
          <span className="ant-divider" />
          <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleTaskDel(task.id)}>
            <a role="presentation"><Icon type="delete" /></a>
          </Popconfirm>
        </span>
      );
    },
  }]
  handleRepoSelect = (repoId) => {
    this.props.loadWorkspaceTasks({ repoId });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading, workspaceTaskList, repos } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <Select showSearch placeholder="所属物料库" optionFilterProp="children" style={{ width: 160 }}
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }} onChange={this.handleRepoSelect}
      >
        {repos.map(rep => <Option value={rep.id}>{rep.owner_name}</Option>)}
      </Select>
    </span>);
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('tradeitem')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <ModuleMenu currentKey="new" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('taskNew')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button icon="file-excel">导出</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows} loading={loading}
              columns={this.columns} dataSource={workspaceTaskList} rowSelection={rowSelection} rowKey="id"
              locale={{ emptyText: '当前没有新的料件' }}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
