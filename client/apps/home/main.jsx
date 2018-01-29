import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import HeaderNavBar from 'client/components/HeaderNavBar';
import NavLink from 'client/components/NavLink';
import ModuleLayout from 'client/components/ModuleLayout';
import { Logixon } from 'client/components/FontIcon';
import { findForemostRoute } from 'client/common/decorators/withPrivilege';
import { setNavTitle } from 'common/reducers/navbar';
import { format } from 'client/common/i18n/helpers';
import NotificationDockPanel from './notificationDockPanel';
import PreferenceDockPanel from './preferenceDockPanel';
import ActivitiesDockPanel from './activitiesDockPanel';
import messages from './message.i18n';
import './home.less';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const MenuItem = Menu.Item;

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
    privileges: PropTypes.shape({
      module_id: PropTypes.string,
      feature_id: PropTypes.string,
      action_id: PropTypes.string,
    }).isRequired,
    setNavTitle: PropTypes.func.isRequired,
  };
  state = {
    corpMenuLink: null,
  }
  componentWillMount() {
    this.props.setNavTitle({
      depth: 1,
    });
    const link = findForemostRoute(this.props.privileges, 'corp', [{
      feat: 'info',
      route: 'info',
    }, {
      feat: 'personnel',
      route: 'personnel',
    }, {
      feat: 'organization',
      route: 'organization',
    }, {
      feat: 'partners',
      route: 'partners',
    }]);
    if (link) {
      this.setState({ corpMenuLink: `/corp/${link}` });
    }
  }
  render() {
    const { intl, logo, name } = this.props;
    const tenantMenus = [
      <MenuItem key="home">
        <Logixon type="grid" /> {formatMsg(intl, 'applications')}
      </MenuItem>,
    ];
    if (this.state.corpMenuLink) {
      tenantMenus.push(<MenuItem key="hub">
        <NavLink to="/hub">
          <Logixon type="collab" /> {formatMsg(intl, 'openPlatform')}
        </NavLink>
      </MenuItem>);
      tenantMenus.push(<MenuItem key="corp">
        <NavLink to="/corp">
          <Logixon type="admin" /> {formatMsg(intl, 'corp')}
        </NavLink>
      </MenuItem>);
    }
    return (
      <Layout className="welo-layout-wrapper">
        <Header>
          <HeaderNavBar />
        </Header>
        <Content>
          <div className="home-header home-header-bg">
            <div className="tenant-info">
              <div className="tenant-logo " style={{ backgroundImage: `url("${logo}")` }} />
              <h2 className="tenant-name">{name}</h2>
            </div>
            <div className="tenant-nav">
              <Menu defaultSelectedKeys={['home']} mode="horizontal">
                {tenantMenus}
              </Menu>
            </div>
          </div>
          <div className="home-body" key="body">
            <div className="home-body-wrapper">
              <div className="apps-handler-set" />
              <ModuleLayout size="large" />
            </div>
          </div>
        </Content>
        <NotificationDockPanel />
        <PreferenceDockPanel />
        <ActivitiesDockPanel />
      </Layout>);
  }
}
