import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { loadRepos, loadTradeParams } from 'common/reducers/cmsTradeitem';
import { formatMsg } from './message.i18n';

@injectIntl
@connect(
  state => ({
    reposLoaded: state.cmsTradeitem.reposLoaded,
  }),
  { loadRepos, loadTradeParams }
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
    if (!this.props.reposLoaded) {
      this.props.loadRepos();
      this.props.loadTradeParams();
    }
  }
  msg = formatMsg(this.props.intl);
  render() {
    return (
      <div>
        <Menu defaultOpenKeys={['g_task', 'g_hscode']} mode="inline" selectedKeys={[this.props.currentKey]}>
          <Menu.Item key="repoList">
            <NavLink to="/clearance/tradeitem/repo"><Icon type="database" /> {this.msg('repoList')}</NavLink>
          </Menu.Item>
          <Menu.SubMenu key="g_task" title={<span><Icon type="exception" /> {this.msg('taskWorkspace')}</span>}>
            <Menu.Item key="createTask">
              <NavLink to="/clearance/tradeitem/task/create"><Icon type="plus" />{this.msg('createTask')}</NavLink>
            </Menu.Item>
            <Menu.Item key="new">
              <NavLink to="/clearance/tradeitem/task/new">{this.msg('taskNew')}</NavLink>
            </Menu.Item>
            <Menu.Item key="conflict">
              <NavLink to="/clearance/tradeitem/task/conflict">{this.msg('taskConflict')}</NavLink>
            </Menu.Item>
            <Menu.Item key="invalid">
              <NavLink to="/clearance/tradeitem/task/invalid">{this.msg('taskInvalid')}</NavLink>
            </Menu.Item>
            <Menu.Item key="review">
              <NavLink to="/clearance/tradeitem/task/review">{this.msg('taskReview')}</NavLink>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="g_hscode" title={<span><Icon type="book" /> {this.msg('hscodeCustoms')}</span>}>
            <Menu.Item key="hscodeQuery">
              <NavLink to="/clearance/tradeitem/hscode">{this.msg('hscodeQuery')}</NavLink>
            </Menu.Item>
            <Menu.Item key="hscodeSpecial">
              <NavLink to="/clearance/tradeitem/hscode/special">{this.msg('hscodeSpecial')}</NavLink>
            </Menu.Item>
            <Menu.Item key="hscodeChanges">
              <NavLink to="/clearance/tradeitem/hscode/changes">{this.msg('hscodeChanges')}</NavLink>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="audit">
            <NavLink to="/clearance/tradeitem/audit"><Icon type="file-text" /> {this.msg('audit')}</NavLink>
          </Menu.Item>
        </Menu>
      </div>);
  }
}
