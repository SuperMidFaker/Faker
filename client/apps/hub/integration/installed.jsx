import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar, Badge, Breadcrumb, Card, Icon, Layout, List } from 'antd';
import PageHeader from 'client/components/PageHeader';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import RowAction from 'client/components/RowAction';
import SearchBox from 'client/components/SearchBox';
import { loadInstalledApps, deleteApp, updateAppStatus } from 'common/reducers/openIntegration';
import HubSiderMenu from '../menu';
import { formatMsg } from './message.i18n';

const { Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadInstalledApps({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.openIntegration.listFilter),
    sorter: JSON.stringify(state.openIntegration.sortFilter),
    pageSize: state.openIntegration.installedAppsList.pageSize,
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
    installedAppsList: state.openIntegration.installedAppsList,
  }),
  { loadInstalledApps, deleteApp, updateAppStatus }
)
export default class InstalledAppsList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  }]
  handleAppConfig = (row) => {
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
    const link = `/hub/integration/${appType}/config/${row.uuid}`;
    this.context.router.push(link);
  }
  handleSearch = () => {

  }
  renderAppLogo(app) {
    if (app.app_type === 'EASIPASS') {
      return <Avatar shape="square" style={{ backgroundColor: '#008dff' }}>EP</Avatar>;
    } else if (app.app_type === 'ARCTM') {
      return <Avatar shape="square" style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>AmberRoad</Avatar>;
    } else if (app.app_type === 'SHFTZ') {
      return <Avatar shape="square" style={{ backgroundColor: '#00a2ae' }}>FTZ</Avatar>;
    } else if (app.app_type === 'SFEXPRESS') {
      return <Avatar shape="square" style={{ backgroundColor: '#292929' }}>SF</Avatar>;
    } else if (app.app_type === 'SW') {
      return <Avatar shape="square" style={{ backgroundColor: '#f56a00' }}>SW</Avatar>;
    } else if (app.app_type === 'QP') {
      return <Avatar shape="square" style={{ backgroundColor: '#7265e6' }}>QP</Avatar>;
    }
    return <Avatar shape="square">{this.msg('unknownApp')}</Avatar>;
  }
  render() {
    const { installedAppsList } = this.props;
    const pagination = {
      pageSize: installedAppsList.pageSize,
      current: installedAppsList.current,
      total: installedAppsList.totalCount,
      showTotal: total => `共 ${total} 条`,
      onChange: (page) => {
        this.props.loadInstalledApps({
          tenantId: this.props.tenantId,
          filter: JSON.stringify(this.props.listFilter),
          sorter: JSON.stringify(this.props.sortFilter),
          pageSize: installedAppsList.pageSize,
          current: page,
        });
      },
    };
    return (
      <Layout>
        <HubSiderMenu currentKey="installed" />
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Icon type="api" /> {this.msg('installedApps')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
          </PageHeader>
          <Content className="page-content layout-fixed-width">
            <Card bodyStyle={{ padding: 16 }} >
              <List
                dataSource={installedAppsList.data}
                header={<SearchBox placeholder={this.msg('searchTip')} onSearch={this.handleSearch} />}
                pagination={pagination}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[<RowAction onClick={() => this.handleAppConfig(item)} icon="setting" label={this.msg('config')} />]}
                  >
                    <List.Item.Meta
                      avatar={this.renderAppLogo(item)}
                      title={item.name}
                      description={item.desc}
                    />
                    {item.enabled === 1 ? <Badge status="success" text={this.msg('appEnabled')} /> : <Badge status="default" text={this.msg('appDisabled')} />}
                  </List.Item>
                  )}
              />
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
