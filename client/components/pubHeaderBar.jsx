import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { routerShape } from 'react-router';
import { Tooltip } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { logout } from 'common/reducers/account';
import { goBackNav } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import NavLink from './NavLink';
import { MdIcon } from './FontIcon';
import { loadTranslation, changeUserLocale, showPreferenceDock } from '../../common/reducers/preference';
import { showActivitiesDock } from '../../common/reducers/activities';
import messages from './message.i18n';
import './HeaderNavBar/index.less';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    navTitle: state.navbar.navTitle,
    corpLogo: state.corpDomain.logo,
    corpName: state.corpDomain.name,
  }),
  {
    logout, loadTranslation, changeUserLocale, goBackNav, showPreferenceDock, showActivitiesDock,
  }
)
export default class PubHeaderBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navTitle: PropTypes.shape({
      depth: PropTypes.number.isRequired,
      stack: PropTypes.number.isRequired,
      moduleName: PropTypes.string,
    }).isRequired,
  }
  static contextTypes = {
    router: routerShape.isRequired,
  }
  handleGoDepth2 = () => {
    this.context.router.go(-this.props.navTitle.stack);
  }
  handleGoBack = () => {
    this.context.router.goBack();
    this.props.goBackNav();
    // router.goBack on initial login next *TODO* history index
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values);
  render() {
    const { corpLogo, corpName, navTitle } = this.props;

    let brandNav = (<NavLink to="/" className="navbar-brand" />);
    if (navTitle.depth === 2) {
      brandNav = (
        <NavLink to="/" className="navbar-toggle">
          <MdIcon type="home" />
        </NavLink>
      );
    } else if (navTitle.depth === 3) {
      brandNav = [(
        <Tooltip placement="bottomLeft" arrowPointAtCenter mouseEnterDelay={2} title={this.msg('back')} key="back" >
          <a role="presentation" className="navbar-anchor" key="back" onClick={this.handleGoBack}>
            <MdIcon type="arrow-left" />
          </a>
        </Tooltip>)];
      if (navTitle.jumpOut && this.props.navTitle.stack > 1) {
        brandNav.push(<Tooltip placement="bottomLeft" arrowPointAtCenter mouseEnterDelay={2} title={this.msg('close')} key="close" >
          <a role="presentation" className="navbar-anchor" key="close" onClick={this.handleGoDepth2}>
            <MdIcon type="close" />
          </a>
        </Tooltip>);
      }
    }
    return (
      <nav className={`navbar navbar-fixed-top layout-header module-${navTitle.moduleName}`}>
        <div className="navbar-header">
          {brandNav}
        </div>
        <div className="navbar-corp">
          <span className="logo" style={{ backgroundImage: `url("${corpLogo}")` }} />
          {corpName}
        </div>
      </nav>);
  }
}
