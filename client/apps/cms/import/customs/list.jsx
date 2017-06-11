import React from 'react';
import PropTypes from 'prop-types';
import connectFetch from 'client/common/decorators/connect-fetch';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { loadCustomsDecls } from 'common/reducers/cmsDeclare';
import List from '../../common/customs/list';

function fetchData({ state, dispatch }) {
  const newfilter = { ...state.cmsDeclare.listFilter, filterNo: '', tradesView: {} };
  return dispatch(loadCustomsDecls({
    ietype: 'import',
    tenantId: state.account.tenantId,
    filter: JSON.stringify(newfilter),
    pageSize: state.cmsDeclare.customslist.pageSize,
    currentPage: state.cmsDeclare.customslist.current,
  }));
}

@connectFetch()(fetchData)
@withPrivilege({ module: 'clearance', feature: 'import' })
export default class ImportDelgDeclsList extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  }
  render() {
    return <List ietype="import" {...this.props} />;
  }
}
