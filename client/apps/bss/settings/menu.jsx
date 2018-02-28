import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { Logixon } from 'client/components/FontIcon';
import { formatMsg } from './message.i18n';

@injectIntl
export default class SettingMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  render() {
    return (
      <div>
        <Menu mode="inline" selectedKeys={[this.props.currentKey]}>
          <Menu.Item key="preferences">
            <NavLink to="/bss/settings/preferences">
              <Logixon type="rule" /> {this.msg('preferences')}
            </NavLink>
          </Menu.Item>
          <Menu.Item key="fees">
            <NavLink to="/bss/settings/fees">
              <Logixon type="finance-o" /> {this.msg('fees')}
            </NavLink>
          </Menu.Item>
          <Menu.Item key="exchangerates">
            <NavLink to="/bss/settings/exchangerates">
              <Logixon type="exchange-rate" /> {this.msg('exchangeRates')}
            </NavLink>
          </Menu.Item>
          <Menu.Item key="taxrates" disabled>
            <NavLink to="/bss/settings/taxrates">
              <Logixon type="tax-rate" /> {this.msg('taxRates')}
            </NavLink>
          </Menu.Item>
        </Menu>
      </div>);
  }
}
