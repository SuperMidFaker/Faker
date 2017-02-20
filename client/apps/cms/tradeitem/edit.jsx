import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Form, Layout, Button, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import { loadTradeParams, loadTradeItem, itemEditedSave } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ dispatch, params }) {
  const promises = [];
  const itemId = parseInt(params.id, 10);
  promises.push(dispatch(loadTradeParams()));
  promises.push(dispatch(loadTradeItem(itemId)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    itemData: state.cmsTradeitem.itemData,
    declunits: state.cmsTradeitem.declunits,
    tenantId: state.account.tenantId,
  }),
  { itemEditedSave }
)
@connectNav({
  depth: 3,
  text: '物料管理',
  moduleName: 'clearance',
})
@Form.create()
export default class AcceptanceCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    itemData: PropTypes.object,
    declunits: PropTypes.array,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const value = this.props.form.getFieldsValue();
        const item = { ...this.props.itemData, ...value };
        const gunits = [];
        this.props.declunits.forEach((unit) => {
          gunits.push(`gunit_${unit.unit_code}`);
        });
        this.props.itemEditedSave({
          item, gunits, tenantId: this.props.tenantId,
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
          <span>{this.msg('editItem')}</span>
          <div className="top-bar-tools">
            <Button size="large" type="ghost" onClick={this.handleCancel}>
              {this.msg('cancel')}
            </Button>
            <Button size="large" type="primary" icon="save" onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body card-wrapper">
            <Form horizontal>
              <BasicForm form={form} />
            </Form>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
