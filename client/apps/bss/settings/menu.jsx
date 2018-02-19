import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
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
          <Menu.Item key="fees">
            <NavLink to="/bss/settings/fees">
              <Icon type="tool" /> {this.msg('fees')}
            </NavLink>
          </Menu.Item>
          <Menu.Item key="exchangerates">
            <NavLink to="/bss/settings/exchangerates">
              <Icon type="pay-circle-o" /> {this.msg('exchangeRates')}
            </NavLink>
          </Menu.Item>
        </Menu>
      </div>);
  }
}
