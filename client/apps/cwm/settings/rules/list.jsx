import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Table, Button, Layout, Row, Col, Menu, message } from 'antd';
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
export default class RulesList extends Component {
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
      render: (_, record) => (
        <Row type="flex">
          <Col className="col-flex-primary">
            <a>{record.template_name}</a>
            <div>{record.modify_name}</div>
            <div className="mdc-text-grey">{record.last_updated_date}</div>
          </Col>
        </Row>
      ),
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
                {this.msg('rules')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <Menu
              selectedKeys={[this.state.current]}
              mode="inline"
              onClick={this.handleListChange}
            >
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.receiveTaskList)}>上架规则</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.putawayTaskList)}>分配规则</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.pickingTaskList)}>补货规则</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.packingList)}>波次计划规则</Menu.Item>
              <Menu.Item key={JSON.stringify(CWM_DOCU_TYPE.loadingList)}>流水号规则</Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.state.current}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="top-bar-tools">
              <Button type="primary" size="large" onClick={this.handleCreateNew} icon="plus">新增</Button>
            </div>
          </Header>
          <Content className="main-content">
            <div className="page-body">
              <Layout className="main-wrapper">
                <Sider className="nav-sider" width={280}>
                  <Table size="middle" showHeader={false} columns={columns} dataSource={this.props.invTemplates} rowKey="id" />
                </Sider>
                <Content className="nav-content">
                  <div className="nav-content-head" />
                  <div className="panel-body table-panel" />
                </Content>
              </Layout>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
