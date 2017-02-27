import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadFormRequire } from 'common/reducers/cmsDelegation';
import DelegationList from '../../common/delegation/list';

// 列表数据的获取由 DelegationList 的componentDidMount 触发获取
function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(
    loadFormRequire(state.account.tenantId, 'export')
  ));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'export' })
export default class ExportDelegationList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <DelegationList ietype="export" {...this.props} />;
  }
}
