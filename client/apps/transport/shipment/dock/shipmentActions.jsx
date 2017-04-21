import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Tooltip, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_SOURCE, SHIPMENT_VEHICLE_CONNECT, PROMPT_TYPES } from 'common/constants';
import { hidePreviewer } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadAcceptDispatchers, revokeOrReject, returnShipment } from 'common/reducers/transport-acceptance';
import { doSend,
         doReturn,
         changeDockStatus,
         withDraw } from 'common/reducers/transportDispatch';
import { showVehicleModal, showChangeActDateModal }
from 'common/reducers/trackingLandStatus';
import { showAdvanceModal, showSpecialChargeModal } from 'common/reducers/transportBilling';
import { passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import { createFilename } from 'client/util/dataTransform';
import { sendMessage } from 'common/reducers/corps';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar || '',
    loginName: state.account.username,
    previewer: state.shipment.previewer,
    filters: state.transportDispatch.filters,
    expandList: state.transportDispatch.expandList,
  }),
  { hidePreviewer,
    loadAcceptDispatchers,
    revokeOrReject,
    changeDockStatus,
    doReturn,
    doSend,
    showVehicleModal,
    passAudit,
    returnAudit,
    withDraw,
    returnShipment,
    showAdvanceModal,
    showSpecialChargeModal,
    sendMessage,
    showChangeActDateModal,
  }
)
export default class ShipmentActions extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    avatar: PropTypes.string.isRequired,
    loginName: PropTypes.string.isRequired,
    previewer: PropTypes.object.isRequired,
    onShowShareShipmentModal: PropTypes.func.isRequired,
    loadAcceptDispatchers: PropTypes.func.isRequired,
    revokeOrReject: PropTypes.func.isRequired,
    filters: PropTypes.object.isRequired,
    expandList: PropTypes.object.isRequired,
    changeDockStatus: PropTypes.func.isRequired,
    doSend: PropTypes.func.isRequired,
    doReturn: PropTypes.func.isRequired,
    showVehicleModal: PropTypes.func.isRequired,
    passAudit: PropTypes.func.isRequired,
    returnAudit: PropTypes.func.isRequired,
    withDraw: PropTypes.func.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    returnShipment: PropTypes.func.isRequired,
    showAdvanceModal: PropTypes.func.isRequired,
    showSpecialChargeModal: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    showChangeActDateModal: PropTypes.func.isRequired,
    stage: PropTypes.string.isRequired,
    sourceType: PropTypes.string.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    exportPDFvisible: false,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)

  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleMenuClick = (e) => {
    const { previewer: { shipmt, dispatch } } = this.props;
    if (e.key === 'exportShipment') {
      this.setState({ exportPDFvisible: true });
      setTimeout(() => {
        this.setState({ exportPDFvisible: false });
      }, 200);
    } else if (e.key === 'shareShipment') {
      this.props.onShowShareShipmentModal();
    } else if (e.key === 'terminateShipment') {
      this.handleShipmtRevoke(shipmt.shipmt_no, dispatch.id);
    } else if (e.key === 'changeActDate') {
      this.handleShowChangeActDateModal(shipmt.shipmt_no, dispatch.id, dispatch.pickup_act_date, dispatch.deliver_act_date);
    }
  }
  handleShowExportShipment = () => {
  }
  handleDownloadPod = () => {
    const { previewer: { shipmt, dispatch } } = this.props;
    const domain = window.location.host;
    window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentPodPDF/${createFilename('pod')}.pdf?shipmtNo=${shipmt.shipmt_no}&podId=${dispatch.pod_id}&publickKey=${shipmt.public_key}&domain=${domain}`);
  }
  handleShipmtAccept = (dispId) => {
    this.props.loadAcceptDispatchers(
      this.props.tenantId, [dispId]
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleShipmtRevoke = (shipmtNo, dispId) => {
    this.props.revokeOrReject('revoke', shipmtNo, dispId);
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
  handleShowShipmentAdvanceModal = (shipmtNo, dispId, transportModeId, goodsType) => {
    // todo 取parentDisp sr_tenant_id
    this.props.showAdvanceModal({ visible: true, dispId, shipmtNo, transportModeId, goodsType });
  }
  handleShowSpecialChargeModal = (shipmtNo, dispId, parentDispId, spTenantId) => {
    this.props.showSpecialChargeModal({ visible: true, dispId, shipmtNo, parentDispId, spTenantId, type: -2 });
  }
  handleShowChangeActDateModal = (shipmtNo, dispId, pickupActDate, deliverActDate) => {
    this.props.showChangeActDateModal({ visible: true, dispId, shipmtNo,
      pickupActDate, deliverActDate });
  }
  handleAuditPass = (podId, dispId, parentId) => {
    const { loginName, tenantId, loginId } = this.props;
    this.props.passAudit(podId, dispId, parentId, loginName, tenantId, loginId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.hidePreviewer();
      }
    });
  }
  handleAuditReturn = (dispId) => {
    this.props.returnAudit(dispId).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.hidePreviewer();
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
        this.props.hidePreviewer();
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
        this.props.hidePreviewer();
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
  render() {
    const { tenantId, stage, sourceType, previewer: { shipmt, dispatch, row } } = this.props;
    let buttons = null;
    if (sourceType === 'sp') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        if (dispatch.source === SHIPMENT_SOURCE.consigned) {
          buttons = (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <span>
                <Button onClick={() => this.context.router.push(`/transport/shipment/edit/${shipmt.shipmt_no}`)}>
                  修改
                </Button>
                <Button type="primary" icon="check" onClick={() => this.handleShipmtAccept(dispatch.id)} >
                  接单
                </Button>
              </span>
            </PrivilegeCover>
          );
        } else if (dispatch.source === SHIPMENT_SOURCE.subcontracted) {
          buttons = (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Button type="primary" icon="check" onClick={() => this.handleShipmtAccept(dispatch.id)} >
                接单
              </Button>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.accepted || dispatch.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (stage === 'acceptance') {
          buttons = (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Tooltip placement="bottom" title="退回至未接单状态">
                <Button type="ghost" onClick={() => this.handleReturn(dispatch.id)}>
                  退回
                </Button>
              </Tooltip>
            </PrivilegeCover>
          );
        } else if (stage === 'dispatch' || stage === 'todo') {
          if (dispatch.child_send_status === 0 && dispatch.status === 2 && dispatch.disp_status === 1 && dispatch.sp_tenant_id === tenantId) {
            buttons = (
              <PrivilegeCover module="transport" feature="dispatch" action="create">
                <span>
                  <Button onClick={() => this.handleSegmentDockShow()} >
                    分段
                  </Button>
                  <Button type="primary" onClick={() => this.handleDispatchDockShow()} >
                    分配
                  </Button>
                </span>
              </PrivilegeCover>
            );
          } else if (dispatch.disp_status === 0 && row.sr_tenant_id === tenantId) {
            buttons = (
              <PrivilegeCover module="transport" feature="dispatch" action="edit">
                <span>
                  <Button type="ghost" onClick={() => this.handleShipmtReturn()}>
                    退回
                  </Button>
                  <Button type="primary" onClick={() => this.handleShipmtSend()} >
                    发送
                  </Button>
                </span>
              </PrivilegeCover>
            );
          } else if (dispatch.disp_status > 0 && row.sr_tenant_id === tenantId) {
            if (dispatch.downstream_status === 1) {
              buttons = (
                <PrivilegeCover module="transport" feature="dispatch" action="edit">
                  <Tooltip placement="bottom" title="承运商尚未接单，可立即撤回">
                    <Button type="ghost" onClick={() => this.handleWithDraw(shipmt.shipmt_no, row.disp_id, row.parent_id)} >
                      撤回
                    </Button>
                  </Tooltip>
                </PrivilegeCover>
              );
            }
          }
        }
      }
    } else if (sourceType === 'sr') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        buttons = (
          <PrivilegeCover module="transport" feature="tracking" action="create">
            <Button type="ghost" onClick={() => this.handlePrompt(PROMPT_TYPES.promptAccept)}>
              催促接单
            </Button>
          </PrivilegeCover>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.accepted) {
        if (dispatch.sp_tenant_id === -1) {
            // 线下客户手动更新
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <Button type="ghost" onClick={() => this.handleShowVehicleModal(dispatch.id, shipmt.shipmt_no)} >
                更新车辆司机
              </Button>
            </PrivilegeCover>
          );
        } else {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button type="ghost" onClick={() => this.handlePrompt(PROMPT_TYPES.promptDispatch)} >
                催促调度
              </Button>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (dispatch.sp_tenant_id === -1) {
          buttons = null;
        } else if (dispatch.sp_tenant_id === 0) {
            // 已分配给车队
          if (dispatch.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              // 线下司机
            buttons = null;
          } else {
            // 司机更新
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <span>
                  <Button type="ghost"
                    onClick={() => this.handlePrompt(PROMPT_TYPES.promptDriverPickup)}
                  >
                    催促提货
                  </Button>
                </span>
              </PrivilegeCover>
            );
          }
        } else {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <span>
                <Button type="ghost" onClick={
                    () => this.handlePrompt(PROMPT_TYPES.promptSpPickup)
                  }
                >
                  催促提货
                </Button>
              </span>
            </PrivilegeCover>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (dispatch.sp_tenant_id === -1) {
          buttons = null;
          /*
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <span>
                <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(shipmt.shipmt_no, dispatch.id, shipmt.transport_mode_id, shipmt.goods_type)} >
                  添加垫付费用
                </Button>
                <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(shipmt.shipmt_no, dispatch.id, dispatch.parent_id, dispatch.sp_tenant_id)} >
                  添加特殊费用
                </Button>
              </span>
            </PrivilegeCover>
          );
          */
        } else if (dispatch.sp_tenant_id === 0) {
          if (dispatch.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            buttons = null;
            /*
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <span>
                  <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(shipmt.shipmt_no, dispatch.id, shipmt.transport_mode_id, shipmt.goods_type)} >
                    添加垫付费用
                  </Button>
                  <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(shipmt.shipmt_no, dispatch.id, dispatch.parent_id, dispatch.sp_tenant_id)} >
                    添加特殊费用
                  </Button>
                </span>
              </PrivilegeCover>
            );*/
          } else {
            // 司机更新
            buttons = null;
            /*
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <span>
                  <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(shipmt.shipmt_no, dispatch.id, shipmt.transport_mode_id, shipmt.goods_type)} >
                    添加代垫费用
                  </Button>
                  <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(shipmt.shipmt_no, dispatch.id, dispatch.parent_id, dispatch.sp_tenant_id)} >
                    添加特殊费用
                  </Button>
                </span>
              </PrivilegeCover>
            );
            */
          }
        } else {
          // 承运商更新
          buttons = null;
          /*
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <span>
                <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(shipmt.shipmt_no, dispatch.id, shipmt.transport_mode_id, shipmt.goods_type)} >
                  添加代垫费用
                </Button>
                <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(shipmt.shipmt_no, dispatch.id, dispatch.parent_id, dispatch.sp_tenant_id)} >
                  添加特殊费用
                </Button>
              </span>
            </PrivilegeCover>
          );
          */
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.delivered) {
        buttons = null;
        /*
        buttons = (
          <PrivilegeCover module="transport" feature="tracking" action="edit">
            <span>
              <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(shipmt.shipmt_no, dispatch.id, dispatch.parent_id, dispatch.sp_tenant_id)} >
                添加特殊费用
              </Button>
            </span>
          </PrivilegeCover>
        );
        */
      }

      if (dispatch.status >= SHIPMENT_TRACK_STATUS.delivered && (stage === 'pod' || stage === 'todo')) {
        if (!dispatch.pod_status || dispatch.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
          if (dispatch.sp_tenant_id === -1) {
            buttons = null;
          } else if (dispatch.sp_tenant_id === 0) {
            if (dispatch.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              buttons = null;
            } else {
              // 司机上传
              buttons = (
                <PrivilegeCover module="transport" feature="tracking" action="create">
                  <Button type="ghost" onClick={
                      () => this.handlePrompt(PROMPT_TYPES.promptDriverPod)
                    }
                  >
                    催促回单
                  </Button>
                </PrivilegeCover>
              );
            }
          } else {
            // 承运商上传
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button type="ghost" onClick={
                    () => this.handlePrompt(PROMPT_TYPES.promptSpPod)
                  }
                >
                  催促回单
                </Button>
              </PrivilegeCover>
            );
          }
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          buttons = null;
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.pending) {
          // 审核回单
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <span>
                <Button type="ghost" onClick={() => this.handleAuditPass(dispatch.pod_id, dispatch.id, dispatch.parent_id)} >
                    接受
                  </Button>
                <Button type="ghost" onClick={() => this.handleAuditReturn(dispatch.id)} >
                    拒绝
                </Button>
              </span>
            </PrivilegeCover>
          );
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
          // 我方拒绝
          buttons = null;
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
          // 提交给上游客户
          buttons = null;
        } else if (dispatch.pod_status === SHIPMENT_POD_STATUS.acceptByClient) {
          // 上游客户已接受
          buttons = null;
        }
      }
    }
    return (
      buttons
    );
  }
}
