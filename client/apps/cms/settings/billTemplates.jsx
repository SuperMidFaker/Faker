import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Menu, Icon, Button, Table, Popconfirm, message, Tabs } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from 'client/components/nav-link';
import messages from './message.i18n';
import { toggleBillTempModal, loadBillemplates, deleteTemplate, loadRelatedCustomers } from 'common/reducers/cmsSettings';
import withPrivilege from 'client/common/decorators/withPrivilege';
import BillTemplateModal from '../common/manifest/modals/billTemplateModal';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CMS_BILL_TEMPLATE_PERMISSION } from 'common/constants';
import connectFetch from 'client/common/decorators/connect-fetch';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const TabPane = Tabs.TabPane;

function fetchData({ dispatch, state }) {
  return dispatch(loadBillemplates({ tenantId: state.account.tenantId, ietype: 'import' }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    billtemplates: state.cmsSettings.billtemplates,
  }),
  { toggleBillTempModal, loadPartners, loadBillemplates, deleteTemplate, loadRelatedCustomers }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class billTemplates extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billtemplates: PropTypes.array.isRequired,
    toggleBillTempModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleAddBtnClicked = () => {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role: PARTNER_ROLES.CUS,
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
    this.props.toggleBillTempModal(true, 'add');
  }
  handleEdit = (record) => {
    this.context.router.push(`/clearance/settings/billtemplates/edit/${record.id}`);
  }
  handleDelete = (record) => {
    this.props.deleteTemplate(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const ietype = record.i_e_type === 0 ? 'import' : 'export';
        this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype });
      }
    });
  }
  handleTabChange = (tabKey) => {
    this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype: tabKey });
  }
  render() {
    const columns = [
      {
        title: '模板名称',
        dataIndex: 'template_name',
        key: 'template_name',
      }, {
        title: '关联客户',
        dataIndex: 'customer_name',
        key: 'customer_name',
      }, {
        title: '更新人',
        dataIndex: 'modify_name',
        key: 'modify_name',
      }, {
        title: '更新日期',
        dataIndex: 'modify_date',
        key: 'modify_date',
        render(o) {
          return moment(o).format('YYYY/MM/DD HH:mm');
        },
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        render: (_, record) => {
          if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.edit) {
            return (
              <span>
                <a onClick={() => this.handleEdit(record)}>{this.msg('edit')}</a>
                <span className="ant-divider" />
                <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record)}>
                  <a>删除</a>
                </Popconfirm>
              </span>);
          } else if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.view) {
            return <NavLink to={`/clearance/settings/billtemplates/view/${record.id}`}>{this.msg('view')}</NavLink>;
          }
          return '';
        },
      },
    ];
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
              清单模板
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout className="main-wrapper">
              <Sider className="nav-sider">
                <Menu
                  defaultOpenKeys={['bizdata']}
                  defaultSelectedKeys={['billmodel']}
                  mode="inline"
                >
                  <SubMenu key="bizdata" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
                    <Menu.Item key="billmodel"><NavLink to="/clearance/settings/billtemplates">清单模板</NavLink></Menu.Item>
                    <Menu.Item key="quotemodel"><NavLink to="/clearance/settings/quotetemplates">费用模板</NavLink></Menu.Item>
                  </SubMenu>
                  <Menu.Item key="notification"><span><Icon type="notification" /><span>通知提醒</span></span></Menu.Item>
                </Menu>
              </Sider>
              <Content className="nav-content">
                <div className="toolbar">
                  <Button type="primary" size="large" onClick={this.handleAddBtnClicked} icon="plus-circle-o">新建模板</Button>
                </div>
                <div className="page-body tabbed">
                  <Tabs defaultActiveKey="import" onChange={this.handleTabChange}>
                    <TabPane tab="进口" key="import">
                      <Table columns={columns} dataSource={this.props.billtemplates} rowKey="id" />
                    </TabPane>
                    <TabPane tab="出口" key="export">
                      <Table columns={columns} dataSource={this.props.billtemplates} rowKey="id" />
                    </TabPane>
                  </Tabs>
                </div>
              </Content>
            </Layout>
            <BillTemplateModal />
          </div>
        </Content>
      </Layout>
    );
  }
}
