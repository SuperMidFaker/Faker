import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Table, Button, Layout, Menu, Popconfirm, Icon, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import NavLink from 'client/components/nav-link';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';
import InvTemplateModal from './modals/newTemplate';
import { toggleInvTempModal, loadInvTemplates, deleteInvTemplate } from 'common/reducers/cmsInvoice';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

function fetchData({ dispatch, state }) {
  return dispatch(loadInvTemplates({ tenantId: state.account.tenantId }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
  }),
  { toggleInvTempModal, loadInvTemplates, deleteInvTemplate }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class InvoiceTemplate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    invTemplates: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleCreateNew = () => {
    this.props.toggleInvTempModal(true);
  }
  handleEdit = (record) => {
    this.context.router.push(`/clearance/settings/invoicetemplates/edit/${record.id}`);
  }
  handleDelete = (record) => {
    this.props.deleteInvTemplate(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadInvTemplates({ tenantId: this.props.tenantId });
      }
    });
  }
  render() {
    const columns = [{
      title: '模板名称',
      dataIndex: 'template_name',
      key: 'template_name',
    }, {
      title: '修改人',
      dataIndex: 'modify_name',
      key: 'modify_name',
    }, {
      title: '操作',
      key: 'opt',
      render: (_, record) => (
        <span>
          <a onClick={() => this.handleEdit(record)}>{this.msg('edit')}</a>
          <span className="ant-divider" />
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record)}><a>删除</a></Popconfirm>
        </span>),
    }];
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('appSettings')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              业务数据
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              费用模板
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              发票模板
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button type="primary" size="large" onClick={this.handleCreateNew} icon="plus">新增</Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  defaultOpenKeys={['bizdata']}
                  defaultSelectedKeys={['invoiceTemplate']}
                  mode="inline"
                >
                  <SubMenu key="bizdata" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
                    <Menu.Item key="quotemodel"><NavLink to="/clearance/settings/quotetemplates">费用模板</NavLink></Menu.Item>
                    <Menu.Item key="invoiceTemplate"><NavLink to="/clearance/settings/invoicetemplates">发票模板</NavLink></Menu.Item>
                  </SubMenu>
                  <Menu.Item key="notification"><span><Icon type="notification" /><span>通知提醒</span></span></Menu.Item>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <div className="panel-body table-panel">
                  <Table columns={columns} dataSource={this.props.invTemplates} rowKey="id" />
                </div>
              </Content>
            </Layout>
            <InvTemplateModal />
          </div>
        </Content>
      </Layout>
    );
  }
}