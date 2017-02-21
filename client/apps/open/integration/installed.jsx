import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Icon, Layout, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/nav-link';
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

export default class InstalledAppsList extends React.Component {
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
    title: this.msg('integrationName'),
    dataIndex: 'integration_name',
  }, {
    title: this.msg('integraionApp'),
    dataIndex: 'integration_app',
    width: 200,
  }, {
    title: this.msg('scope'),
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
    width: 100,
    render: () => (
      <span>
        <NavLink to="/open/integration/arctm/config/asdasfasdfadfsaf">配置</NavLink>
        <span className="ant-divider" />
        <a href="#">停用</a>
      </span>
  ),
  }];

  mockDataSource = [{
    integration_name: '西门子CTM接口',
    integration_app: 'AmberRoad CTM',
    scope: '西门子贸易',
    incoming_status: '正常',
    outgoing_status: '异常',
  }, {
    integration_name: '茂鸿国际EDI接口',
    integration_app: 'EasypassEDI',
    scope: '全局',
    incoming_status: '正常',
    outgoing_status: '异常',
  },
  ];

  render() {
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
              <Table columns={this.columns} dataSource={this.mockDataSource} />
            </div>
          </div>
        </Content>
      </div>
    );
  }
}
