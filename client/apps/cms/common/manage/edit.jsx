import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setNavTitle } from 'common/reducers/navbar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import CompRelationForm from './compRelationForm';
import { loadCompRelation } from 'common/reducers/cms';

function fetchData({ dispatch, cookie, params }) {
  return dispatch(loadCompRelation(cookie, {comp_code: params.id}));
}

function goBack(router) {
  router.goBack();
}

@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: '修改关联单位',
    moduleName: 'cms',
    withModuleLayout: false,
    goBackFn: () => goBack(router),
  }));
})
@connectFetch()(fetchData)
@connect(
  state => ({
    code: state.account.code,
    loading: state.cms.loading,
    formData: state.cms.formData
  }),
  { loadCompRelation })
export default class EditCompRelation extends Component {
  static propTypes = {
    loadCompRelation: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  render() {
    const { formData } = this.props;
    return (
      <div className="main-content">
        <div className="page-body">
          <CompRelationForm router={this.context.router} formData={formData}/>
        </div>
      </div>
    );
  }
}
