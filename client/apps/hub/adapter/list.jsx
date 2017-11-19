import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Icon, Layout } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;

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

export default class ApiAuthList extends React.Component {
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
    title: this.msg('适配器名称'),
    dataIndex: 'adapter_name',
    width: 200,
  }, {
    title: this.msg('适配对象'),
    width: 200,
    dataIndex: 'adapted_obj',
  }, {
    title: this.msg('scope'),
    dataIndex: 'scope',
  }, {
    title: this.msg('lastUpdatedDate'),
    dataIndex: 'last_updated_date',
    width: 150,
  }, {
    title: this.msg('createdBy'),
    dataIndex: 'created_by',
    width: 150,
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: () => (
      <span>
        <a href="#">修改</a>
        <span className="ant-divider" />
        <a href="#"><Icon type="delete" /></a>
      </span>
  ),
  }];

  mockDataSource = [{
    app_name: '夸微制单系统',
    scope: '全局',
    api_key: 'a530318f6f6890a68dc6efeadb623926',
    api_secret: '62740c97bf7868964b58e314cc8205c8',
  },
  ];

  render() {
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="api" /> 数据适配
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <PageHint />
            <Button type="primary" icon="plus" onClick={this.handleAddWarehouse}>
              {this.msg('create')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            columns={this.columns} dataSource={this.mockDataSource} rowKey="id"
            locale={{ emptyText: '没有当前状态的ASN' }}
          />
        </Content>
      </div>
    );
  }
}
