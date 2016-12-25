import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBills, loadEntries, loadCmsParams } from 'common/reducers/cmsDeclare';
import ManifestEditor from '../../common/manifest/ManifestEditor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadBills(params.billno)));
  promises.push(dispatch(loadEntries(params.billno)));
  promises.push(dispatch(loadCmsParams({
    ieType: 'export',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export', action: 'create' })
export default class ExportManifestMake extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <ManifestEditor ietype="export" params={this.props.params} />;
  }
}
