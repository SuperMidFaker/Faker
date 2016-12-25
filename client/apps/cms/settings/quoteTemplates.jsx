import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Menu, Icon } from 'antd';
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
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }

  msg = key => formatMsg(this.props.intl, key);
  handleClick = (e) => {
    if (e.key === 'quotemodel') {
      this.props.loadQuoteModel(this.props.tenantId);
    }
  }
  render() {
    return (
      <QueueAnim type={['bottom', 'up']}>
        <aside className="side-bar no-top-bar" key="aside">
          <Menu
            onClick={this.handleClick}
            defaultOpenKeys={['integration', 'bizdata']}
            defaultSelectedKeys={['quotemodel']}
            mode="inline"
          >
            <SubMenu key="bizdata" title={<span><Icon type="setting" /><span>业务数据</span></span>}>
              <Menu.Item key="quotemodel">费用模板</Menu.Item>
              <Menu.Item key="9">报关清单</Menu.Item>
            </SubMenu>
            <SubMenu key="integration" title={<span><Icon type="cloud-o" /><span>{this.msg('integration')}</span></span>}>
              <Menu.Item key="1">开放API</Menu.Item>
              <Menu.Item key="2">EDI</Menu.Item>
            </SubMenu>
            <Menu.Item key="notification"><span><Icon type="notification" /><span>通知提醒</span></span></Menu.Item>
          </Menu>
        </aside>
        <div className="main-content with-side-bar no-top-bar" key="main">
          <div className="ant-layout-breadcrumb">
            <Breadcrumb>
              <Breadcrumb.Item href="">
                <Icon type="setting" /> 设置
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                费用模板
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="page-body">
            <FeesTable action="model" editable />
          </div>
        </div>
      </QueueAnim>
    );
  }
}
