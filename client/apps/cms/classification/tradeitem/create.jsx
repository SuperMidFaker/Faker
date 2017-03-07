import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Button, Row, Col, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import SiderForm from './forms/siderForm';
import { loadTradeParams, createTradeItem } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ dispatch }) {
  return dispatch(loadTradeParams());
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.loginName,
    repoId: state.cmsTradeitem.repoId,
  }),
  { loadTradeParams, createTradeItem }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class CreateTradeItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    repoId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { repoId, tenantId, loginId, loginName } = this.props;
        const item = this.props.form.getFieldsValue();
        this.props.createTradeItem({
          item, repoId, tenantId, loginId, loginName,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message);
          } else {
            this.context.router.push('/clearance/classification/tradeitem');
          }
        });
      }
    });
  }
  handleCancel = () => {
    this.context.router.goBack();
  }

  render() {
    const { form } = this.props;
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
        <Content className="main-content layout-fixed-width layout-fixed-width-large">
          <Form layout="vertical">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <BasicForm form={form} />
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
