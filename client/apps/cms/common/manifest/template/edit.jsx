import React, { Component } from 'react';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { loadTemplateFormVals } from 'common/reducers/cmsManifest';
import ManifestTemplate from './manifestTemplate';

function fetchData({ dispatch, params }) {
  return dispatch(loadTemplateFormVals(params.id));
}

@connectFetch()(fetchData)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class EditManifestTemplate extends Component {
  render() {
    return (<ManifestTemplate operation="edit" />);
  }
}
