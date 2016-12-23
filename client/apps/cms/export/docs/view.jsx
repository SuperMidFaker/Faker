import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBills, loadEntries } from 'common/reducers/cmsDeclare';
import DelegationBillEditor from '../../common/docs/DelegationBillEditor';

function fetchData({ dispatch, params, cookie }) {
  const promises = [];
  promises.push(dispatch(loadBills(cookie, params.billno)));
  promises.push(dispatch(loadEntries(cookie, params.billno)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export' })
export default class ExportDeclareView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DelegationBillEditor ietype="export" params={this.props.params} readonly />;
  }
}
