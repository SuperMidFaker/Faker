import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadBills, loadEntries, loadCmsParams } from 'common/reducers/cmsDeclare';
import DeclareMake from '../../common/declare/make';

function fetchData({ dispatch, params, cookie, state }) {
  const promises = [];
  promises.push(dispatch(loadBills(cookie, params.delgNo)));
  promises.push(dispatch(loadEntries(cookie, params.delgNo)));
  promises.push(dispatch(loadCmsParams(cookie, {
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
