import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Table, Button, Layout, Menu, Popconfirm, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import withPrivilege from 'client/common/decorators/withPrivilege';
import InvTemplateModal from './modals/newTemplate';
import { toggleInvTempModal, loadInvTemplates, deleteInvTemplate } from 'common/reducers/cmsInvoice';
import { CMS_DOCU_TYPE } from 'common/constants';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
    docuType: state.cmsInvoice.docuType,
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
    docuType: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    current: JSON.stringify(this.props.docuType),
  }
  componentDidMount() {
    this.handleListLoad(this.props.docuType);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleListLoad = (type) => {
    this.props.loadInvTemplates({ tenantId: this.props.tenantId, docuType: type });
  }
  handleCreateNew = () => {
    this.props.toggleInvTempModal(true);
  }
  handleEdit = (record) => {
    let type = '';
    if (record.docu_type === CMS_DOCU_TYPE.invoice) {
      type = 'invoice';
    } else if (record.docu_type === CMS_DOCU_TYPE.contract) {
      type = 'contract';
    } else if (record.docu_type === CMS_DOCU_TYPE.packingList) {
      type = 'packingList';
    }
    this.context.router.push(`/clearance/settings/doctemplates/${type}/edit/${record.id}`);
  }
  handleDelete = (record) => {
    this.props.deleteInvTemplate(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleListLoad(this.props.docuType);
      }
    });
  }
  handleListChange = (ev) => {
    if (ev.key === this.props.docuType) {
      return;
    }
    this.setState({
      current: ev.key,
    });
    this.handleListLoad(parseInt(ev.key, 10));
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
      title: '最后更新时间',
      dataIndex: 'last_updated_date',
      key: 'last_updated_date',
    }, {
      title: '操作',
      key: 'opt',
      width: 100,
      render: (_, record) => (
        <span>
          <a onClick={() => this.handleEdit(record)}>{this.msg('edit')}</a>
          <span className="ant-divider" />
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record)}><a>删除</a></Popconfirm>
        </span>),
    }];
    return (
      <Layout>
        <Sider width={280} className="menu-sider" key="sider">
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('appSettings')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                单据模板
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <Menu
              selectedKeys={[this.state.current]}
              mode="inline"
              onClick={this.handleListChange}
            >
              <Menu.Item key={JSON.stringify(CMS_DOCU_TYPE.invoice)}>发票模板</Menu.Item>
              <Menu.Item key={JSON.stringify(CMS_DOCU_TYPE.contract)}>合同模板</Menu.Item>
              <Menu.Item key={JSON.stringify(CMS_DOCU_TYPE.packingList)}>箱单模板</Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                单据模板
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="top-bar-tools">
              <Button type="primary" size="large" onClick={this.handleCreateNew} icon="plus">新增</Button>
            </div>
          </Header>
          <Content className="main-content layout-fixed-width">
            <div className="page-body">
              <Table columns={columns} dataSource={this.props.invTemplates} rowKey="id" />
              <InvTemplateModal />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
