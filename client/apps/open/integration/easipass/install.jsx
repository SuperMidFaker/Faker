import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { message, Button, Breadcrumb, Form, Input, Card, Col, Icon, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { uuidWithoutDash } from 'client/common/uuid';
import { installEasipassApp } from 'common/reducers/openIntegration';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    customsCode: state.account.customsCode,
  }),
  { installEasipassApp }
)
@Form.create()
export default class InstallEasipassEDI extends React.Component {
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
  defaultEasipassConfig = {
    send_trade_code: this.props.customsCode,
    receive_trade_code: this.props.customsCode,
    send_dir: 'send',
    recv_dir: 'recv',
  }
  handleInstallBtnClick = () => {
    const { tenantId } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const uuid = uuidWithoutDash();
        this.setState({ submitting: true });
        this.props.installEasipassApp({ ...values, uuid, app_type: 'EASIPASS', tenant_id: tenantId }).then((result) => {
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
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }

  render() {
    const { form } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> {this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appsStore')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appEasipassEDI')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" loading={this.state.submitting}
              onClick={this.handleInstallBtnClick}
            >
              {this.msg('installApp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form layout="vertical">
            <Card>
              <Row gutter={16}>
                <Col sm={24} lg={24}>
                  <FormItem label={this.msg('integrationName')}>
                    {form.getFieldDecorator('name', {
                      rules: [{ required: true, message: this.msg('integrationNameRequired') }],
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Card>
            <Card title={this.msg('easipassConfig')}>
              <MainForm form={form} easipass={this.defaultEasipassConfig} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
