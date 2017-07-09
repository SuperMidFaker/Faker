import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import BillingList from '../common/list';

@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class PayableBillList extends React.Component {
  render() {
    return (
      <BillingList type="payable" />
    );
  }
}
