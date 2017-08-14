import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Layout } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import NavLink from 'client/components/NavLink';
import Table from 'client/components/remoteAntTable';
import { loadInstalledApps, deleteApp, updateAppStatus } from 'common/reducers/openIntegration';
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
  { loadInstalledApps, deleteApp, updateAppStatus }
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
    title: this.msg('integrationAppType'),
    dataIndex: 'app_type',
    width: 200,
    render: (app) => {
      if (app === 'EASIPASS') {
        return 'EASIPASS EDI';
      } else if (app === 'ARCTM') {
        return 'AmberRoad CTM';
      } else if (app === 'SHFTZ') {
        return '上海自贸区监管系统';
      }
    },
  }, {
    title: this.msg('incomingStatus'),
    dataIndex: 'incoming_status',
    width: 200,
    render: () => '正常',
  }, {
    title: this.msg('outgoingStatus'),
    dataIndex: 'outgoing_status',
    width: 200,
    render: () => '正常',
  }, {
    title: this.msg('opColumn'),
    width: 120,
    render: (txt, row) => {
      if (!row.enabled) {
        return (<span>
          <a onClick={() => this.handleAppEnable(row)}>启用</a>
          <span className="ant-divider" />
          <a onClick={() => this.handleAppDelete(row)}><Icon type="delete" /></a>
        </span>);
      } else {
        let configLink = null;
        if (row.app_type === 'EASIPASS') {
          configLink = <NavLink to={`/hub/integration/easipass/config/${row.uuid}`}>配置</NavLink>;
        } else if (row.app_type === 'ARCTM') {
          configLink = <NavLink to={`/hub/integration/arctm/config/${row.uuid}`}>配置</NavLink>;
        } else if (row.app_type === 'SHFTZ') {
          configLink = <NavLink to={`/hub/integration/shftz/config/${row.uuid}`}>配置</NavLink>;
        }
        return (<span>
          {configLink}
          <span className="ant-divider" />
          <a onClick={() => this.handleAppDisable(row)}>停用</a>
        </span>);
      }
    },
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadInstalledApps(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
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
  handleAppDelete = (row) => {
    this.props.deleteApp(row.uuid).then((result) => {
      if (!result.error) {
        this.props.loadInstalledApps({
          tenantId: this.props.tenantId,
          pageSize: this.props.applist.pageSize,
          current: 1,
          filter: JSON.stringify(this.props.listFilter),
          sorter: JSON.stringify(this.props.sortFilter),
        });
      }
    });
  }
  handleAppEnable = (row) => {
    this.props.updateAppStatus({ uuid: row.uuid, enabled: true }).then((result) => {
      if (!result.error) {
        this.props.loadInstalledApps({
          tenantId: this.props.tenantId,
          pageSize: this.props.applist.pageSize,
          current: this.props.applist.current,
          filter: JSON.stringify(this.props.listFilter),
          sorter: JSON.stringify(this.props.sortFilter),
        });
      }
    });
  }
  handleAppDisable = (row) => {
    this.props.updateAppStatus({ uuid: row.uuid, enabled: false }).then((result) => {
      if (!result.error) {
        this.props.loadInstalledApps({
          tenantId: this.props.tenantId,
          pageSize: this.props.applist.pageSize,
          current: this.props.applist.current,
          filter: JSON.stringify(this.props.listFilter),
          sorter: JSON.stringify(this.props.sortFilter),
        });
      }
    });
  }
  render() {
    const { loading, applist } = this.props;
    this.dataSource.remotes = applist;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> {this.msg('integration')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content">
          <QueueAnim type="right">
            <div className="page-body" key="body">
              <div className="panel-body table-panel table-fixed-layout">
                <Table columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="id" />
              </div>
            </div>
          </QueueAnim>
        </Content>
      </div>
    );
  }
}
