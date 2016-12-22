import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import withPrivilege from 'client/common/decorators/withPrivilege';
import messages from './message.i18n';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import { Form, Tabs } from 'antd';
import EditToolbar from './editToolbar';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import RevisionTable from './revisionTable';
import connectFetch from 'client/common/decorators/connect-fetch';
const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function fetchData({ params, dispatch }) {
  return dispatch(loadEditQuote(params.quoteno, params.version));
}

function getTitle(quoteData, tenantId) {
  const title = {};
  if (quoteData) {
    title.quoteno = quoteData.quote_no;
    if (!quoteData.send_tenant_id) {
      title.tariff_kind = '销售基准价';
    } else if (!quoteData.recv_tenant_id) {
      title.tariff_kind = '成本基准价';
    } else if (quoteData.send_tenant_id === tenantId) {
      title.tariff_kind = '成本价';
      title.partner = quoteData.recv_tenant_name;
    } else if (quoteData.recv_tenant_id === tenantId) {
      title.tariff_kind = '销售价';
      title.partner = quoteData.send_tenant_name;
    }
  }
  return title;
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    title: getTitle(state.cmsQuote.quoteData, state.account.tenantId),
  }),
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
    title: PropTypes.object.isRequired,
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
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form, title } = this.props;
    return (
      <div>
        <header className="top-bar">
          <span>{title.quoteno}-{title.partner}-{title.tariff_kind}</span>
        </header>
        <EditToolbar form={form} onFormError={this.handleFormError} />
        <div className="main-content">
          <div className="page-body tabbed">
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
          </div>
        </div>
      </div>
    );
  }
}
