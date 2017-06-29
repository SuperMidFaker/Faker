import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Table, Button, Layout, Menu, Popconfirm, message } from 'antd';
import { toggleInvTempModal, loadInvTemplates, deleteInvTemplate } from 'common/reducers/cmsInvoice';
import { CWM_DOCU_TYPE } from 'common/constants';
import { formatMsg } from '../message.i18n';

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
  moduleName: 'cwm',
})
export default class TemplatesList extends Component {
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
  msg = formatMsg(this.props.intl)
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
    if (record.docu_type === CWM_DOCU_TYPE.receiveTaskList) {
      type = 'receiveTaskList';
    } else if (record.docu_type === CWM_DOCU_TYPE.putawayTaskList) {
      type = 'putawayTaskList';
    } else if (record.docu_type === CWM_DOCU_TYPE.pickingTaskList) {
      type = 'pickingTaskList';
    } else if (record.docu_type === CWM_DOCU_TYPE.packingList) {
      type = 'packingList';
    } else if (record.docu_type === CWM_DOCU_TYPE.loadingList) {
      type = 'loadingList';
    }
    this.context.router.push(`/cwm/settings/templates/${type}/edit/${record.id}`);
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
                {this.msg('settings')}
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
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.receiveTaskList)}>入库任务清单</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.putawayTaskList)}>上架任务清单</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.pickingTaskList)}>拣货任务清单</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.packingList)}>装箱单</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.loadingList)}>装车单</Menu.Item>
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
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
