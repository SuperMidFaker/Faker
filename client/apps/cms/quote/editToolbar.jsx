import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { message, Icon, Button, Menu, Dropdown } from 'antd';
import { reviseQuote, copyQuote, openPublishModal, openTrialModal } from 'common/reducers/cmsQuote';
import PublishModal from './modals/publishModal';
import TrialModal from './modals/trialModal';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    quoteData: state.cmsQuote.quoteData,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { reviseQuote, copyQuote, openPublishModal, openTrialModal }
)
export default class EditToolbar extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      quote_no: PropTypes.string.isRequired,
      decl_way_code: PropTypes.arrayOf(PropTypes.string).isRequired,
      trans_mode: PropTypes.arrayOf(PropTypes.string).isRequired,
      recv_tenant_name: PropTypes.string.isRequired,
      send_tenant_name: PropTypes.string.isRequired,
      fees: PropTypes.arrayOf(PropTypes.shape({ fee_name: PropTypes.string.isRequired })),
    }),
    form: PropTypes.object.isRequired,
    onFormError: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleSave = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const quoteData = {
          ...this.props.quoteData,
          ...this.props.form.getFieldsValue(),
        };
        if (!quoteData.fees || quoteData.fees.length === 0) {
          return (message.error('无报价费用模板', 5));
        }
        const { loginId, loginName } = this.props;
        const prom = this.props.reviseQuote(quoteData, loginName, loginId);
        prom.then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.info('保存成功', 5);
            // this.context.router.push('/clearance/billing/quote');
          }
        });
      } else {
        this.props.onFormError();
      }
    });
  }
  handlePublish = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        this.props.openPublishModal();
      } else {
        this.props.onFormError();
      }
    });
  }
  handleDropdownClick = (key) => {
    if (key === 'trial') {
      this.props.openTrialModal();
    }
  }
  handleCopy = () => {
    const quoteData = {
      ...this.props.quoteData,
      ...this.props.form.getFieldsValue(),
    };
    quoteData.tenantId = this.props.tenantId;
    quoteData.valid = true;
    quoteData.modifyBy = this.props.loginName;
    quoteData.modifyById = this.props.loginId;
    const prom = this.props.copyQuote(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('复制成功', 5);
        this.context.router.push(`/clearance/quote/edit/${this.props.quoteData.quote_no}`);
      }
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  render() {
    const menu = (
      <Menu onClick={this.handleDropdownClick}>
        <Menu.Item key="trial">{this.msg('trial')}</Menu.Item>
        <Menu.Item key="copyQuote">{this.msg('copy')}</Menu.Item>
      </Menu>
    );
    return (
      <div className="top-bar-tools">
        <Button type="primary" onClick={this.handlePublish}>{this.msg('publish')}</Button>
        <span />
        <Button type="default" onClick={this.handleSave}>{this.msg('save')}</Button>
        <span />
        <Dropdown overlay={menu}>
          <Button type="ghost">
            {this.msg('more')} <Icon type="down" />
          </Button>
        </Dropdown>
        <PublishModal quoteForm={this.props.form} />
        <TrialModal quoteForm={this.props.form} />
      </div>
    );
  }
}
