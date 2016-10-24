import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import BillingFeeList from '../common/billingFeeList';
import { loadFeesByBillingId } from 'common/reducers/transportBilling';

function fetchData({ dispatch, params }) {
  return dispatch(loadFeesByBillingId({
    billingId: params.billingId,
  }));
}

@connectFetch()(fetchData)
@connectNav({
  depth: 3,
  moduleName: 'transport',
})
export default class CheckPayableBilling extends React.Component {
  render() {
    return (
      <BillingFeeList type="payable" operation="edit" />
    );
  }
}
