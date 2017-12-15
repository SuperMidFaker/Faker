import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { edit, loadRole } from 'common/reducers/role';
import RoleForm from './editForm';

function fetchData({ dispatch, params }) {
  const roleId = parseInt(params.id, 10);
  return dispatch(loadRole(roleId));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    formData: state.role.formData,
  }),
  { edit }
)
@connectNav({
  depth: 3,
  text: props => props.formData.name,
  moduleName: 'corp',
  lifecycle: 'componentWillReceiveProps',
  until: props => props.formData.name,
})
@withPrivilege({
  module: 'corp', feature: 'role', action: 'edit',
})
export default class RoleEdit extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    formData: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      desc: PropTypes.string,
      privilege: PropTypes.object,
    }).isRequired,
    edit: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  handleSubmit = form => this.props.edit(form)
  render() {
    const { formData } = this.props;
    return (
      <RoleForm formData={formData} onSubmit={this.handleSubmit}
        mode="edit"
      />
    );
  }
}
