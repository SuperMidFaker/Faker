import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Breadcrumb, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import PageHeader from 'client/components/PageHeader';
import { clearForm, submit } from 'common/reducers/role';
import { formatMsg } from '../message.i18n';
import RolePrivilegesForm from './form/rolePrivilegesForm';

const { Content } = Layout;

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
  msg = formatMsg(this.props.intl);
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
          <RolePrivilegesForm formData={formData} mode="create" />
        </Content>
      </Layout>
    );
  }
}
