import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Layout } from 'antd';
import PageHeader from 'client/components/PageHeader';
import DataTable from 'client/components/DataTable';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import RowAction from 'client/components/RowAction';
import { loadInstalledApps, deleteApp, updateAppStatus } from 'common/reducers/openIntegration';
import { formatMsg } from './message.i18n';

const { Content } = Layout;

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
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  columns = [{
    title: this.msg('integrationName'),
    dataIndex: 'name',
    width: 400,
  }, {
    title: this.msg('integrationAppType'),
    dataIndex: 'app_type',
    render: (app) => {
      if (app === 'EASIPASS') {
        return 'EASIPASS EDI';
      } else if (app === 'ARCTM') {
        return 'AmberRoad CTM';
      } else if (app === 'SHFTZ') {
        return '上海自贸区监管系统';
      } else if (app === 'SFEXPRESS') {
        return '顺丰快递';
      }
      return <span />;
    },
  }, {
    title: this.msg('opColumn'),
    dataIndex: 'OP_COL',
    width: 160,
    render: (txt, row) => {
      let appType = null;
      if (row.app_type === 'EASIPASS') {
        appType = 'easipass';
      } else if (row.app_type === 'ARCTM') {
        appType = 'arctm';
      } else if (row.app_type === 'SHFTZ') {
        appType = 'shftz';
      } else if (row.app_type === 'SFEXPRESS') {
        appType = 'sfexpress';
      }
      return (<span>
        <RowAction onClick={() => this.handleAppConfig(row, appType)} icon="setting" label="配置" />
        {row.enabled ? <RowAction onClick={this.handleAppDisable} icon="pause-circle" tooltip="停用" row={row} /> :
        <RowAction onClick={this.handleAppEnable} icon="play-circle" tooltip="启用" row={row} />}
        <RowAction confirm="确定删除？" onConfirm={this.handleAppDelete} icon="delete" row={row} />
      </span>);
    },
  }]
  dataSource = new DataTable.DataSource({
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
  handleAppConfig = (row, appType) => {
    const link = `/hub/integration/${appType}/config/${row.uuid}`;
    this.context.router.push(link);
  }
  render() {
    const { loading, applist } = this.props;
    this.dataSource.remotes = applist;
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="appstore-o" /> {this.msg('integration')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <DataTable columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="id" />
        </Content>
      </div>
    );
  }
}
