import React from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import CreateBilling from './list/createBilling';

@connectNav({
  depth: 3,
  moduleName: 'bss',
})
export default class Create extends React.Component {
  render() {
    return (
      <CreateBilling />
    );
  }
}
