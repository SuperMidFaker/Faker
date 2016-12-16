import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import withPrivilege from 'client/common/decorators/withPrivilege';
import messages from './message.i18n';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import { Form, Tabs } from 'antd';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import RevisionTable from './revisionTable';
import connectFetch from 'client/common/decorators/connect-fetch';
const formatMsg = format(messages);
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
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form } = this.props;
    return (
      <div>
        <header className="top-bar">
          <span>{this.props.params.quoteno}</span>
        </header>
        <div className="main-content">
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
        </div>
      </div>
    );
  }
}
