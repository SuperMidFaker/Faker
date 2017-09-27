import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Row, Tabs, Button, Modal, Tooltip, Menu, Icon, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import DetailPane from './tabpanes/orderPane';
import TrackingPane from './tabpanes/trackingPane';
import ExceptionPane from './tabpanes/exceptionPane';
import PodPane from './tabpanes/podPane';
import ExpensePane from './tabpanes/expensePane';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES, SHIPMENT_POD_STATUS, SHIPMENT_SOURCE, SHIPMENT_VEHICLE_CONNECT, PROMPT_TYPES } from 'common/constants';
import { hideDock, sendTrackingDetailSMSMessage, changePreviewerTab, loadShipmtDetail, loadForm,
  getShipmtOrderNo, toggleRecalculateChargeModal, toggleShareShipmentModal } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import InfoItem from 'client/components/InfoItem';
import DockPanel from 'client/components/DockPanel';
import ShareShipmentModal from '../../common/modal/shareShipmentModal';
import ChangeActDateModal from '../../tracking/land/modals/changeActDateModal';
import RecalculateChargeModal from '../../tracking/land/modals/recalculateChargeModal';
import VehicleModal from '../../tracking/land/modals/vehicle-updater';
import { loadOrderDetail } from 'common/reducers/crmOrders';
import { returnShipment, acceptDispShipment, revokeOrReject } from 'common/reducers/transport-acceptance';
import { doSend,
         doReturn,
         changeDockStatus,
         withDraw } from 'common/reducers/transportDispatch';
import { showVehicleModal } from 'common/reducers/trackingLandStatus';
import { passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import { createFilename } from 'client/util/dataTransform';
import { sendMessage } from 'common/reducers/notification';
import * as Location from 'client/util/location';
import messages from '../message.i18n';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;

function getTrackStatusMsg(status, eff) {
  let msg = 'trackDraft';
  if (eff === SHIPMENT_EFFECTIVES.cancelled) {
    msg = 'trackNullified';
  } else if (status === SHIPMENT_TRACK_STATUS.unaccepted) {
    msg = 'trackUnaccept';
  } else if (status === SHIPMENT_TRACK_STATUS.accepted) {
    msg = 'trackAccepted';
  } else if (status === SHIPMENT_TRACK_STATUS.dispatched) {
    msg = 'trackDispatched';
  } else if (status === SHIPMENT_TRACK_STATUS.intransit) {
    msg = 'trackIntransit';
  } else if (status === SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackDelivered';
  } else if (status > SHIPMENT_TRACK_STATUS.delivered) {
    msg = 'trackPod';
  }
  return msg;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar || '',
    loginName: state.account.username,
    visible: state.shipment.previewer.visible,
    changeShipmentModalVisible: state.shipment.changeShipmentModal.visible,
    dealExcpModalVisible: state.trackingLandException.dealExcpModal.visible,
    specialChargeModalVisible: state.transportBilling.specialChargeModal.visible,
    advanceChargeModalvisible: state.transportBilling.advanceModal.visible,
    locModalVisible: state.trackingLandStatus.locModal.visible,
    dateModalVisible: state.trackingLandStatus.dateModal.visible,
    tabKey: state.shipment.previewer.tabKey,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    dispatch: state.shipment.previewer.dispatch,
    effective: state.shipment.previewer.shipmt.effective,
    shipmt: state.shipment.previewer.shipmt,
    previewer: state.shipment.previewer,
    filters: state.transportDispatch.filters,
    expandList: state.transportDispatch.expandList,
    charges: state.shipment.charges,
  }),
  { hideDock,
    sendTrackingDetailSMSMessage,
    changePreviewerTab,
    loadShipmtDetail,
    loadForm,
    loadOrderDetail,
    getShipmtOrderNo,
    toggleRecalculateChargeModal,
    returnShipment,
    doSend,
    doReturn,
    changeDockStatus,
    withDraw,
    showVehicleModal,
    passAudit,
    returnAudit,
    sendMessage,
    acceptDispShipment,
    revokeOrReject,
    toggleShareShipmentModal }
)
export default class ShipmentDockPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    avatar: PropTypes.string.isRequired,
    loginName: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    changeShipmentModalVisible: PropTypes.bool.isRequired,
    dealExcpModalVisible: PropTypes.bool.isRequired,
    specialChargeModalVisible: PropTypes.bool.isRequired,
    advanceChargeModalvisible: PropTypes.bool.isRequired,
    locModalVisible: PropTypes.bool.isRequired,
    dateModalVisible: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    shipmtNo: PropTypes.string,
    dispatch: PropTypes.object,
    effective: PropTypes.number,
    hideDock: PropTypes.func.isRequired,
    sendTrackingDetailSMSMessage: PropTypes.func.isRequired,
    changePreviewerTab: PropTypes.func.isRequired,
    shipmt: PropTypes.object.isRequired,
    previewer: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
    expandList: PropTypes.object.isRequired,
    charges: PropTypes.object.isRequired,
    loadShipmtDetail: PropTypes.func.isRequired,
    loadForm: PropTypes.func.isRequired,
    toggleRecalculateChargeModal: PropTypes.func.isRequired,
    returnShipment: PropTypes.func.isRequired,
    doSend: PropTypes.func.isRequired,
    doReturn: PropTypes.func.isRequired,
    changeDockStatus: PropTypes.func.isRequired,
    withDraw: PropTypes.func.isRequired,
    showVehicleModal: PropTypes.func.isRequired,
    passAudit: PropTypes.func.isRequired,
    returnAudit: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    revokeOrReject: PropTypes.func.isRequired,
    toggleShareShipmentModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      shareShipmentModalVisible: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { previewer: { visible, loaded, params: { No: shipmtNo, tenantId, sourceType }, tabKey } } = nextProps;
    if (!loaded && visible) {
      this.props.loadShipmtDetail(shipmtNo, tenantId, sourceType, tabKey);
      this.props.loadForm(null, {
        tenantId,
        shipmtNo,
      });
    }
  }
  componentWillUnmount() {
    this.props.hideDock();
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleShowExportShipment = () => {
  }
  handleDownloadPod = () => {
    const { previewer: { shipmt, dispatch } } = this.props;
    const domain = window.location.host;
    window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentPodPDF/${createFilename('pod')}.pdf?shipmtNo=${shipmt.shipmt_no}&podId=${dispatch.pod_id}&publickKey=${shipmt.public_key}&domain=${domain}`);
  }
  handleShipmtAccept = () => {
    const dispId = this.props.previewer.dispatch.id;
    this.props.acceptDispShipment([dispId], this.props.loginId, this.props.loginName, this.props.loginId, this.props.loginName).then(
      (result) => {
        if (!result.error) {
          return this.props.reload && this.props.reload();
        }
      }
    );
  }
  handleShipmtSend = () => {
    const { tenantId, loginId, avatar, loginName, previewer: { shipmt, dispatch } } = this.props;
    let msg = `将【${shipmt.shipmt_no}】运单发送给【${dispatch.sp_name}】？`;
    if (!dispatch.sp_tenant_id && dispatch.task_id > 0) {
      msg = `将【${shipmt.shipmt_no}】运单发送给【${dispatch.task_vehicle}】？`;
    }
    Modal.confirm({
      title: '确认发送运单',
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        this.props.doSend(null, {
          tenantId,
          loginId,
          avatar,
          loginName,
          list: JSON.stringify([{ dispId: dispatch.id,
            shipmtNo: shipmt.shipmt_no,
            sp_tenant_id: dispatch.sp_tenant_id,
            sr_name: dispatch.sr_name,
            status: dispatch.status,
            consigner_province: shipmt.consigner_province,
            consigner_city: shipmt.consigner_city,
            consigner_district: shipmt.consigner_district,
            consignee_province: shipmt.consignee_province,
            consignee_city: shipmt.consignee_city,
            consignee_district: shipmt.consignee_district,
            parentId: dispatch.parent_id }]),
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          }
        });
      },
    });
  }
  handleShipmtReturn = () => {
    const { tenantId, previewer: { shipmt, dispatch } } = this.props;
    let msg = `将预分配给【${dispatch.sp_name}】的【${shipmt.shipmt_no}】运单退回吗？`;
    if (!dispatch.sp_tenant_id && dispatch.task_id > 0) {
      msg = `将预分配给【${dispatch.task_vehicle}】的【${shipmt.shipmt_no}】运单退回吗？`;
    }

    Modal.confirm({
      title: '确认退回运单',
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        this.props.doReturn(null, {
          tenantId,
          dispId: dispatch.id,
          parentId: dispatch.parent_id,
          shipmtNo: shipmt.shipmt_no,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          }
        });
      },
    });
  }
  handleDispatchDockShow = () => {
    const { previewer: { shipmt, dispatch } } = this.props;
    const shipment = { ...shipmt, ...dispatch, key: dispatch.id };
    this.props.changeDockStatus({ dispDockShow: true, shipmts: [shipment] });
  }
  handleSegmentDockShow = () => {
    const { previewer: { shipmt, dispatch } } = this.props;
    const shipment = { ...shipmt, ...dispatch, key: dispatch.id };
    this.props.changeDockStatus({ segDockShow: true, shipmts: [shipment] });
  }
  handleShowVehicleModal = (dispId, shipmtNo) => {
    this.props.showVehicleModal(dispId, shipmtNo);
  }
  handleAuditPass = (podId, dispId, parentId) => {
    const { loginName, tenantId, loginId } = this.props;
    this.props.passAudit(podId, dispId, parentId, loginName, tenantId, loginId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.hideDock();
      }
    });
  }
  handleAuditReturn = (dispId) => {
    this.props.returnAudit(dispId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.hideDock();
      }
    });
  }
  handleWithDraw = (shipmtNo, dispId, parentId) => {
    const { tenantId, loginId, loginName } = this.props;
    const list = [{ dispId, shipmtNo, parentId }];
    this.props.withDraw({ tenantId, loginId, loginName, list: JSON.stringify(list) }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.hideDock();
      }
    });
  }
  handleReturn = (dispId) => {
    const { tenantId, loginId, loginName } = this.props;
    const shipmtDispIds = [dispId];
    this.props.returnShipment({ shipmtDispIds, tenantId, loginId, loginName }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.hideDock();
      }
    });
  }
  handlePrompt = (promptType) => {
    const { previewer: { shipmt, dispatch } } = this.props;
    const shipment = {
      task_driver_id: dispatch.task_driver_id,
      sp_tenant_id: dispatch.sp_tenant_id,
      shipmt_no: shipmt.shipmt_no,
      disp_id: dispatch.id,
    };
    this.props.sendMessage({ module: 'transport', promptType, shipment });
  }

  handleTabChange = (tabKey) => {
    this.props.changePreviewerTab(tabKey);
  }
  handleClose = () => {
    this.props.hideDock();
  }
  handleShowShareShipmentModal = () => {
    this.setState({
      shareShipmentModalVisible: true,
    });
    setTimeout(() => {
      this.setState({ shareShipmentModalVisible: false });
    }, 500);
  }
  transformBadgeColor(status) {
    switch (status) {
      case SHIPMENT_TRACK_STATUS.unaccepted: return 'default';
      case SHIPMENT_TRACK_STATUS.accepted: return 'default';
      case SHIPMENT_TRACK_STATUS.dispatched: return 'warning';
      case SHIPMENT_TRACK_STATUS.intransit: return 'processing';
      case SHIPMENT_TRACK_STATUS.delivered: return 'success';
      case SHIPMENT_TRACK_STATUS.podsubmit: return 'success';
      default: return 'success';
    }
  }
  goHomeDock = () => {
    const { shipmt } = this.props;
    this.props.getShipmtOrderNo(shipmt.flow_instance_uuid).then(
      (result) => {
        this.props.loadOrderDetail(result.data.order_no, this.props.tenantId);
        this.props.hideDock();
      }
    );
  }
  handleMenuClick = (e) => {
    const { shipmt, dispatch } = this.props;
    if (e.key === 'terminate') {
      this.props.revokeOrReject('revoke', shipmt.shipmt_no, dispatch.id);
    } else if (e.key === 'shareShipment') {
      this.props.toggleShareShipmentModal(true);
    }
  }
  renderButtons = () => {
    const { tenantId, previewer: { shipmt, dispatch, upstream, downstream, params: { sourceType } }, charges } = this.props;
    const needRecalculate = charges.revenue.need_recalculate === 1 || charges.expense.need_recalculate === 1;
    let buttons = [];
    if (sourceType === 'sp') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        if (dispatch.source === SHIPMENT_SOURCE.consigned) {
          buttons.push(<PrivilegeCover module="transport" feature="shipment" action="edit">
            <Button key="change" onClick={() => this.context.router.push(`/transport/shipment/edit/${shipmt.shipmt_no}`)} style={{ marginRight: 8 }}>
              修改
            </Button>
          </PrivilegeCover>,
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Button key="accept" type="primary" icon="check" onClick={this.handleShipmtAccept}>
                接单
              </Button>
            </PrivilegeCover>);
        } else if (dispatch.source === SHIPMENT_SOURCE.subcontracted) {
          buttons.push(
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Button key="accept" type="primary" icon="check" onClick={this.handleShipmtAccept}>
                接单
              </Button>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.accepted) {
        if (dispatch.child_send_status === 0 && dispatch.disp_status === 1 && dispatch.sp_tenant_id === tenantId) {
          buttons.push(
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Tooltip placement="bottom" title="退回至未接单状态">
                <Button key="return" type="ghost" onClick={() => this.handleReturn(dispatch.id)}>
                  退回
                </Button>
              </Tooltip>
            </PrivilegeCover>
          );
        }
        if (dispatch.child_send_status === 0 && dispatch.disp_status === 1 && dispatch.sp_tenant_id === tenantId) {
          buttons.push(
            <PrivilegeCover module="transport" feature="dispatch" action="create">
              <Button key="segment" onClick={() => this.handleSegmentDockShow()} style={{ marginLeft: 8 }} >
                分段
              </Button>
            </PrivilegeCover>,
            <PrivilegeCover module="transport" feature="dispatch" action="create">
              <Button key="dispatch" type="primary" onClick={() => this.handleDispatchDockShow()} style={{ marginLeft: 8 }} >
                分配
              </Button>
            </PrivilegeCover>
          );
        } else if (dispatch.disp_status === 0 && upstream.sr_tenant_id === tenantId) {
          buttons.push(
            <PrivilegeCover module="transport" feature="dispatch" action="edit">
              <Button key="return" type="ghost" onClick={() => this.handleShipmtReturn()}>
                退回
              </Button>
            </PrivilegeCover>,
            <PrivilegeCover module="transport" feature="dispatch" action="edit">
              <Button key="send" type="primary" onClick={() => this.handleShipmtSend()} style={{ marginLeft: 8 }} >
                发送
              </Button>
            </PrivilegeCover>
          );
        }
      }
    } else if (sourceType === 'sr') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        buttons.push(
          <PrivilegeCover module="transport" feature="tracking" action="create">
            <Button key="promptAccept" type="ghost" onClick={() => this.handlePrompt(PROMPT_TYPES.promptAccept)}>
              催促接单
            </Button>
          </PrivilegeCover>
        );
        if (downstream.sr_tenant_id === tenantId) {
          buttons.push(
            <PrivilegeCover module="transport" feature="dispatch" action="edit">
              <Tooltip placement="bottom" title="承运商尚未接单，可立即撤回">
                <Button key="withDraw" type="ghost" onClick={() => this.handleWithDraw(shipmt.shipmt_no, downstream.disp_id, downstream.parent_id)} style={{ marginLeft: 8 }} >
                  撤回
                </Button>
              </Tooltip>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.accepted) {
        if (dispatch.sp_tenant_id === -1) {
            // 线下客户手动更新
          buttons.push(
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <Button key="updateDriver" type="ghost" onClick={() => this.handleShowVehicleModal(dispatch.id, shipmt.shipmt_no)} >
                更新车辆司机
              </Button>
            </PrivilegeCover>
          );
        } else {
          buttons.push(
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button key="promptDispatch" type="ghost" onClick={() => this.handlePrompt(PROMPT_TYPES.promptDispatch)} >
                催促调度
              </Button>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (dispatch.sp_tenant_id === -1) {
          buttons = [];
        } else if (dispatch.sp_tenant_id === 0) {
            // 已分配给车队
          if (dispatch.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              // 线下司机
            buttons = [];
          } else {
            // 司机更新
            buttons.push(
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button key="promptPickup" type="ghost"
                  onClick={() => this.handlePrompt(PROMPT_TYPES.promptDriverPickup)}
                >
                    催促提货
                  </Button>
              </PrivilegeCover>
            );
          }
        } else {
          buttons.push(
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button key="promptPickup" type="ghost" onClick={
                  () => this.handlePrompt(PROMPT_TYPES.promptSpPickup)
                }
              >
                催促提货
              </Button>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (dispatch.sp_tenant_id === -1) {
          buttons = [];
        } else if (dispatch.sp_tenant_id === 0) {
          if (dispatch.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            buttons = [];
          } else {
            // 司机更新
            buttons = [];
          }
        } else {
          // 承运商更新
          buttons = [];
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.delivered) {
        buttons = [];
      }

      if (dispatch.status >= SHIPMENT_TRACK_STATUS.delivered) {
        if (!dispatch.pod_status || dispatch.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
          if (dispatch.sp_tenant_id === -1) {
            buttons = [];
          } else if (dispatch.sp_tenant_id === 0) {
            if (dispatch.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              buttons = [];
            } else {
              // 司机上传
              buttons.push(
                <PrivilegeCover module="transport" feature="tracking" action="create">
                  <Button key="promptPod" type="ghost" onClick={() => this.handlePrompt(PROMPT_TYPES.promptDriverPod)}>
                    催促回单
                  </Button>
                </PrivilegeCover>
              );
            }
          } else {
            // 承运商上传
            buttons.push(
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button key="promptPod" type="ghost" onClick={() => this.handlePrompt(PROMPT_TYPES.promptSpPod)}>
                  催促回单
                </Button>
              </PrivilegeCover>
            );
          }
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          buttons = [];
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.pending) {
          // 审核回单
          buttons.push(
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <Button key="accepte" type="ghost" onClick={() => this.handleAuditPass(dispatch.pod_id, dispatch.id, dispatch.parent_id)} >
                接受
              </Button>
            </PrivilegeCover>,
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <Button key="refuse" type="ghost" onClick={() => this.handleAuditReturn(dispatch.id)} style={{ marginLeft: 8 }} >
                拒绝
              </Button>
            </PrivilegeCover>
          );
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
          // 我方拒绝
          buttons = [];
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
          // 提交给上游客户
          buttons = [];
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.acceptByClient) {
          // 上游客户已接受
          buttons = [];
        }
      }
    }
    if (needRecalculate) {
      buttons.push(
        <Button key="recalculateCharges" type="ghost" style={{ marginLeft: 8 }} onClick={() => this.props.toggleRecalculateChargeModal(true, shipmt.shipmt_no)} >
          重新计算费用
        </Button>);
    }
    return buttons.length > 0 ? (<span>{buttons}</span>) : null;
  }
  renderTabs(status, sourceType) {
    const dispatchDisabled = true;
    let trackingDisabled = true;
    let expenseDisabled = true;
    let exceptionDisabled = true;
    let podDisabled = true;
    switch (status) {
      case SHIPMENT_TRACK_STATUS.unaccepted:
        break;
      case SHIPMENT_TRACK_STATUS.accepted:
        // dispatchDisabled = false;
        break;
      case SHIPMENT_TRACK_STATUS.dispatched:
        // dispatchDisabled = false;
        trackingDisabled = false;
        exceptionDisabled = false;
        break;
      case SHIPMENT_TRACK_STATUS.intransit:
        // dispatchDisabled = false;
        trackingDisabled = false;
        exceptionDisabled = false;
        expenseDisabled = false;
        break;
      case SHIPMENT_TRACK_STATUS.delivered:
      case SHIPMENT_TRACK_STATUS.podsubmit:
      case SHIPMENT_TRACK_STATUS.podaccept:
        // dispatchDisabled = false;
        trackingDisabled = false;
        expenseDisabled = false;
        exceptionDisabled = false;
        podDisabled = false;
        break;
      default:
        break;
    }
    return (
      <Tabs activeKey={this.props.tabKey} onChange={this.handleTabChange}>
        <TabPane tab={this.msg('shipmtOrder')} key="order">
          <DetailPane />
        </TabPane>
        <TabPane tab={this.msg('shipmtDispatch')} key="dispatch" disabled={dispatchDisabled} />
        <TabPane tab={this.msg('shipmtTracking')} key="tracking" disabled={trackingDisabled}>
          <TrackingPane sourceType={sourceType} />
        </TabPane>
        <TabPane tab={this.msg('shipmtPOD')} key="pod" disabled={podDisabled}>
          <PodPane />
        </TabPane>
        <TabPane tab={this.msg('shipmtException')} key="exception" disabled={exceptionDisabled}>
          <ExceptionPane />
        </TabPane>
        <TabPane tab={this.msg('shipmtCharge')} key="charge" disabled={expenseDisabled}>
          <ExpensePane />
        </TabPane>
      </Tabs>
    );
  }
  renderExtra() {
    const { shipmt } = this.props;
    return (<Row>
      <Col span="6">
        <InfoItem label="托运方"
          field={shipmt.customer_name}
        />
      </Col>
      <Col span="6">
        <InfoItem label="客户单号"
          field={shipmt.ref_external_no}
        />
      </Col>
      <Col span="6">
        <InfoItem label="始发地"
          field={Location.renderLoc({
            province: shipmt.consigner_province,
            city: shipmt.consigner_city,
            district: shipmt.consigner_district,
          }, 'province', 'city', 'district')}
        />
      </Col>
      <Col span="6">
        <InfoItem label="目的地"
          field={Location.renderLoc({
            province: shipmt.consignee_province,
            city: shipmt.consignee_city,
            district: shipmt.consignee_district,
          }, 'province', 'city', 'district')}
        />
      </Col>
    </Row>);
  }
  renderTitle = () => {
    const { shipmtNo, shipmt } = this.props;
    const button = shipmt.flow_instance_uuid ? <Button shape="circle" icon="home" onClick={this.goHomeDock} /> : '';
    return (
      <span>{button}<span>{shipmtNo}</span></span>
    );
  }
  renderMenu() {
    const { shipmt, dispatch, tenantId } = this.props;
    const menuItems = [];
    const terminable = tenantId === shipmt.tenant_id && dispatch.status < SHIPMENT_TRACK_STATUS.intransit;
    if (terminable) {
      menuItems.push(<Menu.Item key="terminate"><Icon type="delete" />终止运单</Menu.Item>);
    }
    menuItems.push(<Menu.Item key="shareShipment"><Icon type="share-alt" />共享运单</Menu.Item>);
    return <Menu onClick={this.handleMenuClick}>{menuItems}</Menu>;
  }
  render() {
    const { shipmt, visible, shipmtNo, dispatch, effective, previewer: { params: { sourceType } } } = this.props;
    return (
      shipmtNo ?
        <DockPanel size="large" visible={visible} onClose={this.handleClose}
          title={this.renderTitle()}
          status={this.transformBadgeColor(dispatch.status)} statusText={this.msg(getTrackStatusMsg(dispatch.status, effective))}
          overlay={this.renderMenu()}
          extra={this.renderExtra()}
          /* alert={this.renderButtons()}
          */
        >
          {this.renderTabs(dispatch.status, sourceType)}
          <ShareShipmentModal visible={this.state.shareShipmentModalVisible} shipmt={shipmt} />
          <ChangeActDateModal />
          <VehicleModal onOK={() => {}} />
          <RecalculateChargeModal />
        </DockPanel>
      : null
    );
  }
}
