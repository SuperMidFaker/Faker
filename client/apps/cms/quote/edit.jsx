import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import withPrivilege from 'client/common/decorators/withPrivilege';
import messages from './message.i18n';
import { loadEditQuote, copyQuote, loadPartners } from 'common/reducers/cmsQuote';
import { Button, Dropdown, Form, Icon, Menu, Tabs, message } from 'antd';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import connectFetch from 'client/common/decorators/connect-fetch';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function fetchData({ params, state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadPartners(state.account.tenantId)));
  promises.push(dispatch(loadEditQuote(params.quoteno)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    quoteData: state.cmsQuote.quoteData,
    partners: state.cmsQuote.partners,
    clients: state.cmsQuote.clients,
  }),
  { copyQuote }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'quoteManage'),
  moduleName: 'clearance',
})
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'edit' })
export default class QuotingEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    quoteData: PropTypes.object.isRequired,
    copyQuote: PropTypes.func.isRequired,
    partners: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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
    const { form } = this.props;
    const msg = key => formatMsg(this.props.intl, key);
    const menu = (
      <Menu>
        <Menu.Item key="copyQuote">{msg('copy')}</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <header className="top-bar">
          <span>{this.props.quoteData.quote_no}</span>
        </header>
        <div className="top-bar-tools">
          <Button type="primary" >{msg('publish')}</Button>
          <span />
          <Button type="default" >{msg('trail')}</Button>
          <span />
          <Dropdown overlay={menu}>
            <Button type="ghost">
              <Icon type="ellipsis" />
            </Button>
          </Dropdown>
        </div>
        <div className="main-content">
          <div className="page-body">
            <Tabs defaultActiveKey="fees-table">
              <TabPane tab="报价费率" key="fees-table">
                <FeesTable action="edit" editable={false} />
              </TabPane>
              <TabPane tab="报价设置" key="fees-form">
                <FeesForm form={form} action="edit" />
              </TabPane>
              <TabPane tab="修订历史" key="revision-history">
                报价修订历史记录
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
