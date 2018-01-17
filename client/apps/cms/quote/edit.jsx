import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';

import withPrivilege from 'client/common/decorators/withPrivilege';
import { formatMsg } from './message.i18n';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import { Form, Layout, Tabs } from 'antd';
import QuoteTitle from './quoteTitle';
import EditToolbar from './editToolbar';
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
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'edit' })
export default class QuotingEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  render() {
    const { form } = this.props;
    return (
      <div>
        <Header className="page-header">
          <QuoteTitle />
          <EditToolbar form={form} onFormError={this.handleFormError} />
        </Header>
        <Content className="main-content">
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
        </Content>
      </div>
    );
  }
}
