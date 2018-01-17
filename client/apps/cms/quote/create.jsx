import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';

import { formatMsg } from './message.i18n';
import { loadEditQuote } from 'common/reducers/cmsQuote';
import { Tabs, Form, Layout } from 'antd';
import EditToolbar from './editToolbar';
import FeesTable from './feesTable';
import FeesForm from './feesForm';


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
  msg = formatMsg(this.props.intl)
  render() {
    const { form } = this.props;
    return (
      <div>
        <Header className="page-header">
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
