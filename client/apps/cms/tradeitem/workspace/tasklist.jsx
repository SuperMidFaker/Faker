import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { notification, Badge, Button, Breadcrumb, Layout, Select } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import { loadWorkspaceTasks, delWorkspaceTask } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import RowAction from 'client/components/RowAction';
import ImportDataPanel from 'client/components/ImportDataPanel';
import ModuleMenu from '../menu';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    repos: state.cmsTradeitem.repos.filter(rep => rep.permission === CMS_TRADE_REPO_PERMISSION.edit),
    loading: state.cmsTradeitem.workspaceLoading,
    workspaceTaskList: state.cmsTradeitem.workspaceTaskList,
  }),
  { loadWorkspaceTasks, delWorkspaceTask }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class TradeItemTaskList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    comparisonImportPanel: {
      visible: false,
      endpoint: `${API_ROOTS.default}v1/cms/tradeitem/task/import/comparison`,
      template: `${API_ROOTS.default}v1/cms/tradeitem/task/comparison/comparisonTradeItemModel.xlsx`,
      repo_id: null,
    },
  }
  componentDidMount() {
    this.props.loadWorkspaceTasks();
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '任务ID',
    dataIndex: 'id',
    width: 80,
  }, {
    title: '说明',
    dataIndex: 'title',
  }, {
    title: '新料数',
    dataIndex: 'emerge_count',
    width: 100,
    render: count => <Badge count={count} style={{ backgroundColor: '#52c41a' }} />,
  }, {
    title: '冲突数',
    dataIndex: 'conflict_count',
    width: 100,
    render: count => <Badge count={count} />,
  }, {
    title: this.msg('repoOwner'),
    dataIndex: 'repo_owner_name',
    width: 200,
  }, {
    title: this.msg('repoCreator'),
    dataIndex: 'created_tenant_name',
    width: 200,
  }, {
    title: this.msg('createdDate'),
    dataIndex: 'created_date',
    render: crd => moment(crd).format('YYYY-MM-DD HH'),
    width: 120,
  }, {
    title: this.msg('createdBy'),
    dataIndex: 'created_by',
    width: 100,
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 140,
    fixed: 'right',
    render: (_, record) => (
      <span>
        <RowAction onClick={this.handleRowClick} icon="form" label={this.msg('处理')} row={record} />
        <RowAction confirm={this.msg('deleteConfirm')} onConfirm={this.handleTaskDel} icon="delete" row={record} />
      </span>
    ),
  }]
  handleRowClick = (record) => {
    const link = `/clearance/tradeitem/workspace/task/${record.id}`;
    this.context.router.push(link);
  }
  handleTaskDel = (record) => {
    this.props.delWorkspaceTask(record.id).then((result) => {
      if (!result.error) {
        this.props.loadWorkspaceTasks();
      } else {
        notification.error({ title: '错误',
          description: result.error.message,
        });
      }
    });
  }
  handleRepoSelect = (repoId) => {
    this.props.loadWorkspaceTasks({ repoId });
  }
  handleCompareImportInit = () => {
    this.setState({ comparisonImportPanel: { ...this.state.comparisonImportPanel, visible: true } });
  }
  handleCompareImptRepoSelect = (repoId) => {
    this.setState({ comparisonImportPanel: { ...this.state.comparisonImportPanel, repo_id: repoId } });
  }
  handleCompareImportEnd = () => {
    this.setState({ comparisonImportPanel: { ...this.state.comparisonImportPanel, visible: false, repo_id: null } });
  }
  handleCompareImportUploaded = (resp) => {
    if (resp.existEmerges.length > 0) {
      const warnCopPnos = resp.existEmerges.length > 5 ? `${resp.existEmerges.slice(5).join(',')}等` :
        `${resp.existEmerges.join(',')}`;
      notification.warn({ title: '导入反馈',
        description: `货号${warnCopPnos}已经存在于新物料归类工作区`,
      });
    }
    this.handleCompareImportEnd();
    const taskUrl = '/clearance/tradeitem/workspace/task';
    this.context.router.push(`${taskUrl}/${resp.id}`);
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const { loading, workspaceTaskList, repos } = this.props;
    const { comparisonImportPanel } = this.state;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <Select showSearch placeholder="所属物料库" allowClear style={{ width: 160 }}
        dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }} onChange={this.handleRepoSelect}
      >
        {repos.map(rep => <Option value={rep.id} key={rep.owner_name}>{rep.owner_name}</Option>)}
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
            <ModuleMenu currentKey="task" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('taskList')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" icon="upload" onClick={this.handleCompareImportInit}>{this.msg('newComparisonImport')}</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions}
              selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows} loading={loading}
              columns={this.columns} dataSource={workspaceTaskList} rowSelection={rowSelection} rowKey="id"
            />
          </Content>
          <ImportDataPanel title="对比导入"
            visible={comparisonImportPanel.visible}
            endpoint={comparisonImportPanel.endpoint}
            formData={{ repo_id: comparisonImportPanel.repo_id }}
            onClose={this.handleCompareImportEnd}
            onUploaded={this.handleCompareImportUploaded}
            template={comparisonImportPanel.template}
          >
            <Select showSearch allowClear style={{ width: '100%' }} placeholder="导入物料库必选"
              onChange={this.handleCompareImptRepoSelect}
            >
              {repos.map(rep => <Option value={rep.id} key={rep.owner_name}>{rep.owner_name}</Option>)}
            </Select>
          </ImportDataPanel>
        </Layout>
      </Layout>
    );
  }
}
