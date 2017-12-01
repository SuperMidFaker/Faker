import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { format } from 'client/common/i18n/helpers';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    listFilter: state.cwmShFtz.listFilter,
  }),
  { switchDefaultWhse }
)
export default class ModuleMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { currentKey } = this.props;
    return (
      <div>
        <Menu
          defaultSelectedKeys={[currentKey]}
          defaultOpenKeys={['g_task', 'g_hscode']}
          mode="inline"
        >
          <Menu.Item key="repoList">
            <NavLink to="/clearance/tradeitem/repo"><Icon type="database" /> {this.msg('repoList')}</NavLink>
          </Menu.Item>
          <Menu.SubMenu key="g_task" title={<span><Icon type="exception" /> {this.msg('tradeItemTask')}</span>}>
            <Menu.Item key="unclassified">
              <NavLink to="/clearance/tradeitem/task/unclassified">{this.msg('taskUnclassified')}</NavLink>
            </Menu.Item>
            <Menu.Item key="conflict">
              <NavLink to="/clearance/tradeitem/task/conflict">{this.msg('taskConflict')}</NavLink>
            </Menu.Item>
            <Menu.Item key="pending">
              <NavLink to="/clearance/tradeitem/task/pending">{this.msg('taskPending')}</NavLink>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="g_hscode" title={<span><Icon type="book" /> {this.msg('hscode')}</span>}>
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
          <Menu.Item key="config">
            <NavLink to="/clearance/tradeitem/config"><Icon type="tool" /> {this.msg('config')}</NavLink>
          </Menu.Item>
          <Menu.Item key="audit">
            <NavLink to="/clearance/tradeitem/audit"><Icon type="file-text" /> {this.msg('audit')}</NavLink>
          </Menu.Item>
        </Menu>
      </div>);
  }
}
