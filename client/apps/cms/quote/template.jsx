import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout } from 'antd';

import { formatMsg } from './message.i18n';
import FeesTable from './feesTable';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import withPrivilege from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';


const { Header, Content } = Layout;

function fetchData({ dispatch, state }) {
  return dispatch(loadQuoteModel(state.account.tenantId));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { loadQuoteModel }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class QuoteTemplate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadQuoteModel: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }

  msg = formatMsg(this.props.intl)

  render() {
    return (
      <Layout>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('billing')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('quotation')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              报价模板
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <FeesTable action="model" editable />
          </div>
        </Content>
      </Layout>
    );
  }
}
