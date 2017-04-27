import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, Form, Layout, Button, Row, Col, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import SiderForm from './forms/siderForm';
import { addItem, loadRepoSlaves } from 'common/reducers/scvClassification';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
    slaves: state.scvClassification.slaves,
  }),
  { addItem, loadRepoSlaves }
)
@connectNav({
  depth: 3,
  moduleName: 'scv',
})
@Form.create()
export default class CreateTradeItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadRepoSlaves(this.props.tenantId);
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { tenantId, tenantName, loginId, loginName, slaves } = this.props;
        const item = this.props.form.getFieldsValue();
        const broker = slaves.find(tr => tr.tenant_id === item.broker);
        let baseinfo = {
          owner_tenant_id: tenantId,
          owner_name: tenantName,
          creater_login_id: loginId,
          creater_name: loginName,
          contribute_tenant_id: tenantId,
          contribute_tenant_name: tenantName,
        };
        if (broker) {
          baseinfo = { ...baseinfo,
            contribute_tenant_id: broker.tenant_id,
            contribute_tenant_name: broker.name,
          };
        }
        this.props.addItem({ baseinfo, item }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.context.router.push('/scv/products/tradeitem');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form, slaves } = this.props;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('classification')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('tradeItemMaster')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('newItem')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button size="large" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content layout-fixed-width layout-fixed-width-lg">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <BasicForm form={form} action="create" brokers={slaves} />
              </Col>
              <Col sm={24} md={8}>
                <SiderForm form={form} />
              </Col>
            </Row>
          </Form>
        </Content>
      </QueueAnim>
    );
  }
}
