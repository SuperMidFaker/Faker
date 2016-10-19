import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import CreateBilling from '../common/createBilling';

@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class CreateReceivableBilling extends React.Component {
  render() {
    return (
      <CreateBilling type="receivable" />
    );
  }
}
