import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Dropdown, Menu, Modal, Layout, Icon, Input, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { openAddModal, switchRepoMode, setRepo } from 'common/reducers/cmsTradeitem';
import { loadCustomers } from 'common/reducers/crmCustomers';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowUpdater from 'client/components/rowUpdater';
import ModuleMenu from '../menu';
import AddRepoModal from './modal/addRepoModal';
import RepoUsersCard from './modal/repoUserCard';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    repos: state.cmsTradeitem.repos,
    reposLoading: state.cmsTradeitem.reposLoading,
  }),
  { openAddModal, switchRepoMode, setRepo, loadCustomers }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class RepoList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    authAction: { repo: {}, doing: false },
  }
  msg = formatMsg(this.props.intl);
  repoColumns = [{
    title: this.msg('repoOwner'),
    dataIndex: 'owner_name',
    key: 'owner_name',
    width: 300,
  }, {
    title: this.msg('库模式'),
    dataIndex: 'mode',
    width: 150,
    render: (o) => {
      if (o === 'slave') {
        return (<Tag>从库</Tag>);
      } else if (o === 'master') {
        return (<Tag color="blue">主库</Tag>);
      } else if (o === 'single') {
        return (<Tag color="green">独立单库</Tag>);
      }
    },
  }, {
    title: this.msg('repoCreator'),
    dataIndex: 'creator_name',
    width: 200,
  }, {
    title: this.msg('使用权限'),
    dataIndex: 'permission',
    width: 150,
    render: (perm) => {
      if (perm === CMS_TRADE_REPO_PERMISSION.view) {
        return (<Tag>只读</Tag>);
      } else if (perm === CMS_TRADE_REPO_PERMISSION.edit) {
        return (<Tag color="blue">可读写</Tag>);
      }
    },
  }, {
    title: this.msg('料件总数量'),
    dataIndex: 'classified_num',
    width: 150,
  }, {
    title: this.msg('最后更新时间'),
    dataIndex: 'last_modified_date',
    render: (o, record) => record.last_modified_date && moment(record.last_modified_date).format('YYYY.MM.DD HH:mm'),
  }, {
    title: this.msg('创建日期'),
    dataIndex: 'created_date',
    render: (o, record) => record.created_date && moment(record.created_date).format('YYYY.MM.DD'),
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 150,
    fixed: 'right',
    render: (_, repo) => {
      const creator = repo.creator_tenant_id === this.props.tenantId;
      let menu;
      if (creator) {
        menu = (
          <Menu>
            <Menu.Item key="0">
              <a onClick={() => this.handleRepoUserAuth(repo)}>授权使用单位</a>
            </Menu.Item>
            <Menu.Item key="1">
              <a onClick={() => this.handleRepoModeSwitch(repo)}>切换库模式</a>
            </Menu.Item>
          </Menu>);
      }
      return (<span>
        <RowUpdater onClick={this.handleEnter} label={<span>{this.msg('manageItems')}</span>} row={repo} />
        {creator && <span className="ant-divider" />}
        {creator && <Dropdown overlay={menu} trigger={['click']}>
          <a className="ant-dropdown-link">
          配置 <Icon type="down" />
          </a>
        </Dropdown>}
      </span>);
    },
  },
  ];
  handleEnter = (record) => {
    this.props.setRepo(record);
    const link = `/clearance/tradeitem/repo/${record.id}`;
    this.context.router.push(link);
  }
  handleRepoUserAuth = (authRepo) => {
    this.setState({ authAction: { doing: true, repo: authRepo } });
  }
  handleAuthAcOk = () => {
    this.setState({ authAction: { doing: false, repo: {} } });
  }
  handleRepoModeSwitch = (repo) => {
    this.props.switchRepoMode(repo.id);
  }
  handleAddRepo = () => {
    this.props.loadCustomers();
    this.props.openAddModal();
  }
  render() {
    const { repos, reposLoading } = this.props;
    const { authAction } = this.state;
    const toolbarActions = (<span>
      <Search style={{ width: 200 }} placeholder={this.msg('searchRepoPlaceholder')} onSearch={this.handleRepoSearch} />
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
            <ModuleMenu currentKey="repoList" />
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('repoList')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleAddRepo} >
                {this.msg('addRepo')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions} dataSource={repos} columns={this.repoColumns}
              rowKey="id" loading={reposLoading}
            />
          </Content>
          <AddRepoModal />
          <Modal visible={authAction.doing} maskClosable={false} footer={[]}
            onCancel={this.handleAuthAcOk}
          >
            <RepoUsersCard repo={authAction.repo} />
          </Modal>
        </Layout>
      </Layout>
    );
  }
}
