import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { locationShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import { Menu } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from './nav-link';
import { DEFAULT_MODULES } from '../../common/constants';
import messages from '../common/root.i18n';
import './module-menu.less';

const formatMsg = format(messages);
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    enabledmods: state.account.modules,
  })
)
export default class ModuleMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabledmods: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
    })).isRequired,
  }
  static contextTypes = {
    location: locationShape,
  }
  state = {
    selectedKeys: [],
  }
  componentWillMount() {
    if (this.context.location) {
      const pathname = this.context.location.pathname;
      for (let i = 0; i < this.props.enabledmods.length; i++) {
        const mod = this.props.enabledmods[i];
        const emod = DEFAULT_MODULES[mod.id];
        if (pathname.indexOf(emod.url) === 0) {
          this.setState({ selectedKeys: [mod.id] });
          break;
        }
      }
    }
  }
  handleMenuSelect = ({ selectedKeys }) => {
    this.setState({ selectedKeys });
  }
  render() {
    const { selectedKeys } = this.state;
    return (
      <Menu mode="horizontal" className="nav-module"
        selectedKeys={selectedKeys}
        onSelect={this.handleMenuSelect}
      >
        {
          this.props.enabledmods.map((mod) => {
            const emod = DEFAULT_MODULES[mod.id];
            return (
              <MenuItem key={mod.id}>
                <NavLink to={`${emod.url}/`}>
                  {formatMsg(this.props.intl, emod.text)}
                </NavLink>
              </MenuItem>
            );
          })
        }
      </Menu>);
  }
}
