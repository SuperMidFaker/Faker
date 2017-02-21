import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Breadcrumb, Button, Icon, Layout, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
  }),
)

export default class WebhookList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: '',
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleCancel = () => {
    this.context.router.goBack();
  }
  columns = [{
    title: this.msg('webhookName'),
    dataIndex: 'webhook_name',
    width: 400,
  }, {
    title: this.msg('scope'),
    width: 400,
    dataIndex: 'scope',
  }, {
    title: this.msg('targetUrl'),
    dataIndex: 'target_url',
  }, {
    title: this.msg('opColumn'),
    width: 160,
    render: () => (
      <span>
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#">停用</a>
      </span>
  ),
  }];

  mockDataSource = [{
    webhook_name: 'WMS',
    scope: '全局',
    target_url: 'https://wms.nlocn.com/hook',
  },
  ];

  render() {
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="swap" /> 开放API
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              提醒目标Webhook
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools" />
        </Header>
        <Content className="main-content">
          <Alert
            description={this.msg('webhookDesc')}
            type="info"
            showIcon
            closable
          />
          <div className="page-body" >
            <div className="toolbar">
              <Button type="primary" size="large" icon="plus" onClick={this.handleAddWebhook}>
                {this.msg('addWebhook')}
              </Button>
            </div>
            <div className="panel-body table-panel">
              <Table columns={this.columns} dataSource={this.mockDataSource} />
            </div>
          </div>
        </Content>
      </div>
    );
  }
}
