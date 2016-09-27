import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Menu } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from './nav-link';
import { DEFAULT_MODULES } from '../../common/constants';
import messages from '../common/root.i18n';
import './module-menu.less';
const MenuItem = Menu.Item;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    enabledmods: state.account.modules.map(mod => mod.id),
  })
)
export default class ModuleMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.arrayOf(PropTypes.string).isRequired,
    size: PropTypes.oneOf(['', 'large']),
  };

  render() {
    return (
      <Menu mode="horizontal" className="nav-module">
        {
          this.props.enabledmods.map((mod, idx) => {
            const emod = DEFAULT_MODULES[mod];
            return (
              <MenuItem key={`mod-${idx}`}>
                <NavLink to={emod.url}>
                  {formatMsg(this.props.intl, emod.text)}
                </NavLink>
              </MenuItem>);
          })
        }
      </Menu>);
  }
}
