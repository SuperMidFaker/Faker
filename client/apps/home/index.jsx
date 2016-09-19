import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import AmNavBar from 'client/components/am-navbar';
import NavLink from 'client/components/nav-link';
import ModuleLayout from 'client/components/module-layout';
import { hasPermission } from 'client/common/decorators/withPrivilege';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import './home.less';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    privileges: state.account.privileges,
    logo: state.corpDomain.logo,
    name: state.corpDomain.name,
  }),
  { setNavTitle }
)
export default class Home extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    logo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    privileges: PropTypes.object.isRequired,
    setNavTitle: PropTypes.func.isRequired,
  };
  state = {
    corpMenuLink: null,
  }
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1,
    });
    const corpMenus = ['info', 'personnel', 'organization', 'partners'];
    for (let i = 0; i < corpMenus.length; i++) {
      if (hasPermission(this.props.privileges, {
        module: 'corp', features: corpMenus[i],
      })) {
        this.setState({ corpMenuLink: `/corp/${corpMenus[i]}` });
        break;
      }
    }
  }
  render() {
    const { intl, logo, name } = this.props;
    const tenantMenus = [
      <Menu.Item key="apps">
        <i className="zmdi zmdi-apps" />
        {formatMsg(intl, 'applications')}
      </Menu.Item>,
    ];
    if (this.state.corpMenuLink) {
      tenantMenus.push(
        <Menu.Item key="corp">
          <NavLink to={`${this.state.corpMenuLink}`}>
            <i className="zmdi zmdi-city-alt" />
            {formatMsg(intl, 'corp')}
          </NavLink>
        </Menu.Item>
      );
    }
    return (
      <div className="am-wrapper am-nosidebar-left">
        <AmNavBar />
        <div className="am-content">
          <div className="home-header home-header-bg">
            <div className="tenant-info">
              <div className="tenant-logo " style={{ backgroundImage: `url("${logo}")` }} />
              <h2 className="tenant-name">{name}</h2>
            </div>
            <div className="tenant-nav">
              <Menu defaultSelectedKeys={['apps']} mode="horizontal">
              {tenantMenus}
              </Menu>
            </div>
          </div>
          <div className="home-body">
            <div className="home-body-wrapper">
              <div className="apps-handler-set" />
              <ModuleLayout size="large" />
            </div>
          </div>
        </div>
      </div>);
  }
}
