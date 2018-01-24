import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Tabs, Layout } from 'antd';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import MagicCard from 'client/components/MagicCard';
import PageHeader from 'client/components/PageHeader';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { formatMsg } from './message.i18n';
import QuoteTitle from './quoteTitle';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import RevisionTable from './revisionTable';


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
        <PageHeader>
          <PageHeader.Title>
            <QuoteTitle />
          </PageHeader.Title>
        </PageHeader>
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }}>
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
          </MagicCard>
        </Content>
      </div>
    );
  }
}
