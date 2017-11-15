import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Breadcrumb, Button, Icon, Layout, Table } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

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
    width: 120,
  }, {
    title: this.msg('scope'),
    width: 200,
    dataIndex: 'scope',
  }, {
    title: this.msg('subscribedEvents'),
    dataIndex: 'subs_events',
  }, {
    title: this.msg('callbackUrl'),
    dataIndex: 'callback_url',
  }, {
    title: this.msg('sign'),
    dataIndex: 'sign',
  }, {
    title: this.msg('opColumn'),
    width: 160,
    render: () => (
      <span>
        <a href="#">发送测试</a>
        <span className="ant-divider" />
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#"><Icon type="delete" /></a>
      </span>
  ),
  }];

  mockDataSource = [{
    webhook_name: 'WMS',
    scope: '全局',
    subs_events: 'Manifest Created, Customs Cleared',
    callback_url: 'https://wms.nlocn.com/hook',
    sign: 'd3ec0148208487f4136d0d03a997d5b798',
  },
  ];

  render() {
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              提醒目标Webhook
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools" />
        </Header>
        <Content className="main-content">
          <QueueAnim type="right">
            <Alert
              description={this.msg('webhookDesc')}
              type="info"
              showIcon
              closable
              key="alert"
            />
            <div className="page-body" key="body">
              <div className="toolbar">
                <Button type="primary" icon="plus" onClick={this.handleAddWebhook}>
                  {this.msg('addWebhook')}
                </Button>
              </div>
              <div className="panel-body table-panel table-fixed-layout">
                <Table columns={this.columns} dataSource={this.mockDataSource} />
              </div>
            </div>
          </QueueAnim>
        </Content>
      </div>
    );
  }
}
