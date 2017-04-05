import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { message, Button, Card, Breadcrumb, Form, Icon, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadEasipassApp, updateEasipassApp } from 'common/reducers/openIntegration';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;

function fetchData({ dispatch, params }) {
  return dispatch(loadEasipassApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    easipass: state.openIntegration.easipassApp,
  }),
  { updateEasipassApp }
)
@Form.create()
export default class ConfigEasipassEDI extends React.Component {
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
  handleSaveBtnClick = () => {
    const { easipass } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ submitting: true });
        this.props.updateEasipassApp({ ...values, uuid: easipass.uuid }).then((result) => {
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
    const { form, easipass } = this.props;
    return (
      <div>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> {this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appEasipassEDI')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {easipass.name}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancelBtnClick}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" loading={this.state.submitting} onClick={this.handleSaveBtnClick}>
              {this.msg('saveApp')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width">
          <Form layout="vertical">
            <Card title={this.msg('easipassConfig')}>
              <Row gutter={16}>
                <MainForm form={form} easipass={easipass} />
              </Row>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
