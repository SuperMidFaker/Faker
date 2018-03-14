import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Breadcrumb, Dropdown, Icon, Menu, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import ImportDataPanel from 'client/components/ImportDataPanel';
import { createFilename } from 'client/util/dataTransform';
import { toggleNewFeeGroupModal, loadFeeGroups, toggleNewFeeElementModal, loadFeeElements } from 'common/reducers/bssFeeSettings';
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
    feeGroupslist: state.bssFeeSettings.feeGroupslist,
    gplistFilter: state.bssFeeSettings.gplistFilter,
    feeElementlist: state.bssFeeSettings.feeElementlist,
    ellistFilter: state.bssFeeSettings.ellistFilter,
    feeGroups: state.bssFeeSettings.feeGroupslist.data.map(fe => ({
      key: fe.fee_group_code,
      text: `${fe.fee_group_name}`,
    })),
  }),
  {
    toggleNewFeeGroupModal,
    toggleNewFeeElementModal,
    loadFeeGroups,
    loadFeeElements,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class Fees extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    currentTab: 'feeItems',
    importPanelVisible: false,
  }
  componentWillMount() {
    this.handleLoadGroups();
    this.handleLoadElements();
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
  handleLoadGroups = () => {
    this.props.loadFeeGroups({
      filter: JSON.stringify(this.props.gplistFilter),
      pageSize: this.props.feeGroupslist.pageSize,
      current: this.props.feeGroupslist.current,
    });
  }
  handleLoadElements = () => {
    this.props.loadFeeElements({
      filter: JSON.stringify(this.props.ellistFilter),
      pageSize: this.props.feeElementlist.pageSize,
      current: this.props.feeElementlist.current,
    });
  }
  handleFeesUpload = () => {
    this.setState({ importPanelVisible: false });
    this.handleLoadElements();
  }
  handleMoreMenuClick = (e) => {
    if (e.key === 'import') {
      this.setState({
        importPanelVisible: true,
      });
    } else {
      window.open(`${API_ROOTS.default}v1/bss/settings/fees/export/${createFilename('fees')}.xlsx`);
    }
  }
  render() {
    const { currentTab } = this.state;
    const { feeGroups } = this.props;
    const menus = [
      {
        key: 'feeItems',
        menu: this.msg('feeItems'),
        default: true,
      },
      {
        key: 'feeGroups',
        menu: this.msg('feeGroups'),
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
          <PageHeader menus={menus} onTabChange={this.handleTabChange}>
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
            {currentTab === 'feeItems' && <FeeElements feeGroups={feeGroups} reload={this.handleLoadElements} />}
            {currentTab === 'feeGroups' && <FeeGroups reload={this.handleLoadGroups} />}
          </Content>
          <NewFeeGroupModal reload={this.handleLoadGroups} />
          <NewFeeElementModal feeGroups={feeGroups} reload={this.handleLoadElements} />
          <ImportDataPanel
            adaptors={null}
            title="费用元素导入"
            visible={this.state.importPanelVisible}
            endpoint={`${API_ROOTS.default}v1/bss/settings/fees/import`}
            formData={{ }}
            onClose={() => { this.setState({ importPanelVisible: false }); }}
            onUploaded={this.handleFeesUpload}
            template={`${XLSX_CDN}/费用元素导入模板.xlsx`}
          />
        </Layout>
      </Layout>
    );
  }
}
