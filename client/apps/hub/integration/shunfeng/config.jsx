import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { message, Button, Card, Breadcrumb, Form, Icon, Layout, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import InfoItem from 'client/components/InfoItem';
import { loadShunfengApp, updateShunfengApp } from 'common/reducers/openIntegration';
import MainForm from './forms/mainForm';
import { formatMsg } from '../message.i18n';

const { Header, Content } = Layout;

function fetchData({ dispatch, params }) {
  return dispatch(loadShunfengApp(params.uuid));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    shunfeng: state.openIntegration.shunfeng,
  }),
  { updateShunfengApp }
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
    const { shunfeng } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ submitting: true });
        this.props.updateShunfengApp({ ...values, uuid: shunfeng.uuid }).then((result) => {
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
    const { form, shunfeng } = this.props;
    return (
      <div>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Icon type="appstore-o" /> {this.msg('integration')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('appShunfeng')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {shunfeng.name}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
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
            <Card>
              <InfoItem label={this.msg('integrationName')} field={shunfeng.name} />
            </Card>
            <Card title={this.msg('config')}>
              <Row gutter={16}>
                <MainForm form={form} config={shunfeng} />
              </Row>
            </Card>
          </Form>
        </Content>
      </div>
    );
  }
}
