import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Tooltip, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_SOURCE, SHIPMENT_VEHICLE_CONNECT, PROMPT_TYPES } from 'common/constants';
import { hidePreviewer, toggleRecalculateChargeModal } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadAcceptDispatchers, returnShipment } from 'common/reducers/transport-acceptance';
import { doSend,
         doReturn,
         changeDockStatus,
         withDraw } from 'common/reducers/transportDispatch';
import { showVehicleModal }
from 'common/reducers/trackingLandStatus';
import { passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import { createFilename } from 'client/util/dataTransform';
import { sendMessage } from 'common/reducers/notification';

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
    charges: state.shipment.charges,
  }),
  { hidePreviewer,
    loadAcceptDispatchers,
    changeDockStatus,
    doReturn,
    doSend,
    showVehicleModal,
    passAudit,
    returnAudit,
    withDraw,
    returnShipment,
    sendMessage,
    toggleRecalculateChargeModal,
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
    loadAcceptDispatchers: PropTypes.func.isRequired,
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
    sendMessage: PropTypes.func.isRequired,
    sourceType: PropTypes.string.isRequired,
    charges: PropTypes.object.isRequired,
    toggleRecalculateChargeModal: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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
  handleShipmtAccept = (dispId) => {
    this.props.loadAcceptDispatchers(
      this.props.tenantId, [dispId]
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
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
    const { tenantId, sourceType, previewer: { shipmt, dispatch, downstream, row }, charges } = this.props;
    const needRecalculate = charges.revenue.need_recalculate === 1 || charges.expense.need_recalculate === 1;
    let buttons = [];
    if (sourceType === 'sp') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        if (dispatch.source === SHIPMENT_SOURCE.consigned) {
          buttons.push(<PrivilegeCover module="transport" feature="shipment" action="edit">
            <Button key="change" onClick={() => this.context.router.push(`/transport/shipment/edit/${shipmt.shipmt_no}`)}>
                  修改
                </Button>
          </PrivilegeCover>,
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Button key="accept" type="primary" icon="check" onClick={() => this.handleShipmtAccept(dispatch.id)} style={{ marginLeft: 8 }}>
                    接单
                  </Button>
            </PrivilegeCover>);
        } else if (dispatch.source === SHIPMENT_SOURCE.subcontracted) {
          buttons.push(
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Button key="accept" type="primary" icon="check" onClick={() => this.handleShipmtAccept(dispatch.id)} >
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
              <Button key="segment" onClick={() => this.handleSegmentDockShow()} >
                分段
              </Button>
            </PrivilegeCover>,
            <PrivilegeCover module="transport" feature="dispatch" action="create">
              <Button key="dispatch" type="primary" onClick={() => this.handleDispatchDockShow()} style={{ marginLeft: 8 }} >
                分配
              </Button>
            </PrivilegeCover>
          );
        } else if (dispatch.disp_status === 0 && row.sr_tenant_id === tenantId) {
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
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (dispatch.disp_status > 0 && row.sr_tenant_id === tenantId) {
          if (downstream.status === 1) {
            buttons.push(
              <PrivilegeCover module="transport" feature="dispatch" action="edit">
                <Tooltip placement="bottom" title="承运商尚未接单，可立即撤回">
                  <Button key="withDraw" type="ghost" onClick={() => this.handleWithDraw(shipmt.shipmt_no, row.disp_id, row.parent_id)} >
                    撤回
                  </Button>
                </Tooltip>
              </PrivilegeCover>
            );
          }
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
}
