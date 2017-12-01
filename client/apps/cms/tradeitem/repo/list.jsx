import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Badge, Breadcrumb, Button, Dropdown, Menu, Layout, Icon, Input, Tag } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadRepos, openAddModal, loadTradeParams } from 'common/reducers/cmsTradeitem';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowUpdater from 'client/components/rowUpdater';
import ModuleMenu from '../menu';
import { formatMsg } from '../message.i18n';

const { Sider, Content } = Layout;
const Search = Input.Search;

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadRepos({
    tenantId: state.account.tenantId,
  })));
  promises.push(dispatch(loadTradeParams()));
  return Promise.all(promises);
}
@injectIntl
@connectFetch()(fetchData)
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    repos: state.cmsTradeitem.repos,
    visibleAddModal: state.cmsTradeitem.visibleAddModal,
    repo: state.cmsTradeitem.repo,
    reposLoading: state.cmsTradeitem.reposLoading,
  }),
  { loadRepos, openAddModal, loadTradeParams }
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
    repo: [],
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ repos: nextProps.repos });
  }
  msg = formatMsg(this.props.intl);
  repoColumns = [{
    title: this.msg('所属企业'),
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
    title: this.msg('使用权限'),
    dataIndex: 'permission',
    width: 150,
    render: (o) => {
      if (o === 'view') {
        return (<Tag>只读</Tag>);
      } else if (o === 'edit') {
        return (<Tag color="blue">可读写</Tag>);
      }
    },
  }, {
    title: this.msg('料件总数量'),
    dataIndex: 'classified_num',
    width: 150,
  }, {
    title: this.msg('状态'),
    dataIndex: 'status',
    width: 150,
    render: (o) => {
      switch (o) {
        case 0:
          return <Badge status="default" text="停止" />;
        default:
          return <Badge status="processing" text="运行中" />;
      }
    },
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
    render: (o, record) => {
      const menu = (
        <Menu>
          <Menu.Item key="0">
            <a >授权使用单位</a>
          </Menu.Item>
          <Menu.Item key="1">
            <a >切换库模式</a>
          </Menu.Item>
        </Menu>
      );
      return (<span>
        <RowUpdater onHit={this.handleEnter} label={<span>{this.msg('manageItems')}</span>} row={record} />
        <span className="ant-divider" />
        <Dropdown overlay={menu} trigger={['click']}>
          <a className="ant-dropdown-link">
          配置 <Icon type="down" />
          </a>
        </Dropdown>
      </span>);
    },
  },
  ];
  handleEnter = (record) => {
    const link = `/clearance/tradeitem/repo/${record.id}`;
    this.context.router.push(link);
  }

  render() {
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
              <Button type="primary" icon="plus" onClick={this.handleAddOwener} >
                {this.msg('addRepo')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content" key="main">
            <DataTable toolbarActions={toolbarActions} dataSource={this.state.repos} columns={this.repoColumns}
              rowKey="id" loading={this.props.reposLoading}
            />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
