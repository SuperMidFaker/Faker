import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Badge, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import AmUserNav from './am-user-nav';
import { loadTranslation } from '../../common/reducers/intl';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import MessagePrompt from './messagePrompt';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const SubMenu = Menu.SubMenu;

@injectIntl
@connect(
  state => ({
    curLocale: state.intl.locale,
    navTitle: state.navbar.navTitle,
    notReadMessagesNum: state.corps.notReadMessagesNum,
  }),
  { loadTranslation }
)
export default class AmNavBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadTranslation: PropTypes.func.isRequired,
    curLocale: PropTypes.oneOf(['en', 'zh']),
    navTitle: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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
    const { intl, curLocale, navTitle, notReadMessagesNum } = this.props;
    const moduleName = navTitle.moduleName;
    let amTitleNav = null;
    if (navTitle.depth === 2) {
      amTitleNav = (
        <a role="button" aria-expanded="false" className="dropdown-toggle">
          {formatMsg(intl, navTitle.text)}
        </a>
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
        <Tooltip placement="right" title={formatGlobalMsg(intl, 'goHome')}>
          <span><NavLink to="/" className={`navbar-brand module-${moduleName}`} /></span>
        </Tooltip>
      );
    }
    return (
      <nav className={`navbar navbar-default navbar-fixed-top am-top-header module-${moduleName}`}>
        <div className="container-fluid">
          <div className="navbar-header">
            <div className="page-title">
              <span>{formatGlobalMsg(intl, 'brand')}</span>
            </div>
            <NavLink to="/" className="am-toggle-left-sidebar navbar-toggle collapsed">
              <i className="zmdi zmdi-apps"></i>
            </NavLink>
            {brandNav}
          </div>
          <div id="am-navbar-collapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav am-title-nav">
              <li className="dropdown">
              {amTitleNav}
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right am-user-nav">
              <AmUserNav />
            </ul>
            <ul className="nav navbar-nav navbar-right am-icons-nav">
              <Menu mode="horizontal">
                {/* <SubMenu selectedKeys={[curLocale]} onClick={this.handleClick} title={<span className="icon s7-global"></span>}>
                    <MenuItem key="zh">
                      <span>{formatGlobalMsg(intl, 'chinese')}</span>
                    </MenuItem>
                    <MenuItem key="en">
                      <span>{formatGlobalMsg(intl, 'english')}</span>
                    </MenuItem>
                </SubMenu>*/}
                <Menu.Item key="messages">
                  <Badge count={notReadMessagesNum} overflowCount={99}>
                    <NavLink to="/account/messages">
                    <span className="icon s7-bell"></span>
                    </NavLink>
                  </Badge>
                </Menu.Item>
                <Menu.Item key="helpdesk">
                  <Tooltip placement="bottom" title="帮助中心">
                    <a href="https://welogix.kf5.com/hc/" target="_blank">
                      <span className="icon s7-help1"></span>
                    </a>
                  </Tooltip>
                </Menu.Item>
              </Menu>
            </ul>
          </div>
        </div>
        <MessagePrompt />
      </nav>);
  }
}
