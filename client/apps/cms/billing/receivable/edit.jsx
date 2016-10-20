import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import BillingFeeList from '../common/billingFeeList';
import { loadFeesByBillingId } from 'common/reducers/cmsBilling';

function fetchData({ dispatch, params }) {
  return dispatch(loadFeesByBillingId({
    billingId: params.billingId,
  }));
}

@connectFetch()(fetchData)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CheckPayableBilling extends React.Component {
  render() {
    return (
      <BillingFeeList type="receivable" operation="edit" />
    );
  }
}
