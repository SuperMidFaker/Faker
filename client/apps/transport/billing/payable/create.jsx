import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import CreateBilling from '../common/createBilling';

@connectNav({
  depth: 3,
  moduleName: 'transport',
})
export default class CreatePayableBilling extends React.Component {
  render() {
    return (
      <CreateBilling type="payable" />
    );
  }
}
