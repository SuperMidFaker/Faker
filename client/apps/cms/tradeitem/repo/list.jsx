import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Icon, Breadcrumb, Button, Layout, Input } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { loadRepos, openAddModal, loadTradeParams } from 'common/reducers/cmsTradeitem';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RowUpdater from 'client/components/rowUpdater';
import Strip from 'client/components/Strip';
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
  }, {
    title: this.msg('库类型'),
    key: 'repo_type',
    render: (o, record) => {
      if (record.mode === 'slave') {
        return (<div><Icon type="link" className="text-success" />从库</div>);
      } else {
        return (<div>主库</div>);
      }
    },
  }, {
    title: this.msg('统计'),
    key: 'repo_stats',
    render: (o, record) =>
      (<Strip overall={1000}
        parts={{ success: record.classified_num, warning: record.pending_num, error: record.unclassified_num }}
        hints={['已归类', '归类待定', '未归类']}
      />),
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OPS_COL',
    width: 100,
    fixed: 'right',
    render: (o, record) => <RowUpdater onHit={this.handleEnter} label={<span>{this.msg('enter')}</span>} row={record} />,
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
                {this.msg('create')}
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
