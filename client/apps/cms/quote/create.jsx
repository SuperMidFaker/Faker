import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import { Tabs, Form, Layout } from 'antd';
import EditToolbar from './editToolbar';
import FeesTable from './feesTable';
import FeesForm from './feesForm';

const formatMsg = format(messages);
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
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'create' })
@Form.create()
export default class QuotingCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <span>{this.msg('newQuote')}</span>
        </Header>
        <EditToolbar form={form} action="create" />
        <Content className="main-content">
          <div className="page-body">
            <Tabs defaultActiveKey="fees-form">
              <TabPane tab="基础信息" key="fees-form">
                <FeesForm form={form} action="create" />
              </TabPane>
              <TabPane tab="价格表" key="fees-table">
                <FeesTable action="create" editable />
              </TabPane>
            </Tabs>
          </div>
        </Content>
      </div>
    );
  }
}
