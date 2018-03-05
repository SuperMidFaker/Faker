import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Tabs, message, Button } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadEditQuote, reviseQuote, copyQuote, openPublishModal, openTrialModal } from 'common/reducers/cmsQuote';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import TariffPane from './tabpane/tariffPane';
import SettingPane from './tabpane/settingPane';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

function fetchData({ params, dispatch }) {
  return dispatch(loadEditQuote(params.quoteno, params.version));
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
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  {
    reviseQuote, copyQuote, openPublishModal, openTrialModal,
  }
)
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'edit' })
export default class QuotingEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      quote_no: PropTypes.string.isRequired,
      decl_way_code: PropTypes.arrayOf(PropTypes.string).isRequired,
      trans_mode: PropTypes.arrayOf(PropTypes.string).isRequired,
      recv_tenant_name: PropTypes.string.isRequired,
      send_tenant_name: PropTypes.string.isRequired,
      fees: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
    }),
  }
  state = {
    tabKey: 'tariff',
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
        if (!quoteData.fees || quoteData.fees.length === 0) {
          message.error('无报价费用模板', 5);
        }
        const { loginId, loginName } = this.props;
        const prom = this.props.reviseQuote(quoteData, loginName, loginId);
        prom.then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('保存成功', 5);
            // this.context.router.push('/clearance/quote');
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
  render() {
    const { form, saving } = this.props;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('quote')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.props.params.quoteNo}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button icon="copy">{this.msg('clone')}</Button>
            <Button type="primary" icon="save" onClick={this.handleSave} loading={saving}>{this.msg('save')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }}>
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="费率" key="tariff">
                <TariffPane />
              </TabPane>
              <TabPane tab="设置" key="setting">
                <SettingPane form={form} />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
      </Layout>
    );
  }
}
