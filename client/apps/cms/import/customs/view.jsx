import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadEntry, loadCmsParams } from 'common/reducers/cmsManifest';
import CustomsDeclEditor from '../../common/customs/editor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadEntry(params.billseqno, params.preEntrySeqNo, state.account.tenantId)));
  promises.push(dispatch(loadCmsParams({
    ieType: 'import',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}

@connect(
  state => ({
    customsDeclSpinning: state.cmsManifest.customsDeclLoading,
  })
)
@connectFetch()(fetchData)
export default class ImportCustomsDeclView extends React.Component {
  static propTypes = {
    customsDeclSpinning: PropTypes.bool.isRequired,
  }
  render() {
    const { customsDeclSpinning, params } = this.props;
    // todo remove url's import/export part
    return <CustomsDeclEditor ietype="import" declSpinning={customsDeclSpinning} params={params} />;
  }
}
