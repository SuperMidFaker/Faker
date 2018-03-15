import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout, Tabs } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { loadExpsDetails, loadCurrencies } from 'common/reducers/cmsExpense';
import ExpenseDetailTabPane from './tabPanes/expenseDetailTabPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadExpsDetails({
    delgNo: params.delgNo,
  })));
  promises.push(dispatch(loadCurrencies()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    aspect: state.account.aspect,
    loginId: state.account.loginId,
    username: state.account.username,
    expDetails: state.cmsExpense.expDetails,
    expensesLoading: state.cmsExpense.expensesLoading,
    expDetailsReload: state.cmsExpense.expDetailsReload,
  }),
  {}
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
  jumpOut: true,
})
export default class ExpenseDetail extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    fullscreen: true,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  toggleFullscreen = (fullscreen) => {
    this.setState({ fullscreen });
  }
  render() {
    const {
      params, aspect, expDetails, expensesLoading,
    } = this.props;
    let defaultActiveKey;
    if (aspect !== 0) {
      defaultActiveKey = 'receivable';
    } else if (expDetails.pays.length === 0) {
      defaultActiveKey = '';
    } else {
      defaultActiveKey = `payable-${expDetails.pays[0].seller_partner_id}`;
    }
    return (
      <div>
        <PageHeader breadcrumb={[this.msg('expenseDetail'), params.delgNo]} />
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }} onSizeChange={this.toggleFullscreen}>
            <Tabs defaultActiveKey={defaultActiveKey}>
              {aspect !== 0 &&
              <TabPane tab="应收明细" key="receivable" >
                <ExpenseDetailTabPane
                  fullscreen={this.state.fullscreen}
                  dataSource={expDetails.receives}
                  loading={expensesLoading}
                  delgNo={params.delgNo}
                />
              </TabPane>
              }
              {expDetails.pays.map(pay =>
                (<TabPane tab={`应付明细${pay.seller_name}`} key={`payable-${pay.seller_partner_id}`} >
                  <ExpenseDetailTabPane
                    fullscreen={this.state.fullscreen}
                    dataSource={pay.fees}
                    loading={expensesLoading}
                    delgNo={params.delgNo}
                  />
                </TabPane>))}
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
