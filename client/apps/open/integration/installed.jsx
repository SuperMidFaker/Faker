import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import NavLink from 'client/components/nav-link';
import Table from 'client/components/remoteAntTable';
import { loadInstalledApps } from 'common/reducers/openIntegration';
import { formatMsg } from './message.i18n';

const { Header, Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadInstalledApps({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.openIntegration.listFilter),
    sorter: JSON.stringify(state.openIntegration.sortFilter),
    pageSize: state.openIntegration.list.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    listFilter: state.openIntegration.listFilter,
    sortFilter: state.openIntegration.sortFilter,
    tenantId: state.account.tenantId,
    applist: state.openIntegration.list,
  }),
)

export default class InstalledAppsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('integrationName'),
    dataIndex: 'name',
    width: 200,
  }, {
    title: this.msg('integrationApp'),
    dataIndex: 'app_type',
    width: 200,
  }, {
    title: 'scope',
    width: 400,
    dataIndex: 'scope',
  }, {
    title: this.msg('incomingStatus'),
    dataIndex: 'incoming_status',
    width: 200,
  }, {
    title: this.msg('outgoingStatus'),
    dataIndex: 'outgoing_status',
    width: 200,
  }, {
    title: this.msg('opColumn'),
    width: 120,
    render: () => (
      <span>
        <NavLink to="/open/integration/arctm/config/asdasfasdfadfsaf">配置</NavLink>
        <span className="ant-divider" />
        <a href="#">停用</a>
        <span className="ant-divider" />
        <a href="#"><Icon type="delete" /></a>
      </span>
    ),
  }];
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadInstalledApps(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: false,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: JSON.stringify({
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        }),
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.applist,
  })
  render() {
    const { loading, applist } = this.props;
    this.dataSource.remotes = applist;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> 应用整合
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              已安装应用
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools" />
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.dataSource} loading={loading}
                rowKey="id"
              />
            </div>
          </div>
        </Content>
      </div>
    );
  }
}
