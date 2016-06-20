import React, { PropTypes } from 'react';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import TenantForm from './tenantForm';

function goBack(router) {
  router.goBack();
}

@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: `新增租户`,
    moduleName: 'tenants',
    withModuleLayout: false,
    goBackFn: () => goBack(router),
  }));
})
export default class Create extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  render() {
    return <TenantForm router={this.context.router} params={this.props.params}/>;
  }
}
