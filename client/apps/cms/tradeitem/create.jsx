import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Form, Layout, Button, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import BasicForm from './forms/basicForm';
import { loadTradeParams, createTradeItem } from 'common/reducers/cmsTradeitem';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
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
    declunits: state.cmsTradeitem.declunits,
  }),
  { loadTradeParams, createTradeItem }
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
    form: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    repoId: PropTypes.number.isRequired,
    declunits: PropTypes.array,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { repoId, tenantId, loginId, loginName, declunits } = this.props;
        const item = this.props.form.getFieldsValue();
        const gunits = [];
        declunits.forEach((unit) => {
          gunits.push(`gunit_${unit.unit_code}`);
        });
        this.props.createTradeItem({
          item, repoId, tenantId, loginId, loginName, gunits,
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
          <span>{this.msg('newItem')}</span>
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
