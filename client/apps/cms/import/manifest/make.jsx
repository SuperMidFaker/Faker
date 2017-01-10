import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBill, loadCmsParams } from 'common/reducers/cmsManifest';
import ManifestEditor from '../../common/manifest/ManifestEditor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadBill(params.billno)));
  promises.push(dispatch(loadCmsParams({
    ieType: 'import',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import', aciton: 'create' })
export default class ImportManifestMake extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <ManifestEditor ietype="import" params={this.props.params} />;
  }
}
