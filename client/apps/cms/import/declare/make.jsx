import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadBills, loadEntries, loadCmsParams } from 'common/reducers/cmsDeclare';
import DeclareMake from '../../common/declare/make';

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
export default class ImportDeclareMake extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareMake params={this.props.params} ietype="import" />;
  }
}
