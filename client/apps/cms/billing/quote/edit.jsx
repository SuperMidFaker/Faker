import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Form, Layout, Tabs, message, Button, Menu, Dropdown, Icon } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';
import { createFilename } from 'client/util/dataTransform';
import { loadQuoteParams, reviseQuoteSetting, copyQuote, openPublishModal, openTrialModal, reloadQuoteFees } from 'common/reducers/cmsQuote';
import Drawer from 'client/components/Drawer';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import DescriptionList from 'client/components/DescriptionList';
import ImportDataPanel from 'client/components/ImportDataPanel';
import TariffPane from './tabpane/tariffPane';
import SettingPane from './tabpane/settingPane';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Description } = DescriptionList;

function fetchData({ params, dispatch }) {
  return dispatch(loadQuoteParams(params.quoteNo));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'quoteManage'),
  moduleName: 'clearance',
})
@connect(
  state => ({
    quoteData: state.cmsQuote.quoteData,
    saving: state.cmsQuote.quoteSaving,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  {
    reviseQuoteSetting, copyQuote, openPublishModal, openTrialModal, reloadQuoteFees,
  }
)
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'edit' })
export default class QuotingEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    tabKey: 'tariff',
    importPanelVisible: false,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleFormError = () => {
    this.setState({
      tabKey: 'setting',
    });
  }
  handleTabChange = (key) => {
    this.setState({ tabKey: key });
  }
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const quoteData = {
          ...this.props.quoteData,
          ...this.props.form.getFieldsValue(),
        };
        const prom = this.props.reviseQuoteSetting(quoteData);
        prom.then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('保存成功', 5);
          }
        });
      } else {
        this.handleFormError();
      }
    });
  }
  handlePublish = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        this.props.openPublishModal();
      } else {
        this.handleFormError();
      }
    });
  }
  handleMenuClick = (item) => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        if (item.key === 'trial') {
          this.props.openTrialModal();
        }
      } else {
        this.handleFormError();
      }
    });
  }
  handleCopy = () => {
    const quoteData = {
      ...this.props.quoteData,
      ...this.props.form.getFieldsValue(),
    };
    quoteData.tenantId = this.props.tenantId;
    quoteData.valid = true;
    quoteData.modifyBy = this.props.loginName;
    quoteData.modifyById = this.props.loginId;
    const prom = this.props.copyQuote(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('复制成功', 5);
        this.context.router.push(`/clearance/quote/edit/${this.props.quoteData.quote_no}`);
      }
    });
  }
  handleCancel = () => {
    this.context.router.push('/clearance/billing/quote');
  }
  handleFeesUpload = () => {
    this.setState({ importPanelVisible: false });
    this.props.reloadQuoteFees();
  }
  handleMoreMenuClick = (e) => {
    if (e.key === 'import') {
      this.setState({
        importPanelVisible: true,
      });
    } else if (e.key === 'export') {
      const { quoteData } = this.props;
      window.open(`${API_ROOTS.default}v1/cms/billing/quote/tariff/export/${createFilename(quoteData.quote_name)}.xlsx?quoteNo=${quoteData.quote_no}`);
    } else {
      // TODO
    }
  }
  render() {
    const {
      form, saving, quoteData, tenantId,
    } = this.props;
    let readOnly = false;
    if (tenantId !== quoteData.tenant_id) {
      readOnly = true;
    }
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        <Menu.Item key="import"><Icon type="upload" /> 导入报价费率</Menu.Item>
        <Menu.Item key="export"><Icon type="download" /> 导出报价费率</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="calculate"><Icon type="calculator" /> 手动触发计费</Menu.Item>
      </Menu>
    );
    return (
      <Layout>
        <PageHeader breadcrumb={[this.msg('quote'), this.props.params.quoteNo]}>
          <PageHeader.Actions>
            {/* <Button icon="copy">{this.msg('clone')}</Button> */}
            <Dropdown overlay={moreMenu}><Button icon="down" /></Dropdown>
            <Button type="primary" icon="save" onClick={this.handleSave} loading={saving}>{this.gmsg('save')}</Button>
            <Button onClick={this.handleCancel}>{this.gmsg('cancel')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={4}>
              <Description term="报价编号">{quoteData.quote_no}</Description>
              <Description term="报价名称">{quoteData.quote_name}</Description>
              <Description term="服务需求方">{quoteData.buyer_name}</Description>
              <Description term="报价提供方">{quoteData.seller_name}</Description>
            </DescriptionList>
          </Drawer>
          <Content className="page-content">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
                <TabPane tab="费率" key="tariff">
                  <TariffPane readOnly={readOnly} />
                </TabPane>
                <TabPane tab="设置" key="setting">
                  <SettingPane form={form} formData={quoteData} readOnly={readOnly} />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
        <ImportDataPanel
          adaptors={null}
          title="报价费率导入"
          visible={this.state.importPanelVisible}
          endpoint={`${API_ROOTS.default}v1/cms/billing/quote/tariff/import`}
          formData={{ quoteNo: quoteData.quote_no }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.handleFeesUpload}
          template={`${XLSX_CDN}/报价费率导入模板.xlsx`}
        />
      </Layout>
    );
  }
}
