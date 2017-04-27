import React, { Component } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadCmsParams, loadTemplateFormVals } from 'common/reducers/cmsManifest';
import BillTemplate from './billTemplate';

function fetchData({ dispatch, state, params }) {
  const promises = [];
  promises.push(dispatch(loadCmsParams({
    ieType: state.cmsManifest.template.ieType,
    tenantId: state.account.tenantId,
  })));
  promises.push(dispatch(loadTemplateFormVals(params.id)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class EditBillTemplate extends Component {
  render() {
    return (<BillTemplate operation="edit" />);
  }
}
