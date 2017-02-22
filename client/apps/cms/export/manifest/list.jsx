import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDelgBill } from 'common/reducers/cmsManifest';
import ManifestList from '../../common/manifest/list';

function fetchData({ state, dispatch }) {
  return dispatch(loadDelgBill({
    ietype: 'export',
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    filter: JSON.stringify(state.cmsManifest.listFilter),
    pageSize: state.cmsManifest.delgBillList.pageSize,
    currentPage: state.cmsManifest.delgBillList.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export' })
export default class ImportManifestList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <ManifestList ietype="export" {...this.props} />;
  }
}
