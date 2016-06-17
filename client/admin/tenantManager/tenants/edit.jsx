import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import { loadTenantForm } from 'common/reducers/tenants';
import './tenant.less';
import TenantForm from './tenantForm';


function fetchData({ dispatch, cookie, params }) {
  const corpId = params.id;
  return [dispatch(loadTenantForm(cookie, corpId))];
}

@connectFetch()(fetchData)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: '企业信息',
    moduleName: 'tenants',
    withModuleLayout: false,
    goBackFn: ''
  }));
})
export default class Edit extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  render() {
    return (
      <TenantForm router={this.context.router} />);
  }
}
