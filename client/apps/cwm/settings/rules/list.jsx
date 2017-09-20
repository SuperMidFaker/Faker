import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Table, Button, Layout, Row, Col, Menu, message } from 'antd';
import { toggleInvTempModal, loadInvTemplates, deleteInvTemplate } from 'common/reducers/cmsInvoice';
import PageHeader from 'client/components/PageHeader';
import { CWM_RULES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
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
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentKey: JSON.stringify(this.props.docuType),
  }
  componentDidMount() {
    this.handleListLoad(this.props.docuType);
  }
  msg = formatMsg(this.props.intl)
  defaultRules = [{
    id: 1,
    rule_name: '默认上架规则',
    last_updated_by: 'Admin',
    last_updated_date: '2017.06.22',
  }, {
    id: 4,
    rule_name: '默认上架规则',
    last_updated_by: 'Eric',
    last_updated_date: '2017.06.22',
  }];
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
    this.context.router.push(`/cwm/settings/templates/${record.type}/edit/${record.id}`);
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
      currentKey: ev.key,
    });
    this.handleListLoad(parseInt(ev.key, 10));
  }
  render() {
    const columns = [{
      render: (_, record) => (
        <Row type="flex">
          <Col className="col-flex-primary">
            <a>{record.rule_name}</a>
            <div>{record.last_updated_by}</div>
            <div className="mdc-text-grey">{record.last_updated_date}</div>
          </Col>
        </Row>
      ),
    }];
    return (
      <Layout>
        <Sider width={280} className="menu-sider" key="sider">
          <div className="page-header">
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
              selectedKeys={[this.state.currentKey]}
              mode="inline"
              onClick={this.handleListChange}
            >
              <Menu.Item key={CWM_RULES.PUTAWAY_RULE.key}>{CWM_RULES.PUTAWAY_RULE.text}</Menu.Item>
              <Menu.Item key={CWM_RULES.ALLOC_RULE.key}>{CWM_RULES.ALLOC_RULE.text}</Menu.Item>
              <Menu.Item key={CWM_RULES.REPLENISH_RULE.key}>{CWM_RULES.REPLENISH_RULE.text}</Menu.Item>
              <Menu.Item key={CWM_RULES.WAVE_RULE.key}>{CWM_RULES.WAVE_RULE.text}</Menu.Item>
              <Menu.Item key={CWM_RULES.SEQUENCE_RULE.key}>{CWM_RULES.SEQUENCE_RULE.text}</Menu.Item>
            </Menu>
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.state.currentKey}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" size="large" onClick={this.handleCreateNew} icon="plus">新增</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            <div className="page-body">
              <Layout className="main-wrapper">
                <Sider className="nav-sider" width={280}>
                  <Table size="middle" showHeader={false} columns={columns} dataSource={this.defaultRules} rowKey="id" />
                </Sider>
                <Content className="nav-content">
                  <div className="nav-content-head" />

                </Content>
              </Layout>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
