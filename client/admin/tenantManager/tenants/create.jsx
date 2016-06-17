import React, { PropTypes } from 'react';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import TenantForm from './tenantForm';

@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: '企业信息',
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: ''
  }));
})
export default class Create extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  render() {
    return <TenantForm router={this.context.router} />;
  }
}
