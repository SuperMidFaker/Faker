import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import BillingFeeList from './list/billingFeeList';
import { loadFeesByBillingId } from 'common/reducers/crmBilling';

function fetchData({ dispatch, params }) {
  return dispatch(loadFeesByBillingId({
    billingId: params.billingId,
  }));
}

@connectFetch()(fetchData)
@connectNav({
  depth: 3,
  moduleName: 'bss',
})
export default class Check extends React.Component {
  render() {
    return (
      <BillingFeeList operation="edit" />
    );
  }
}
