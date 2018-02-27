import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Layout } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { toggleOrderTypeModal, loadOrderTypes, removeOrderType } from 'common/reducers/sofOrderPref';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import RowAction from 'client/components/RowAction';
import PluginsCard from './card/pluginsCard';
import AuditRuleCard from './card/auditRuleCard';
import SettingMenu from '../menu';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    orderTypeList: state.sofOrderPref.orderTypeList,
    visible: state.sofOrderPref.orderTypeModal.visible,
    modalOrderType: state.sofOrderPref.orderTypeModal.orderType,
    reload: state.sofOrderPref.typeListReload,
  }),
  { toggleOrderTypeModal, loadOrderTypes, removeOrderType }
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
    currentTab: 'plugins',
  }
  componentDidMount() {
    const { orderTypeList } = this.props;
    this.props.loadOrderTypes({
      pageSize: orderTypeList.pageSize,
      current: orderTypeList.current,
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  groupsColumns = [{
    title: '费用分组代码',
    dataIndex: 'fee_group_code',
    width: 150,
  }, {
    title: '费用分组名称',
    dataIndex: 'fee_group_name',
  }, {
    title: '操作',
    dataIndex: 'OPS_COL',
    width: 90,
    render: (o, record) => <RowAction confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} tooltip="删除" row={record} />,
  }]
  handleCreate = () => {
    this.props.toggleOrderTypeModal(true, {});
  }
  handleConfig = (type) => {
    this.props.toggleOrderTypeModal(true, type);
  }
  handleTypeDel = (type) => {
    this.props.removeOrderType(type.id).then((result) => {
      if (!result.error) {
        const { orderTypeList } = this.props;
        this.props.loadOrderTypes({
          pageSize: orderTypeList.pageSize,
          current: orderTypeList.current,
        });
      }
    });
  }
  handleModalCancel = () => {
    const { orderTypeList, reload } = this.props;
    if (reload) {
      this.props.loadOrderTypes({
        pageSize: orderTypeList.pageSize,
        current: orderTypeList.current,
      });
    }
    this.props.toggleOrderTypeModal(false, {});
  }
  handlePageLoad = (current, pageSize) => {
    this.props.loadOrderTypes({
      pageSize,
      current,
    });
  }
  handleTabChange = (key) => {
    this.setState({ currentTab: key });
  }
  render() {
    const { currentTab } = this.state;
    const tabList = [
      {
        key: 'plugins',
        tab: this.msg('prefPlugins'),
      },
      {
        key: 'auditRule',
        tab: this.msg('prefAuditRule'),
      },
    ];
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
            <SettingMenu currentKey="preferences" />
          </div>
        </Sider>
        <Layout>
          <PageHeader tabList={tabList} onTabChange={this.handleTabChange} />
          <Content className="page-content layout-fixed-width">
            {currentTab === 'plugins' && <PluginsCard />}
            {currentTab === 'auditRule' && <AuditRuleCard />}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
