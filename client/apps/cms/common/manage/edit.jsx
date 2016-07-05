import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { setNavTitle } from 'common/reducers/navbar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import CompRelationForm from './compRelationForm';
import { loadCompRelation } from 'common/reducers/cmsCompRelation';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

function fetchData({ dispatch, cookie, params }) {
  return dispatch(loadCompRelation(cookie, params));
}

function goBack(router) {
  router.goBack();
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    code: state.account.code,
    loading: state.cmsCompRelation.loading,
    formData: state.cmsCompRelation.formData
  }),
  { loadCompRelation })
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: formatContainerMsg(props.intl, 'fixOp') + formatMsg(props.intl, 'relation'),
    moduleName: 'cmsCompRelation_edit',
    withModuleLayout: false,
    goBackFn: () => goBack(router),
  }));
})
export default class EditCompRelation extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf([ 'import', 'export' ]),
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
