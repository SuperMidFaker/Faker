import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Button, Card, Breadcrumb, Form, Icon, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import InfoItem from 'client/components/InfoItem';
import { loadShftzApp, updateShftzApp } from 'common/reducers/openIntegration';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;

function fetchData({ dispatch, params }) {
  return dispatch(loadShftzApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shftz: state.openIntegration.shftzApp,
  }),
  { updateShftzApp }
)
@Form.create()
export default class ConfigSHFTZ extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = { submitting: false }
  msg = formatMsg(this.props.intl);
  handleSave = () => {
    const { shftz } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ submitting: true });
        this.props.updateShftzApp({ ...values, uuid: shftz.uuid }).then((result) => {
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
              <Icon type="appstore-o" /> {this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appSHFTZ')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {shftz.name}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button type="primary" icon="save" loading={this.state.submitting} onClick={this.handleSave}>
              {this.msg('saveApp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form layout="vertical">
            <Card>
              <InfoItem label={this.msg('integrationName')} field={shftz.name} />
            </Card>
            <Card title={this.msg('apiConfig')}>
              <Row gutter={16}>
                <MainForm form={form} shftz={shftz} />
              </Row>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
