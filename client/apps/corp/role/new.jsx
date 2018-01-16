import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { clearForm, submit } from 'common/reducers/role';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import RoleForm from './editForm';

const formatMsg = format(messages);
function fetchData({ dispatch }) {
  return dispatch(clearForm());
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    formData: state.role.formData,
  }),
  { submit }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'createTitle'),
  moduleName: 'corp',
})
@withPrivilege({
  module: 'corp', feature: 'role', action: 'create',
})
export default class RoleCreate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formData: PropTypes.shape({
    }).isRequired,
    submit: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  handleSubmit = form => this.props.submit(form)
  render() {
    const { formData } = this.props;
    return (
      <RoleForm
        formData={formData}
        onSubmit={this.handleSubmit}
        mode="new"
      />
    );
  }
}
