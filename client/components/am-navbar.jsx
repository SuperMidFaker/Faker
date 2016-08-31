import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu, Badge, Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from './nav-link';
import AmUserNav from './am-user-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import MessagePrompt from './messagePrompt';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

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
    const moduleName = navTitle.moduleName;
    let amTitleNav = null;
    if (navTitle.depth === 2) {
      amTitleNav = (
        <span>
          {formatMsg(intl, navTitle.text)}
        </span>
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
          <div className="navbar-header">
            <NavLink to="/" className="navbar-toggle">
              <i className="zmdi zmdi-apps" />
            </NavLink>
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
                <Menu.Item key="messages">
                  <Badge count={notReadMessagesNum} overflowCount={99}>
                    <NavLink to="/account/messages">
                    <span className="icon s7-bell" />
                    </NavLink>
                  </Badge>
                </Menu.Item>
                <Menu.Item key="helpdesk">
                  <Tooltip placement="bottom" title="帮助中心">
                    <a rel="noopener noreferrer" href="https://welogix.kf5.com/hc/" target="_blank">
                      <span className="icon s7-help1" />
                    </a>
                  </Tooltip>
                </Menu.Item>
              </Menu>
            </div>
        <MessagePrompt />
      </nav>);
  }
}
