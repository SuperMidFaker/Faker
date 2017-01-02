import React, { PropTypes } from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import TenantForm from './tenantForm';

@connectNav({
  depth: 3,
  moduleName: 'tenants',
})
export default class Edit extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  render() {
    return (
      <TenantForm router={this.context.router} params={this.props.params} />);
  }
}
