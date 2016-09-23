import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBills, loadEntries, loadCmsParams } from 'common/reducers/cmsDeclare';
import DeclareMake from '../../common/docs/make';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadBills(params.billno)));
  promises.push(dispatch(loadEntries(params.billno)));
  promises.push(dispatch(loadCmsParams({
    ieType: 'import',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import', aciton: 'create' })
export default class ImportDeclareMake extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareMake params={this.props.params} ietype="import" />;
  }
}
