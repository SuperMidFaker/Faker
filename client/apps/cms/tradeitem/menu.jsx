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
  msg = formatMsg(this.props.intl);
  render() {
    const { workspaceStat } = this.props;
    return (
      <div>
        <Menu defaultOpenKeys={['g_task', 'g_hscode']} mode="inline" selectedKeys={[this.props.currentKey]}>
          <Menu.Item key="repoList">
            <NavLink to="/clearance/tradeitem/repo"><Icon type="database" /> {this.msg('repoList')}</NavLink>
          </Menu.Item>
          <Menu.SubMenu key="g_task" title={<span><Icon type="profile" /> {this.msg('workspace')}</span>}>
            <Menu.Item key="task">
              <NavLink to="/clearance/tradeitem/workspace/tasks"><Badge count={workspaceStat.task.count}>{this.msg('taskList')}</Badge></NavLink>
            </Menu.Item>
            <Menu.Item key="emerge">
              <NavLink to="/clearance/tradeitem/workspace/emerges"><Badge count={workspaceStat.emerge.count}>{this.msg('taskNew')}</Badge></NavLink>
            </Menu.Item>
            <Menu.Item key="conflict">
              <NavLink to="/clearance/tradeitem/workspace/conflicts"><Badge count={workspaceStat.conflict.count}>{this.msg('taskConflict')}</Badge></NavLink>
            </Menu.Item>
            <Menu.Item key="invalid">
              <NavLink to="/clearance/tradeitem/workspace/invalids"><Badge count={workspaceStat.invalid.count}>{this.msg('taskInvalid')}</Badge></NavLink>
            </Menu.Item>
            <Menu.Item key="pending">
              <NavLink to="/clearance/tradeitem/workspace/pendings"><Badge count={workspaceStat.pending.count}>{this.msg('taskReview')}</Badge></NavLink>
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
