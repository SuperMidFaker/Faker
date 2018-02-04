import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Icon, Menu, Row, Tabs, message } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_DELEGATION_STATUS, CMS_DELEGATION_MANIFEST } from 'common/constants';
import { showDispModal, acceptDelg, reloadDelegationList } from 'common/reducers/cmsDelegation';
import { setPreviewStatus, hideDock, setPreviewTabkey, loadBasicInfo, getShipmtOrderNo } from 'common/reducers/cmsDelegationDock';
import { loadOrderDetail } from 'common/reducers/sofOrders';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import { Logixon } from 'client/components/FontIcon';
import ShipmentPane from './tabpanes/shipmentPane';
import DutyTaxPane from './tabpanes/dutyTaxPane';
import ExpensePane from './tabpanes/expensePane';
import FilesPane from './tabpanes/filesPane';
import DelgDispModal from './delgDispModal';
import { formatMsg } from './message.i18n';

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.cmsDelegationDock.previewer.visible,
    previewLoading: state.cmsDelegationDock.basicPreviewLoading,
    previewer: state.cmsDelegationDock.previewer,
    tabKey: state.cmsDelegationDock.tabKey,
    previewKey: state.cmsDelegationDock.previewKey,
    delegateListFilter: state.cmsDelegation.delegateListFilter,
    operators: state.sofCustomers.operators,
    partnerId: state.cmsDelegationDock.previewer.delgDispatch.send_partner_id,
  }),
  {
    hideDock,
    setPreviewStatus,
    setPreviewTabkey,
    showDispModal,
    loadBasicInfo,
    loadOrderDetail,
    getShipmtOrderNo,
    acceptDelg,
    reloadDelegationList,
  }
)
export default class DelegationDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    tabKey: PropTypes.string,
    previewKey: PropTypes.string,
    hideDock: PropTypes.func.isRequired,
    setPreviewStatus: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.previewKey !== this.props.previewKey) {
      nextProps.loadBasicInfo(this.props.tenantId, nextProps.previewKey, nextProps.tabKey);
    }
  }
  componentWillUnmount() {
    this.props.hideDock();
  }
  msg = formatMsg(this.props.intl)
  handleTabChange = (tabKey) => {
    this.props.setPreviewTabkey(tabKey);
  }
  handleAssign = () => {
    this.props.showDispModal(this.props.previewer.delegation.delg_no, this.props.tenantId);
  }
  handleDispCancel = () => {
    this.props.setPreviewStatus({ preStatus: 'delgDispCancel' });
  }
  handleDelegationAccept = (record, lid, name) => {
    this.props.acceptDelg(
      lid,
      name,
      [this.props.previewer.delgDispatch.id],
      this.props.previewer.delegation.delg_no
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.loadBasicInfo(this.props.tenantId, this.props.previewKey, this.props.tabKey);
        this.props.reloadDelegationList();
      }
    });
  }
  goHomeDock = () => {
    const { previewer } = this.props;
    this.props.getShipmtOrderNo(previewer.delegation.instance_uuid).then((result) => {
      this.props.loadOrderDetail(result.data.order_no, this.props.tenantId);
      this.props.hideDock();
    });
  }
  renderTabs() {
    const { previewer, tabKey } = this.props;
    const { delgDispatch, delegation } = previewer;
    const clearType = delegation.i_e_type === 0 ? 'import' : 'export';
    const tabs = [];
    tabs.push(<TabPane tab="货运信息" key="shipment"><ShipmentPane /></TabPane>);
    /*
    if (delgDispatch.status >= CMS_DELEGATION_STATUS.accepted) {
      if (delgDispatch.recv_services.indexOf('ciq') !== -1) {
        tabs.push(<TabPane tab="报检" key="ciqDecl"><CiqDeclPane /></TabPane>);
      }
      tabs.push(<TabPane tab="报关" key="customsDecl"><CustomsDeclPane /></TabPane>);
    }
    */
    if (delegation.decl_way_code !== 'IBND' && delegation.decl_way_code !== 'EBND' && clearType === 'import' &&
      ((delgDispatch.status === CMS_DELEGATION_STATUS.processing &&
         delegation.manifested === CMS_DELEGATION_MANIFEST.manifested) ||
      delgDispatch.status > CMS_DELEGATION_STATUS.processing)) {
      tabs.push(<TabPane tab="税金" key="taxes"><DutyTaxPane /></TabPane>);
    }
    if (delgDispatch.status >= CMS_DELEGATION_STATUS.accepted) {
      tabs.push(<TabPane tab="费用" key="expenses"><ExpensePane /></TabPane>);
    }
    tabs.push(<TabPane tab="文件" key="files"><FilesPane /></TabPane>);
    return (
      <Tabs activeKey={tabKey} onChange={this.handleTabChange}>
        {tabs}
      </Tabs>
    );
  }
  renderExtra() {
    const { delegation, delgDispatch } = this.props.previewer;
    return (
      <Row>
        <Col span="8">
          <InfoItem label={this.msg('client')} field={delgDispatch.send_name} />
        </Col>
        <Col span="6">
          <InfoItem label="提运单号" field={delegation.bl_wb_no} />
        </Col>
        <Col span="6">
          <InfoItem label="客户单号" field={delegation.order_no} />
        </Col>
        <Col span="4">
          <InfoItem
            label="委托日期"
            addonBefore={<Icon type="calendar" />}
            field={moment(delgDispatch.delg_time).format('YYYY.MM.DD')}
          />
        </Col>
      </Row>);
  }
  renderMenu() {
    const { previewer } = this.props;
    const { delgDispatch } = previewer;
    const menuItems = [];
    if (delgDispatch.status < CMS_DELEGATION_STATUS.declaring) {
      menuItems.push(<Menu.Item key="cancel"><Icon type="delete" />取消委托</Menu.Item>);
    } else if (delgDispatch.status === CMS_DELEGATION_STATUS.declaring) {
      menuItems.push(<Menu.Item key="close"><Icon type="close-square" />关闭委托</Menu.Item>);
    }
    menuItems.push(<Menu.Item key="share"><Icon type="share-alt" /><span onClick={this.handleExportExcel}>共享委托</span></Menu.Item>);
    return <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;
  }
  render() {
    const { visible, previewLoading, previewer } = this.props;
    const { delegation } = previewer;
    return (
      <DockPanel
        size="large"
        visible={visible}
        onClose={this.props.hideDock}
        title={delegation.delg_no}
        uppperLevel={delegation.instance_uuid && <a onClick={this.goHomeDock}><Logixon type="dan" /></a>}
        extra={this.renderExtra()}
        loading={previewLoading}
        overlay={this.renderMenu()}
      >
        {this.renderTabs()}
        <DelgDispModal />
      </DockPanel>
    );
  }
}
