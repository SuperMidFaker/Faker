import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Badge, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import AmUserNav from './am-user-nav';
import { format } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import MessagePrompt from './messagePrompt';
import ModuleMenu from './module-menu';

const formatGlobalMsg = format(globalMessages);
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
    notReadMessagesNum: state.corps.notReadMessagesNum,
  }),
)
export default class AmNavBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navTitle: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  render() {
    const { intl, navTitle, notReadMessagesNum } = this.props;
    let moduleName = navTitle.moduleName;
    let amTitleNav = null;
    if (navTitle.depth === 1) {
      moduleName = '';
    } else if (navTitle.depth === 2) {
      amTitleNav = (
        <ModuleMenu />
      );
    } else if (navTitle.depth === 3) {
      amTitleNav = (
        <a role="button" onClick={navTitle.goBackFn}>
          <i className="zmdi zmdi-arrow-left" />
          {navTitle.text}
        </a>
      );
    }
    let brandNav = (<NavLink to="/" className={'navbar-brand'} />);
    if (navTitle.depth !== 1) {
      brandNav = (
        <NavLink to="/" className="navbar-toggle">
          <i className="zmdi zmdi-apps" />
        </NavLink>
      );
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top am-top-header module-${moduleName}`}>
          <div className="navbar-header">
            {brandNav}
          </div>
            <div className="navbar-title">
              {amTitleNav}
            </div>
            <div className="nav navbar-right">
              <AmUserNav />
            </div>
            <div className="nav navbar-right">
              <Menu mode="horizontal">
                <MenuItem key="messages">
                  <Badge count={notReadMessagesNum} overflowCount={99}>
                    <NavLink to="/my/messages">
                    <span className="icon s7-bell" />
                    </NavLink>
                  </Badge>
                </MenuItem>
                <MenuItem key="helpdesk">
                  <Tooltip placement="bottom" title="帮助中心">
                    <a rel="noopener noreferrer" href="https://welogix.kf5.com/hc/" target="_blank">
                      <span className="icon s7-help1" />
                    </a>
                  </Tooltip>
                </MenuItem>
              </Menu>
            </div>
        <MessagePrompt />
      </nav>);
  }
}
