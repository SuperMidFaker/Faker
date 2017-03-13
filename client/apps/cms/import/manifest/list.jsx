import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadDelgBill } from 'common/reducers/cmsManifest';
import ManifestList from '../../common/manifest/list';

function fetchData({ state, dispatch }) {
  const newfilter = { ...state.cmsManifest.listFilter, filterNo: '' };
  return dispatch(loadDelgBill({
    ietype: 'import',
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    filter: JSON.stringify(newfilter),
    pageSize: state.cmsManifest.delgBillList.pageSize,
    currentPage: state.cmsManifest.delgBillList.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportManifestList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <ManifestList ietype="import" {...this.props} />;
  }
}
