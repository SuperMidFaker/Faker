import React from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadEntry, loadCmsParams } from 'common/reducers/cmsManifest';
import CustomsDeclEditor from '../../common/customs/editor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadEntry(params.billseqno, params.preEntrySeqNo, state.account.tenantId)));
  promises.push(dispatch(loadCmsParams({
    ieType: 'export',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export' })
export default class ExportCustomsDeclView extends React.Component {
  render() {
    return <CustomsDeclEditor ietype="export" readonly />;
  }
}
