import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Row, Col, Button, Tooltip, Table, Popconfirm, Icon } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { openAddModal } from 'common/reducers/cmsSettings';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import HeadForm from './forms/headForm';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import { loadCustomers } from 'common/reducers/crmCustomers';
import SetImportRules from './cards/setImportRules';
import MergeSplitRules from './cards/mergeSplitRules';
import CustomerModal from './modals/customerModal';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

function fetchData({ dispatch, state }) {
  const promises = [];
  promises.push(dispatch(loadCmsParams({
    ieType: state.cmsSettings.template.ieType,
    tenantId: state.account.tenantId,
  })));
  // promises.push(dispatch(loadCustomers({
  //   tenantId: state.account.tenantId,
  // })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    template: state.cmsSettings.template,
    ietype: state.cmsSettings.template.ietype,
    templateName: state.cmsSettings.billTemplateModal.templateName,
    billHead: state.cmsSettings.billHead,
  }),
  { loadCustomers, openAddModal }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class CreateTemplate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    attachments: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
      }
    });
  }
  handleSaveBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }
  handleAddRelatedCustomers = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
    this.props.openAddModal();
  }
  render() {
    const { form, ietype, templateName, billHead } = this.props;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }, {
      width: 80,
      fixed: 'right',
      render: (o, record) => (
        <Popconfirm title={this.msg('deleteConfirm')} onConfirm={() => this.handleItemDel(record.id)}>
          <a role="button"><Icon type="delete" /></a>
        </Popconfirm>
      ),
    }];
    return (
      <Layout className="ant-layout-wrapper">
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('billTemplates')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('relatedCustomers')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Tooltip placement="bottom" title="添加关联客户">
                <Button type="primary" shape="circle" icon="plus" onClick={this.handleAddRelatedCustomers} />
              </Tooltip>
            </div>
          </div>
          <div className="left-sider-panel" >
            <Table size="middle" columns={columns} showHeader={false} onRowClick={this.handleRowClick}
              rowKey="id" pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
            />
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('billTemplates')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {`${templateName}`}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="top-bar-tools">
              <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
                {this.msg('cancel')}
              </Button>
              <Button size="large" type="primary" icon="save" onClick={this.handleSaveBtnClick}>
                {this.msg('save')}
              </Button>
            </div>
          </Header>
          <Content className={'main-content layout-min-width layout-min-width-large'}>
            <HeadForm ietype={ietype} form={form} formData={billHead} />
            <Form vertical>
              <Row gutter={24}>
                <Col sm={24} md={12}>
                  <SetImportRules form={form} />
                </Col>
                <Col sm={24} md={12}>
                  <MergeSplitRules />
                </Col>
              </Row>
            </Form>
            <CustomerModal />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
