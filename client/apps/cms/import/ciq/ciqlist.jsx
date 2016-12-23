import React, { PropTypes } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadCiqDecls } from 'common/reducers/cmsDeclare';
import Ciqlist from '../../common/ciq/ciqlist';

function fetchData({ state, dispatch }) {
  return dispatch(loadCiqDecls({
    ietype: 'import',
    tenantId: state.account.tenantId,
    pageSize: state.cmsDeclare.ciqdeclList.pageSize,
    currentPage: state.cmsDeclare.ciqdeclList.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportCiqDeclsList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <Ciqlist ietype="import" {...this.props} />;
  }
}
