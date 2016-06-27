import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Popover, Menu } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import AmUserNav from './am-user-nav';
import ModuleLayout from './module-layout';
import { loadTranslation } from '../../common/reducers/intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

@injectIntl
@connect(
  state => ({
    curLocale: state.intl.locale,
    navTitle: state.navbar.navTitle
  }),
  { loadTranslation }
)
export default class AmNavBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    curLocale: PropTypes.oneOf(['en', 'zh']),
    navTitle: PropTypes.object.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleClick = (ev) => {
    this.setState({ currentLang: ev.key });
    this.props.loadTranslation(null, ev.key);
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  render() {
    const MenuItem = Menu.Item;
    const { intl, curLocale, navTitle } = this.props;
    const moduleName = navTitle.moduleName;
    let amTitleNav = null;
    if (navTitle.depth === 2) {
      if (navTitle.withModuleLayout) {
        amTitleNav = (
          <Popover placement="bottomLeft" trigger="hover" content={<ModuleLayout />}>
            <a role="button" aria-expanded="false" className="dropdown-toggle">
              <i className={`hidden-xs zmdi zmdi-${moduleName}`}></i>
              {formatMsg(intl, navTitle.text)}
              <span className="angle-down s7-angle-down"></span>
            </a>
          </Popover>
          );
      } else {
        amTitleNav = (
          <a role="button" aria-expanded="false" className="dropdown-toggle">
            <i className={`hidden-xs zmdi zmdi-${moduleName}`} />
            {navTitle.text}
          </a>
        );
      }
    } else if (navTitle.depth === 3) {
      amTitleNav = (
        <a role="button" onClick={navTitle.goBackFn}>
          <i className="zmdi zmdi-arrow-left" />
          {navTitle.text}
        </a>
      );
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top am-top-header module-${moduleName}`}>
        <div className="container-fluid">
          <div className="navbar-header">
            <div className="page-title">
              <span>{ formatGlobalMsg(intl, 'brand') }</span>
            </div>
            <NavLink to="/" className="am-toggle-left-sidebar navbar-toggle collapsed">
              <i className="zmdi zmdi-apps"></i>
            </NavLink>
            <NavLink to="/" className={`navbar-brand module-${moduleName}`} />
          </div>
          <div id="am-navbar-collapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav am-title-nav">
              <li className="dropdown">
              { amTitleNav }
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right am-user-nav">
              <AmUserNav />
            </ul>
            <ul className="nav navbar-nav navbar-right am-icons-nav">
              <Popover placement="bottomLeft" trigger="hover" content={
                <Menu selectedKeys={[curLocale]} onClick={this.handleClick}>
                  <MenuItem key="zh">
                    <span>{ formatGlobalMsg(intl, 'chinese') }</span>
                  </MenuItem>
                  <MenuItem key="en">
                    <span>{ formatGlobalMsg(intl, 'english') }</span>
                  </MenuItem>
                </Menu>
              }>
                <li className="dropdown">
                  <a className="dropdown-toggle" role="button" aria-expanded="false">
                    <span className="icon s7-global"></span>
                  </a>
                </li>
              </Popover>
              <li className="dropdown hidden-xs">
                <a className="dropdown-toggle" aria-expanded="false" role="button" onClick={() => this.handleNavigationTo('/corp/messageList')}>
                  <span className="icon s7-comment"></span>
                </a>
              </li>
              <Popover placement="bottomLeft" trigger="hover" content={
                <Menu>
                  <MenuItem>
                    <span>{ formatGlobalMsg(intl, 'helpdesk') }</span>
                  </MenuItem>
                  <MenuItem>
                    <span>{ formatGlobalMsg(intl, 'onlinecs') }</span>
                  </MenuItem>
                </Menu>
              }>
              <li className="dropdown hidden-xs">
                <a className="dropdown-toggle" role="button" aria-expanded="false">
                  <span className="icon s7-help1"></span>
                </a>
              </li>
              </Popover>
            </ul>
          </div>
        </div>
      </nav>);
  }
}
