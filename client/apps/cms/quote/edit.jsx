import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Form, Layout, Tabs, message, Icon, Button, Menu, Dropdown } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadEditQuote, reviseQuote, copyQuote, openPublishModal, openTrialModal } from 'common/reducers/cmsQuote';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import QuoteTitle from './quoteTitle';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import PublishModal from './modals/publishModal';
import TrialModal from './modals/trialModal';
import RevisionTable from './revisionTable';
import { formatMsg } from './message.i18n';

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
    tabKey: 'fees-table',
  }
  handleFormError = () => {
    this.setState({
      tabKey: 'fees-form',
    });
  }
  handleTabChange = (key) => {
    this.setState({ tabKey: key });
  }
  msg = formatMsg(this.props.intl)
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
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="trial">{this.msg('trial')}</Menu.Item>
        <Menu.Item key="copyQuote">{this.msg('copy')}</Menu.Item>
      </Menu>
    );
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <QuoteTitle />
          </PageHeader.Title>
          <PageHeader.Actions>
            <Dropdown overlay={menu}>
              <Button >{this.msg('more')} <Icon type="down" /></Button>
            </Dropdown>
            <Button type="default" icon="save" onClick={this.handleSave} loading={saving}>{this.msg('save')}</Button>
            <Button type="primary" icon="book" onClick={this.handlePublish}>{this.msg('publish')}</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }}>
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="报价费率" key="fees-table">
                <FeesTable action="edit" editable={false} />
              </TabPane>
              <TabPane tab="报价设置" key="fees-form">
                <FeesForm form={form} action="edit" />
              </TabPane>
              <TabPane tab="修订历史" key="revision-history">
                <RevisionTable />
              </TabPane>
            </Tabs>
          </MagicCard>
        </Content>
        <PublishModal quoteForm={form} />
        <TrialModal quoteForm={form} />
      </Layout>
    );
  }
}
