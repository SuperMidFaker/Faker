import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Layout, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PAAS_BIZ_OBJECTS, PAAS_PARAM_PREFS, PAAS_TEMPLATES } from 'common/constants';
import NavLink from 'client/components/NavLink';
import { formatMsg } from './message.i18n';

const { SubMenu } = Menu;
const { Sider } = Layout;

@injectIntl
export default class HubSiderMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
    openKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    openKeys: [],
  }
  componentDidMount() {
    this.setState({ openKeys: [this.props.openKey] });
  }
  msg = formatMsg(this.props.intl);
  openSubMenu = (ev) => {
    this.setState({ openKeys: [ev.key] });
  }
  render() {
    return (
      <Sider className="menu-sider">
        <Menu
          mode="inline"
          selectedKeys={[this.props.currentKey]}
          openKeys={this.state.openKeys}
        >
          <SubMenu key="integration" title={<span><Icon type="api" /> {this.msg('integration')}</span>} onTitleClick={this.openSubMenu}>
            <Menu.Item key="apps">
              <NavLink to="/paas/integration/apps">
                {this.msg('appStore')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="installed">
              <NavLink to="/paas/integration/installed">
                {this.msg('installedApps')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="dev">
              <NavLink to="/paas/dev">
                {this.msg('devApps')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="adapter">
              <NavLink to="/paas/adapter">
                {this.msg('dataAdapters')}
              </NavLink>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="bizObject" title={<span><Icon type="profile" /> {this.msg('bizObject')}</span>} onTitleClick={this.openSubMenu}>
            {PAAS_BIZ_OBJECTS.map(obj => (
              <Menu.Item key={obj.key}>
                <NavLink to={obj.link}>
                  {this.msg(obj.key)}
                </NavLink>
              </Menu.Item>))
            }
          </SubMenu>
          <SubMenu key="bizFlow" title={<span><Icon type="fork" /> {this.msg('bizFlow')}</span>} onTitleClick={this.openSubMenu}>
            <Menu.Item key="flowDesigner">
              <NavLink to="/paas/flow">
                {this.msg('flowDesigner')}
              </NavLink>
            </Menu.Item>
            <Menu.Item key="flowMonitor">
              <NavLink to="/paas/flow/monitor">
                {this.msg('flowMonitor')}
              </NavLink>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="paramPrefs" title={<span><Icon type="tool" /> {this.msg('paramPrefs')}</span>} onTitleClick={this.openSubMenu}>
            {PAAS_PARAM_PREFS.map(pref => (
              <Menu.Item key={pref.key}>
                <NavLink to={pref.link}>
                  {this.msg(pref.key)}
                </NavLink>
              </Menu.Item>))
            }
          </SubMenu>
          <SubMenu key="templates" title={<span><Icon type="switcher" /> {this.msg('templates')}</span>} onTitleClick={this.openSubMenu}>
            {PAAS_TEMPLATES.map(temp => (
              <Menu.Item key={temp.key}>
                <NavLink to={temp.link}>
                  {this.msg(temp.key)}
                </NavLink>
              </Menu.Item>))
            }
          </SubMenu>
        </Menu>
      </Sider>);
  }
}
