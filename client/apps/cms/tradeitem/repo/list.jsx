import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Switch, Breadcrumb, Button, Icon, Menu, Modal, Layout, Tag, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadRepos, openAddModal, switchRepoMode, switchRepoVersionKeep, showLinkSlaveModal, unlinkMasterSlave } from 'common/reducers/cmsTradeitem';
import { loadCustomers } from 'common/reducers/sofCustomers';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import { CMS_TRADE_REPO_PERMISSION } from 'common/constants';
import ModuleMenu from '../menu';
import AddRepoModal from './modal/addRepoModal';
import RepoUsersCard from './modal/repoUserCard';
import LinkSlaveModal from './modal/linkSlaveModal';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    repos: state.cmsTradeitem.repos,
    reposLoading: state.cmsTradeitem.reposLoading,
  }),
  {
    loadRepos,
    openAddModal,
    switchRepoMode,
    switchRepoVersionKeep,
    showLinkSlaveModal,
    unlinkMasterSlave,
    loadCustomers,
  }
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
    filter: { name: '' },
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
    width: 100,
    render: (o, record) => {
      if (o === 'slave') {
        return (<Tag color="#2db7f5">从库 {record.master_repo_id ? <Icon type="link" /> : <Icon type="disconnect" />}</Tag>);
      } else if (o === 'master') {
        return (<Tag color="#108ee9">主库</Tag>);
      } else if (o === 'single') {
        return (<Tag color="cyan">单库</Tag>);
      }
      return null;
    },
  }, {
    title: <Tooltip title="启用保留HS编码或名称修改历史版本,用于出库申报"><Icon type="clock-circle-o" /></Tooltip>,
    dataIndex: 'keep_version',
    width: 100,
    align: 'center',
    render: (keep, repo) => {
      if (repo.permission === CMS_TRADE_REPO_PERMISSION.edit) {
        return (<Switch
          size="small"
          checked={keep}
          disabled={repo.master_repo_id}
          onChange={checked => this.handleVersionKeepChange(repo.id, checked)}
        />);
      }
      return null;
    },
  }, {
    title: this.msg('repoCreator'),
    dataIndex: 'creator_name',
    width: 200,
  }, {
    title: this.msg('使用权限'),
    dataIndex: 'permission',
    width: 150,
    render: (perm, record) => {
      if (perm === CMS_TRADE_REPO_PERMISSION.edit) {
        return record.creator_tenant_id === this.props.tenantId ? (<Tag color="green">完全控制</Tag>) : (<Tag color="blue">可读写</Tag>);
      } // CMS_TRADE_REPO_PERMISSION.view OR slave repo(null)
      return (<Tag>只读</Tag>);
    },
  }, {
    title: this.msg('商品数量'),
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
      const menuItems = [];
      if (creator) {
        menuItems.push(<Menu.Item key="auth">
          <a onClick={() => this.handleRepoUserAuth(repo)}>授权使用单位</a>
        </Menu.Item>);
        let masterSlaveLinked = false;
        if (repo.mode === 'slave' && repo.master_repo_id) {
          masterSlaveLinked = true;
        } else if (repo.mode === 'master' && repo.children) {
          masterSlaveLinked = true;
        }
        if (!masterSlaveLinked) {
          menuItems.push(<Menu.Item key="reposwitch">
            <a onClick={() => this.handleRepoModeSwitch(repo)}>切换库模式</a>
          </Menu.Item>);
        }
        if (repo.mode === 'master') {
          menuItems.push(<Menu.Item key="addslave">
            <a onClick={() => this.handleLinkSlave(repo)}>关联从库</a>
          </Menu.Item>);
        }
      } else if (repo.owner_tenant_id === this.props.tenantId) {
        menuItems.push(<Menu.Item key="remslave">
          <a onClick={() => this.handleUnlinkSlave(repo.id)}>删除关联</a>
        </Menu.Item>);
      }
      let menu;
      if (menuItems.length > 0) {
        menu = (<Menu>{menuItems}</Menu>);
      }
      return (<span>
        <RowAction onClick={this.handleEnter} icon="folder" label={this.msg('manageData')} row={repo} />
        {menu && <RowAction overlay={menu} />}
      </span>);
    },
  },
  ];
  handleEnter = (record) => {
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
    const self = this;
    const targetMode = repo.mode === 'single' ? '主从库模式' : '单库模式';
    Modal.confirm({
      title: `确定切换为【${targetMode}】?`,
      onOk() {
        self.props.switchRepoMode(repo.id);
      },
      onCancel() {
      },
    });
  }
  handleVersionKeepChange = (repoId, keep) => {
    this.props.switchRepoVersionKeep(repoId, keep);
  }
  handleAddRepo = () => {
    this.props.loadCustomers();
    this.props.openAddModal();
  }
  handleLinkSlave = (masterRepo) => {
    this.props.showLinkSlaveModal({ masterRepo, visible: true });
  }
  handleUnlinkSlave = (slaveRepo) => {
    this.props.unlinkMasterSlave(slaveRepo).then((result) => {
      if (!result.error) {
        this.handleRepoReload();
      }
    });
  }
  handleRepoReload = () => {
    this.props.loadRepos();
  }
  handleRepoSearch = (ownerName) => {
    const filter = { ...this.state.filter, name: ownerName };
    this.setState({ filter });
  }
  render() {
    const { reposLoading } = this.props;
    const { authAction, filter } = this.state;
    const repos = this.props.repos.filter(rep =>
      !filter.name || new RegExp(filter.name).test(rep.owner_name));
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('searchRepoPlaceholder')} onSearch={this.handleRepoSearch} />
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
            <DataTable
              toolbarActions={toolbarActions}
              dataSource={repos}
              columns={this.repoColumns}
              rowKey="id"
              loading={reposLoading}
            />
          </Content>
          <AddRepoModal />
          <Modal
            title="授权使用单位"
            visible={authAction.doing}
            maskClosable={false}
            footer={[]}
            onCancel={this.handleAuthAcOk}
          >
            <RepoUsersCard repo={authAction.repo} />
          </Modal>
          <LinkSlaveModal reload={this.handleRepoReload} />
        </Layout>
      </Layout>
    );
  }
}
