import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadBills, loadEntries } from 'common/reducers/cmsDeclare';
import DeclareView from '../../common/docs/view';

function fetchData({ dispatch, params, cookie }) {
  const promises = [];
  promises.push(dispatch(loadBills(cookie, params.delgNo)));
  promises.push(dispatch(loadEntries(cookie, params.delgNo)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
export default class ExportDeclareView extends React.Component {
  static propTypes = {
    params: PropTypes.object,
  }
  render() {
    return <DeclareView params={this.props.params} ietype="export" />;
  }
}
