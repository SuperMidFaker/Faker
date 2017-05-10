import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadEntry, loadCmsParams } from 'common/reducers/cmsManifest';
import CustomsDeclEditor from '../../common/customs/editor';

function fetchData({ dispatch, params, state }) {
  const promises = [];
  promises.push(dispatch(loadEntry(params.billseqno, params.preEntrySeqNo, state.account.tenantId)));
  promises.push(dispatch(loadCmsParams({
    ieType: 'export',
    tenantId: state.account.tenantId,
  })));
  return Promise.all(promises);
}
@connect(
  state => ({
    customsDeclSpinning: state.cmsManifest.customsDeclLoading,
  }),
  { }
)
@connectFetch()(fetchData)
export default class ExportCustomsDeclView extends React.Component {
  static propTypes = {
    customsDeclSpinning: PropTypes.bool.isRequired,
  }
  render() {
    const { customsDeclSpinning, params } = this.props;
    return <CustomsDeclEditor ietype="export" declSpinning={customsDeclSpinning} params={params} />;
  }
}
