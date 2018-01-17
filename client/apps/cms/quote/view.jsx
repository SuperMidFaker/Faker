import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';

import withPrivilege from 'client/common/decorators/withPrivilege';
import { formatMsg } from './message.i18n';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import { Form, Tabs, Layout } from 'antd';
import QuoteTitle from './quoteTitle';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import RevisionTable from './revisionTable';
import connectFetch from 'client/common/decorators/connect-fetch';

const { Header, Content } = Layout;
const TabPane = Tabs.TabPane;

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
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'view' })
export default class QuotingView extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    tabKey: 'fees-table',
  }
  handleTabChange = (key) => {
    this.setState({ tabKey: key });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form } = this.props;
    return (
      <div>
        <Header className="page-header">
          <QuoteTitle />
        </Header>
        <Content className="main-content">
          <div className="page-body">
            <Tabs activeKey={this.state.tabKey} onChange={this.handleTabChange}>
              <TabPane tab="报价费率" key="fees-table">
                <FeesTable action="view" editable={false} />
              </TabPane>
              <TabPane tab="报价设置" key="fees-form">
                <FeesForm form={form} action="view" />
              </TabPane>
              <TabPane tab="修订历史" key="revision-history">
                <RevisionTable action="view" />
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </div>
    );
  }
}
