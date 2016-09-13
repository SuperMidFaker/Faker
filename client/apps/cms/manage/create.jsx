import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { setNavTitle } from 'common/reducers/navbar';
import connectNav from 'client/common/decorators/connect-nav';
import CompRelationForm from './compRelationForm';
import { initialState } from 'common/reducers/cmsCompRelation';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

function goBack(router) {
  router.goBack();
}

@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: `${formatMsg(props.intl, 'new')}${formatMsg(props.intl, 'relation')}`,
    moduleName: 'cmsCompRelation_create',
    withModuleLayout: false,
    goBackFn: () => goBack(router),
  }));
})
export default class CreateCompRelation extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadCompRelations: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  render() {
    return (
      <div className="main-content">
        <div className="page-body">
          <CompRelationForm router={this.context.router} formData={initialState.formData} />
        </div>
      </div>
    );
  }
}
