import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout, Tabs } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import MagicCard from 'client/components/MagicCard';
import { loadBuyerSellerExpenses, loadCurrencies } from 'common/reducers/cmsExpense';
import FeesPane from './tabpane/feesPane';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadBuyerSellerExpenses({
    delgNo: params.delgNo,
  })));
  promises.push(dispatch(loadCurrencies()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
    delgExpenses: state.cmsExpense.delgExpenses,
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
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  render() {
    const {
      params, aspect, delgExpenses, expensesLoading,
    } = this.props;
    let defaultActiveKey;
    if (window.location.search.indexOf('receivable') !== -1) {
      defaultActiveKey = 'receivable';
    } else if (delgExpenses.pays.length === 0) {
      defaultActiveKey = '';
    } else if (window.location.search.indexOf('payable') !== -1) {
      defaultActiveKey = `payable-${delgExpenses.pays[0].seller_partner_id}`;
    }
    return (
      <div>
        <PageHeader breadcrumb={[this.msg('expenseDetail'), params.delgNo]} />
        <Content className="page-content">
          <MagicCard bodyStyle={{ padding: 0 }}>
            <Tabs defaultActiveKey={defaultActiveKey}>
              {aspect !== 0 &&
              <TabPane tab="应收明细" key="receivable" >
                <FeesPane

                  loading={expensesLoading}
                  expense={delgExpenses.receive}
                />
              </TabPane>
              }
              {delgExpenses.pays.map(pay =>
                (<TabPane
                  tab={delgExpenses.pays.length === 1 ? '应付明细' : `应付明细-${pay.seller_name}`}
                  key={`payable-${pay.seller_partner_id}`}
                >
                  <FeesPane

                    loading={expensesLoading}
                    expense={pay}
                  />
                </TabPane>))}
            </Tabs>
          </MagicCard>
        </Content>
      </div>
    );
  }
}
