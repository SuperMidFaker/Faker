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
          <Menu.Item key="orderparams">
            <NavLink to="/scof/settings/orderparams">
              <Logixon type="rule" /> {this.msg('orderParams')}
            </NavLink>
          </Menu.Item>
        </Menu>
      </div>);
  }
}
