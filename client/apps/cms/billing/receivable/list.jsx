import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import BillingList from '../common/billingList';

@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class RecievableList extends React.Component {
  render() {
    return (
      <BillingList type="receivable" />
    );
  }
}
