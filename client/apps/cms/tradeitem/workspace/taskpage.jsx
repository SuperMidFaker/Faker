import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { notification, Card, Breadcrumb, Button, Layout, Tabs } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import EmergeItemTable from './emergeItemTable';
import ConflictItemTable from './conflictItemTable';
import { loadWorkspaceTask, loadTaskEmergeItems, loadTaskConflictItems, submitAudit } from 'common/reducers/cmsTradeitem';
import PageHeader from 'client/components/PageHeader';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    task: state.cmsTradeitem.workspaceTask,
    emergeList: state.cmsTradeitem.taskEmergeList,
    conflictList: state.cmsTradeitem.taskConflictList,
  }),
  { loadWorkspaceTask,
    loadTaskEmergeItems,
    loadTaskConflictItems,
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
    emergeFilter: { taskId: Number(this.props.params.id), status: 'emerge' },
    conflictFilter: { taskId: Number(this.props.params.id), status: 'conflict' },
  }
  componentDidMount() {
    this.props.loadWorkspaceTask(this.props.params.id);
    this.props.loadTaskEmergeItems({
      pageSize: this.props.emergeList.pageSize,
      current: 1,
      filter: JSON.stringify(this.state.emergeFilter),
    });
    this.props.loadTaskConflictItems({
      pageSize: this.props.conflictList.pageSize,
      current: 1,
      filter: JSON.stringify(this.state.conflictFilter),
    });
  }
  msg = formatMsg(this.props.intl)
  handleLocalAudit = () => {
    const taskId = Number(this.props.params.id);
    this.props.submitAudit({ taskId, auditor: 'local' }).then((result) => {
      if (!result.error) {
        if (result.data.feedback === 'submmitted') {
          this.context.router.push('/clearance/tradeitem/workspace/pendings');
        } else if (result.data.feedback === 'reload') {
          const emergeFilter = { taskId, status: 'emerge' };
          const conflictFilter = { taskId, status: 'conflict' };
          this.props.loadTaskEmergeItems({
            pageSize: this.props.emergeList.pageSize,
            current: 1,
            filter: JSON.stringify(emergeFilter),
          });
          this.props.loadTaskConflictItems({
            pageSize: this.props.conflictList.pageSize,
            current: 1,
            filter: JSON.stringify(conflictFilter),
          });
          this.setState({ emergeFilter, conflictFilter });
          notification.info({ title: '提示', description: '部分归类已提交审核' });
        } else {
          this.context.router.goBack();
        }
      }
    });
  }
  handleMasterAudit = () => {
    const taskId = Number(this.props.params.id);
    this.props.submitAudit({ taskId, auditor: 'master' }).then(
      (result) => {
        if (!result.error) {
          if (result.data.feedback === 'reload') {
            const emergeFilter = { taskId, status: 'emerge' };
            const conflictFilter = { taskId, status: 'conflict' };
            this.props.loadTaskEmergeItems({
              pageSize: this.props.emergeList.pageSize,
              current: 1,
              filter: JSON.stringify(emergeFilter),
            });
            this.props.loadTaskConflictItems({
              pageSize: this.props.conflictList.pageSize,
              current: 1,
              filter: JSON.stringify(conflictFilter),
            });
            this.setState({ emergeFilter, conflictFilter });
            notification.info({ title: '提示', description: '部分归类已提交审核' });
          } else {
            this.context.router.goBack();
          }
        }
      });
  }
  render() {
    const { task, emergeList, conflictList } = this.props;
    const { emergeFilter, conflictFilter } = this.state;
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
              {task.master_repo_id && <Button type="primary" icon="save" onClick={this.handleMasterAudit}>提交主库</Button>}
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            <Card hoverable={false}>
              <Tabs defaultActiveKey="emerge">
                <TabPane tab="新物料区" key="emerge">
                  <EmergeItemTable loadEmergeItems={this.props.loadTaskEmergeItems} emergeList={emergeList} listFilter={emergeFilter} />
                </TabPane>
                <TabPane tab="冲突区" key="conflict">
                  <ConflictItemTable loadConflictItems={this.props.loadTaskConflictItems} conflictList={conflictList} listFilter={conflictFilter} />
                </TabPane>
              </Tabs>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

