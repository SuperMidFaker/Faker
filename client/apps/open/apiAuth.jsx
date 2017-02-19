import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Breadcrumb, Button, Layout, Table } from 'antd';
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

export default class AppsList extends React.Component {
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
    title: this.msg('appName'),
    dataIndex: 'app_name',
  }, {
    title: this.msg('apiKey'),
    width: 400,
    dataIndex: 'api_key',
  }, {
    title: this.msg('apiSecret'),
    dataIndex: 'api_secret',
    width: 400,
  }, {
    title: this.msg('opColumn'),
    width: 200,
    render: () => (
      <span>
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#">删除</a>
      </span>
  ),
  }];

  mockDataSource = [{
    app_name: '夸微关务系统',
    api_key: 'a530318f6f6890a68dc6efeadb623926',
    api_secret: '62740c97bf7868964b58e314cc8205c8',
  },
  ];

  render() {
    return (
      <div>
        <Header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              API接口授权
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="toolbar-right" />
        </Header>
        <Content className="main-content">
          <Alert
            description={this.msg('apiDesc')}
            type="info"
            showIcon
            closable
          />
          <div className="page-body" >
            <div className="toolbar">
              <Button type="primary" size="large" icon="plus" onClick={this.handleAddWarehouse}>
                {this.msg('generateAPICredential')}
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
