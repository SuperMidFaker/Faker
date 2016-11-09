import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Menu, Icon, Dropdown, Button } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import FeesTable from '../quote/feesTable';
import { loadQuoteModel } from 'common/reducers/cmsQuote';
import withPrivilege from 'client/common/decorators/withPrivilege';

const formatMsg = format(messages);
const SubMenu = Menu.SubMenu;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { loadQuoteModel }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class Settings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadQuoteModel: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    qtModelShow: false,
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }

  msg = key => formatMsg(this.props.intl, key);
  handleClick = (e) => {
    if (e.key === 'quotemodel') {
      this.props.loadQuoteModel(this.props.tenantId);
      this.setState({ qtModelShow: true });
    }
  }
  render() {
    const { qtModelShow } = this.state;
    const menu = (
      <Menu>
        <Menu.Item key="1">第一个菜单项</Menu.Item>
        <Menu.Item key="2">第二个菜单项</Menu.Item>
        <Menu.Item key="3">第三个菜单项</Menu.Item>
      </Menu>
    );

    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="pull-right">
            <Dropdown overlay={menu}>
              <Button type="ghost" style={{ marginLeft: 8 }}>
                更多 <Icon type="down" />
              </Button>
            </Dropdown>
          </div>
          <span>设置</span>
        </header>
        <aside className="side-bar" key="aside">
          <Menu
            onClick={this.handleClick}
            defaultOpenKeys={['sub1', 'sub2']}
            mode="inline"
          >
            <SubMenu key="sub1" title={<span><Icon type="cloud-o" /><span>{this.msg('integration')}</span></span>}>
              <Menu.Item key="1">开放API</Menu.Item>
              <Menu.Item key="2">EDI</Menu.Item>
            </SubMenu>
            <Menu.Item key="5"><span><Icon type="notification" /><span>通知提醒</span></span></Menu.Item>
            <SubMenu key="sub2" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
              <Menu.Item key="9">报关清单</Menu.Item>
              <Menu.Item key="quotemodel">报价模板</Menu.Item>
            </SubMenu>
          </Menu>
        </aside>
        <div className="main-content with-side-bar" key="main">
          <div className="page-body">
            { qtModelShow && <FeesTable action="model" editable />}
          </div>
        </div>
      </QueueAnim>
    );
  }
}
