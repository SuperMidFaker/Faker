import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadBills, loadEntries } from 'common/reducers/cmsDeclare';
import DeclareView from '../../common/docs/view';

function fetchData({ dispatch, params }) {
  const promises = [];
  promises.push(dispatch(loadBills(params.billno)));
  promises.push(dispatch(loadEntries(params.billno)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportDeclareView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareView params={this.props.params} ietype="import" />;
  }
}
