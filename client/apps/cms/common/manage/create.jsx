import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import CompRelationForm from './compRelationForm';

function goBack(router) {
  router.goBack();
}

@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: '新建关联单位',
    moduleName: 'cms',
    withModuleLayout: false,
    goBackFn: () => goBack(router),
  }));
})

@connect(
  state => ({
    code: state.account.code,
    loading: state.cms.loading,
    formData: state.cms.list
  }),
  { })
export default class CreateCompRelation extends Component {
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
