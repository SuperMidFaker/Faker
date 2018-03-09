import React from 'react';
import { connect } from 'react-redux';
import { Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const MenuItem = Menu.Item;
const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}))
export default class HelpPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  handleOnlineService = () => {
  }
  handleFeedback = () => {
  }
  handleGuide = () => {
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    return (
      <Menu>
        <MenuItem>
          <a role="presentation" onClick={this.handleOnlineService}>
            <Icon type="customerservice" />
            <span>{this.msg('online')}</span>
          </a>
        </MenuItem>
        <MenuItem>
          <a role="presentation" onClick={this.handleGuide}>
            <Icon type="bulb" />
            <span>{this.msg('guide')}</span>
          </a>
        </MenuItem>
      </Menu>);
  }
}
