import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Button, message, Mention, Collapse, Tabs } from 'antd';
import { openAddModal, deleteRelatedCustomer, loadRelatedCustomers, saveTemplateData, countFieldsChange, loadCmsParams } from 'common/reducers/cmsManifest';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
import InfoItem from 'client/components/InfoItem';
import { loadCustomers } from 'common/reducers/crmCustomers';
import ButtonToggle from 'client/components/ButtonToggle';
import HeadRulesPane from './tabpane/headRulesPane';
import ImportRulesPane from './tabpane/importRulesPane';
import MergeSplitRulesPane from './tabpane/mergeSplitRulesPane';
import TemplateUsersPane from './tabpane/templateUsersPane';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    tenantName: state.account.tenantName,
    template: state.cmsManifest.template,
    ietype: state.cmsManifest.template.ietype,
    templateName: state.cmsManifest.template.template_name,
    relatedCustomers: state.cmsManifest.relatedCustomers,
    formData: state.cmsManifest.formData,
    changeTimes: state.cmsManifest.changeTimes,
  }),
  { loadCustomers, openAddModal, deleteRelatedCustomer, loadRelatedCustomers, saveTemplateData, countFieldsChange, loadCmsParams }
)
@Form.create({ onFieldsChange: (props, values) => props.countFieldsChange(values) })
export default class ManifestTemplate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    form: PropTypes.object.isRequired,
    tenantName: PropTypes.string.isRequired,
    relatedCustomers: PropTypes.array,
    template: PropTypes.object.isRequired,
    operation: PropTypes.string.isRequired,
    changeTimes: PropTypes.number,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    attachments: [],
    rightSidercollapsed: true,
    changed: false,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.changeTimes !== nextProps.changeTimes) {
      this.setState({ changed: true });
    }
    if (this.props.ietype !== nextProps.ietype) {
      this.props.loadCmsParams({
        ieType: nextProps.ietype,
        tenantId: this.props.tenantId,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    const { template, relatedCustomers } = this.props;
    if (relatedCustomers.length === 0) {
      return message.error('至少添加一个关联客户');
    }
    const element = Mention.toString(this.props.form.getFieldValue('rule_element'));
    const mergeOptArr = this.props.form.getFieldValue('mergeOpt_arr');
    const specialHsSortArr = this.props.form.getFieldValue('split_spl_category');
    const mergeObj = { merge_byhscode: 0, merge_bygname: 0, merge_bycurr: 0, merge_bycountry: 0, merge_bycopgno: 0, merge_byengno: 0 };
    for (const mergeOpt of mergeOptArr) {
      if (mergeOpt === 'byHsCode') {
        mergeObj.merge_byhscode = 1;
      } else if (mergeOpt === 'byGName') {
        mergeObj.merge_bygname = 1;
      } else if (mergeOpt === 'byCurr') {
        mergeObj.merge_bycurr = 1;
      } else if (mergeOpt === 'byCountry') {
        mergeObj.merge_bycountry = 1;
      } else if (mergeOpt === 'byCopGNo') {
        mergeObj.merge_bycopgno = 1;
      } else if (mergeOpt === 'byEmGNo') {
        mergeObj.merge_byengno = 1;
      }
    }
    let specialHsSorts = '';
    if (specialHsSortArr) {
      specialHsSorts = specialHsSortArr.join(',');
    }
    const head = { ...this.props.form.getFieldsValue(), ...mergeObj, rule_element: element, split_spl_category: specialHsSorts };
    this.props.saveTemplateData({ head, templateId: template.id }).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.setState({ changed: false });
          message.info('保存成功');
        }
      }
    );
  }
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleAddRelatedCustomers = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
    this.props.openAddModal();
  }
  handleCustDel = (id) => {
    this.props.deleteRelatedCustomer(id).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.props.loadRelatedCustomers(this.props.template.id);
        }
      });
  }
  toggleRightSider = () => {
    this.setState({
      rightSidercollapsed: !this.state.rightSidercollapsed,
    });
  }
  render() {
    const { form, ietype, templateName, formData, template, operation } = this.props;
    return (
      <Layout className="ant-layout-wrapper">
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
              {operation === 'edit' &&
              <Button size="large" type="ghost" onClick={this.handleCancel}>
                {this.msg('cancel')}
              </Button>}
              {operation === 'edit' &&
              <Button size="large" type="primary" icon="save" onClick={this.handleSave} disabled={!this.state.changed}>
                {this.msg('save')}
              </Button>}
              <ButtonToggle size="large"
                iconOn="setting" iconOff="setting"
                onClick={this.toggleRightSider}
              />
            </div>
          </Header>
          <Content className={'main-content layout-min-width layout-min-width-large'}>
            <div className="page-body tabbed">
              <Form layout="horizontal">
                <Tabs>
                  <TabPane tab="清单表头规则" key="head">
                    <HeadRulesPane ietype={ietype} form={form} formData={formData} />
                  </TabPane>
                  <TabPane tab="特殊字段规则" key="importRules">
                    <ImportRulesPane form={form} formData={formData} />
                  </TabPane>
                  <TabPane tab="归并拆分规则" key="mergeSplitRules">
                    <MergeSplitRulesPane form={form} formData={formData} />
                  </TabPane>
                </Tabs>
              </Form>
            </div>
          </Content>
        </Layout>
        <Sider
          trigger={null}
          defaultCollapsed
          collapsible
          collapsed={this.state.rightSidercollapsed}
          width={480}
          collapsedWidth={0}
          className="right-sider"
        >
          <div className="right-sider-panel">
            <div className="panel-header">
              <h3>模板设置</h3>
            </div>
            <Collapse accordion defaultActiveKey="properties">
              <Panel header={'模板属性'} key="properties">
                <InfoItem label="关联客户" type="select" field={''} dataIndex="bl_wb_no" placeholder="关联客户" options={''} editable onEdit={this.handleFill} />
                <InfoItem label="模板名称" field={templateName} dataIndex="bl_wb_no" placeholder="模板名称" editable onEdit={this.handleFill} />
              </Panel>
              <Panel header={'授权使用单位'} key="user">
                <TemplateUsersPane template={template} operation={operation} />
              </Panel>
            </Collapse>
          </div>
        </Sider>
      </Layout>
    );
  }
}