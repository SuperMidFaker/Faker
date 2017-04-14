import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Breadcrumb, Form, Layout, Button, Row, Col, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import SiderForm from './forms/siderForm';
import { loadPartners } from 'common/reducers/partner';
import { loadScvTradeItem, itemEditedSave } from 'common/reducers/scvTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;

function fetchData({ dispatch, params }) {
  const promises = [];
  const itemId = parseInt(params.id, 10);
  promises.push(dispatch(loadScvTradeItem(itemId)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    itemData: state.scvTradeitem.itemData,
    tenantId: state.account.tenantId,
  }),
  { itemEditedSave, loadPartners }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
@Form.create()
export default class EditTradeItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    itemData: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    brokers: [],
  };
  componentDidMount() {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role,
      businessType,
    }).then((result) => {
      this.setState({ brokers: result.data.filter(item => item.partner_tenant_id !== -1) });
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const value = this.props.form.getFieldsValue();
        const item = { ...this.props.itemData, ...value };
        this.props.itemEditedSave({ item }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
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
              {this.msg('editItem')}
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
                <BasicForm form={form} action="edit" brokers={this.state.brokers} />
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
