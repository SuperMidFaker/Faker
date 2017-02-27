import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Form, Input, Card, Col, Icon, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    easipass: state.openIntegration.easipassParameter,
  }),
)
@Form.create()
export default class InstallEasipassEDI extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    submitting: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleInstallBtnClick = () => {
    this.handleSave({ accepted: false });
  }
  handleCancelBtnClick = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, submitting } = this.props;
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
          <div className="top-bar-tools" >
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleInstallBtnClick}>
              {this.msg('install')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form vertical>
            <Card>
              <Row gutter={16}>
                <Col sm={24} lg={24}>
                  <FormItem label={this.msg('integrationName')} >
                    {form.getFieldDecorator('integration_name', {
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Card>
            <Card title="Easipass parameters">
              <MainForm form={form} />
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
