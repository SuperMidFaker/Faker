import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Button, Breadcrumb, Form, Input, Card, Icon, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { uuidWithoutDash } from 'client/common/uuid';
import { installShftzApp } from 'common/reducers/openIntegration';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    shftz: state.openIntegration.shftzApp,
  }),
  { installShftzApp }
)
@Form.create()
export default class InstallSHFTZ extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = { submitting: false }
  msg = formatMsg(this.props.intl)
  handleInstallBtnClick = () => {
    const { tenantId, loginId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const uuid = uuidWithoutDash();
        this.setState({ submitting: true });
        this.props.installShftzApp({
          ...values, uuid, tenant_id: tenantId, login_id: loginId,
        }).then((result) => {
          this.setState({ submitting: false });
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.context.router.goBack();
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, shftz } = this.props;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="shop" /> {this.msg('appsStore')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appSHFTZ')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" loading={this.state.submitting}
              onClick={this.handleInstallBtnClick}
            >
              {this.msg('installApp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form layout="vertical">
            <Card>
              <FormItem label={this.msg('integrationName')}>
                {form.getFieldDecorator('name', {
                  rules: [{ required: true, message: this.msg('integrationNameRequired') }],
                })(<Input />)}
              </FormItem>
            </Card>
            <Card title={this.msg('apiConfig')}>
              <MainForm form={form} shftz={shftz} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
