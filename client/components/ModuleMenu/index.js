import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { locationShape } from 'react-router';
import { intlShape, injectIntl } from 'react-intl';
import { Menu } from 'antd';
import { format } from 'client/common/i18n/helpers';
import NavLink from '../NavLink';
import { DEFAULT_MODULES } from 'common/constants';
import messages from '../../common/root.i18n';
import './index.less';

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
    router: PropTypes.object.isRequired,
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
  componentWillReceiveProps(nextProps) {
    if (this.context.router.location) {
      const pathname = this.context.router.location.pathname;
      for (let i = 0; i < nextProps.enabledmods.length; i++) {
        const mod = nextProps.enabledmods[i];
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
      <Menu
        mode="horizontal"
        selectedKeys={selectedKeys}
        onSelect={this.handleMenuSelect}
        className="nav-module"
      >
        {
          this.props.enabledmods.map((mod) => {
            const emod = DEFAULT_MODULES[mod.id];
            return (
              <MenuItem key={mod.id}>
                <NavLink to={`${emod.url}/`}>
                  {formatMsg(this.props.intl, emod.text)}
                  {
                    emod.status === 'beta' && <sup className={emod.status}>公测版</sup>
                  }
                  {
                    emod.status === 'alpha' && <sup className={emod.status}>内测版</sup>
                  }
                  {
                    emod.status === 'dev' && <sup className={emod.status}>开发中</sup>
                  }
                </NavLink>
              </MenuItem>
            );
          })
        }
      </Menu>);
  }
}
