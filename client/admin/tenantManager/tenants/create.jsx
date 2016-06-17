import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import { getTenantAppList } from
  'common/reducers/tenants';
import TenantForm from './tenantForm';

function fetchData({dispatch}) {
  return dispatch(getTenantAppList());
}

@connectFetch()(fetchData)
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
