import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Dropdown, Icon, Menu, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import { toggleNewFeeGroupModal, loadFeeGroups, toggleNewFeeElementModal, loadFeeElements } from 'common/reducers/bssSettings';
import SettingMenu from './menu';
import FeeGroups from './feeGroups';
import FeeElements from './feeElements';
import NewFeeGroupModal from './modals/newFeeGroupModal';
import NewFeeElementModal from './modals/newFeeElementModal';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    feeGroups: state.bssSettings.feeGroups.map(fe => ({
      key: fe.fee_group_code,
      text: `${fe.fee_group_name}`,
      search: `${fe.fee_group_code}${fe.fee_group_name}`,
    })),
  }),
  {
    toggleNewFeeGroupModal, loadFeeGroups, toggleNewFeeElementModal, loadFeeElements,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class Fees extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    feeGroups: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentTab: 'feeItems',
  }
  componentDidMount() {
    this.props.loadFeeElements({ tenantId: this.props.tenantId });
    this.props.loadFeeGroups({ tenantId: this.props.tenantId });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  handleTabChange = (key) => {
    this.setState({ currentTab: key });
  }
  handleCreateFeeGroup = () => {
    this.props.toggleNewFeeGroupModal(true);
  }
  handleCreateFeeItem = () => {
    this.props.toggleNewFeeElementModal(true);
  }
  render() {
    const { currentTab } = this.state;
    const { feeGroups } = this.props;
    const tabList = [
      {
        key: 'feeItems',
        tab: this.msg('feeItems'),
      },
      {
        key: 'feeGroups',
        tab: this.msg('feeGroups'),
      },
    ];
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        <Menu.Item key="import"><Icon type="upload" /> 导入费用元素</Menu.Item>
        <Menu.Item key="export"><Icon type="download" /> 导出费用元素</Menu.Item>
      </Menu>
    );
    return (
      <Layout>
        <Sider width={200} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('settings')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <SettingMenu currentKey="fees" />
          </div>
        </Sider>
        <Layout>
          <PageHeader tabList={tabList} onTabChange={this.handleTabChange}>
            <PageHeader.Actions>
              {currentTab === 'feeItems' && <Button type="primary" icon="plus" onClick={this.handleCreateFeeItem}>
                {this.msg('newFeeElement')}
              </Button>}
              {currentTab === 'feeItems' && <Dropdown overlay={moreMenu}>
                <Button icon="ellipsis" />
              </Dropdown>}
              {currentTab === 'feeGroups' && <Button type="primary" icon="plus" onClick={this.handleCreateFeeGroup}>
                {this.msg('newFeeGroup')}
              </Button>}
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content">
            {currentTab === 'feeItems' && <FeeElements feeGroups={feeGroups} />}
            {currentTab === 'feeGroups' && <FeeGroups />}
          </Content>
          <NewFeeGroupModal />
          <NewFeeElementModal feeGroups={feeGroups} />
        </Layout>
      </Layout>
    );
  }
}
