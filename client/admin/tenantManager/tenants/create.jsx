import React, { PropTypes } from 'react';
import connectNav from 'client/common/decorators/connect-nav';
import TenantForm from './tenantForm';

@connectNav({
  depth: 3,
  text: '新建租户',
  moduleName: 'tenants',
})
export default class Create extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  render() {
    return <TenantForm router={this.context.router} params={this.props.params} />;
  }
}
