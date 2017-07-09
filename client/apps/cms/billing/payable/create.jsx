import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import CreateBilling from '../common/create';

@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CreatePayableBill extends React.Component {
  render() {
    return (
      <CreateBilling type="payable" />
    );
  }
}
