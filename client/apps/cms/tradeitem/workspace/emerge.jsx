import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { notification, Button, Breadcrumb, Layout } from 'antd';
import EmergeItemTable from './emergeItemTable';
import PageHeader from 'client/components/PageHeader';
import { loadWorkspaceItems, submitAudit } from 'common/reducers/cmsTradeitem';
import connectNav from 'client/common/decorators/connect-nav';
import ModuleMenu from '../menu';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;

@injectIntl
@connect(
  state => ({
    submitting: state.cmsTradeitem.submitting,
    workspaceItemList: state.cmsTradeitem.workspaceItemList,
    emergeStat: state.cmsTradeitem.workspaceStat.emerge,
  }),
  { loadWorkspaceItems, submitAudit }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class NewItemsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    filter: { status: 'emerge' },
  }
  componentDidMount() {
    this.props.loadWorkspaceItems({
      pageSize: this.props.workspaceItemList.pageSize,
      current: 1,
      filter: JSON.stringify(this.state.filter),
    });
  }
  msg = formatMsg(this.props.intl)
  handleLocalAudit = () => {
    this.props.submitAudit({ auditor: 'local', status: 'emerge' }).then((result) => {
      if (!result.error) {
        if (result.data.feedback === 'submmitted') {
          this.context.router.push('/clearance/tradeitem/workspace/pendings');
        } else if (result.data.feedback === 'reload') {
          const filter = { status: 'emerge' };
          this.props.loadWorkspaceItems({
            pageSize: this.props.workspaceItemList.pageSize,
            current: 1,
            filter: JSON.stringify(this.state.filter),
          });
          this.setState({ filter });
          notification.info({ title: '提示', description: '归类已提交审核' });
        } else if (result.data.feedback === 'noop') {
          notification.info({ title: '提示', description: '没有归类可提交审核' });
        }
      }
    });
  }
  handleMasterAudit = () => {
    this.props.submitAudit({ auditor: 'master', status: 'emerge' }).then(
      (result) => {
        if (!result.error) {
          if (result.data.feedback === 'reload') {
            const filter = { status: 'emerge' };
            this.props.loadWorkspaceItems({
              pageSize: this.props.workspaceItemList.pageSize,
              current: 1,
              filter: JSON.stringify(this.state.filter),
            });
            this.setState({ filter });
            notification.info({ title: '提示', description: '归类已提交审核' });
          } else if (result.data.feedback === 'noop') {
            notification.info({ title: '提示', description: '没有归类可提交主库审核' });
          }
        }
      });
  }
  render() {
    const { workspaceItemList, emergeStat, submitting } = this.props;
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
            <ModuleMenu currentKey="emerge" />
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
              {emergeStat.master && <Button type="primary" ghost icon="cloud-upload-o" loading={submitting} onClick={this.handleMasterAudit}>提交主库</Button>}
              <Button type="primary" icon="arrow-up" onClick={this.handleLocalAudit} loading={submitting}>提交审核</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <EmergeItemTable loadEmergeItems={this.props.loadWorkspaceItems} emergeList={workspaceItemList}
              listFilter={this.state.filter} withRepo
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
