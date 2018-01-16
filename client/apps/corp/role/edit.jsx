import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { Button, Breadcrumb, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import PageHeader from 'client/components/PageHeader';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { edit, loadRole } from 'common/reducers/role';
import { formatMsg } from '../message.i18n';
import RoleForm from './editForm';

const { Content } = Layout;

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
  msg = formatMsg(this.props.intl);
  handleSubmit = form => this.props.edit(form)
  handleClose = () => {
    this.context.router.goBack();
  }
  render() {
    const { formData } = this.props;
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('corpRole')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {formData.name}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button icon="close" onClick={this.handleClose}>
              {this.msg('close')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content layout-fixed-width">
          <RoleForm formData={formData} mode="edit" />
        </Content>
      </Layout>
    );
  }
}
