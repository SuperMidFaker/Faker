/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import NavLink from '../NavLink';

const MenuItem = Menu.Item;
const formatMsg = format(messages);

@injectIntl
@connect(state => ({
  tenantId: state.account.tenantId,
}))
export default class HelpPopover extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  handleOnlineService = () => {
    this.setState({ visible: true });
  }
  handleFeedback = () => {
    this.setState({ visible: true });
  }
  handleGuide = () => {
    this.setState({ visible: true });
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    return (
          <div className="navbar-popover">
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
            </Menu>
          </div>);
  }
}
