import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Badge, Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { loadRepos, loadTradeParams, loadWorkspaceStat } from 'common/reducers/cmsTradeitem';
import { formatMsg } from './message.i18n';

@injectIntl
@connect(
  state => ({
    reposLoaded: state.cmsTradeitem.reposLoaded,
    workspaceStat: state.cmsTradeitem.workspaceStat,
    wsStatReload: state.cmsTradeitem.wsStatReload,
  }),
  { loadRepos, loadTradeParams, loadWorkspaceStat }
)
export default class ModuleMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadRepos();
    this.props.loadWorkspaceStat();
    if (!this.props.reposLoaded) {
      this.props.loadTradeParams();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.wsStatReload !== this.props.wsStatReload && nextProps.wsStatReload) {
      this.props.loadWorkspaceStat();
    }
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { workspaceStat } = this.props;
    return (
      <div>
        <Menu defaultOpenKeys={['g_workspace', 'g_hscode']} mode="inline" selectedKeys={[this.props.currentKey]}>
          <Menu.Item key="repoList">
            <NavLink to="/clearance/tradeitem/repo"><Icon type="database" /> {this.msg('repoList')}</NavLink>
          </Menu.Item>
          <Menu.Item key="taskList">
            <NavLink to="/clearance/tradeitem/task">
              <Icon type="profile" /> {this.msg('taskList')}
              <Badge count={workspaceStat.task.count} className="menu-badge" style={{ backgroundColor: '#1890ff' }} />
            </NavLink>
          </Menu.Item>
          <Menu.SubMenu key="g_workspace" title={<span><Icon type="schedule" /> {this.msg('workspace')}</span>}>
            <Menu.Item key="emerge">
              <NavLink to="/clearance/tradeitem/workspace/emerges">
                {this.msg('taskNew')}
                <Badge count={workspaceStat.emerge.count} className="menu-badge" style={{ backgroundColor: '#52c41a' }} />
              </NavLink>
            </Menu.Item>
            <Menu.Item key="conflict">
              <NavLink to="/clearance/tradeitem/workspace/conflicts">
                {this.msg('taskConflict')}
                <Badge count={workspaceStat.conflict.count} className="menu-badge" />
              </NavLink>
            </Menu.Item>
            <Menu.Item key="invalid">
              <NavLink to="/clearance/tradeitem/workspace/invalids">
                {this.msg('taskInvalid')}
                <Badge count={workspaceStat.invalid.count} className="menu-badge" />
              </NavLink>
            </Menu.Item>
            <Menu.Item key="pending">
              <NavLink to="/clearance/tradeitem/workspace/pendings">
                {this.msg('taskReview')}
                <Badge count={workspaceStat.pending.count} className="menu-badge" style={{ backgroundColor: '#1890ff' }} />
              </NavLink>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="g_hscode" title={<span><Icon type="book" /> {this.msg('hscodeCustoms')}</span>}>
            <Menu.Item key="hscodeQuery">
              <NavLink to="/clearance/tradeitem/hscode">{this.msg('hscodeQuery')}</NavLink>
            </Menu.Item>
            <Menu.Item key="hscodeSpecial">
              <NavLink to="/clearance/tradeitem/hscode/special">{this.msg('hscodeSpecial')}</NavLink>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </div>);
  }
}
