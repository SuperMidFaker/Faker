import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Menu, Dropdown, Modal, Tooltip, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_SOURCE, SHIPMENT_VEHICLE_CONNECT } from 'common/constants';
import { hidePreviewer } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadAcceptDispatchers, revokeOrReject, returnShipment } from 'common/reducers/transport-acceptance';
import { doSend,
         doReturn,
         changeDockStatus,
         withDraw } from 'common/reducers/transportDispatch';
import { showDateModal, showVehicleModal, showLocModal, showShipmentAdvanceModal, showSpecialChargeModal } from 'common/reducers/trackingLandStatus';
import { passAudit, returnAudit, showPodModal } from 'common/reducers/trackingLandPod';
import ExportPDF from '../../tracking/land/modals/export-pdf';
import { createFilename } from 'client/util/dataTransform';
import { sendMessage } from 'common/reducers/corps';

const formatMsg = format(messages);
const ButtonGroup = Button.Group;
const DropdownButton = Dropdown.Button;
const MenuItem = Menu.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    avatar: state.account.profile.avatar,
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
    showDateModal,
    showPodModal,
    showLocModal,
    passAudit,
    returnAudit,
    withDraw,
    returnShipment,
    showShipmentAdvanceModal,
    showSpecialChargeModal,
    sendMessage,
  }
)
export default class Footer extends React.Component {
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
    showDateModal: PropTypes.func.isRequired,
    showPodModal: PropTypes.func.isRequired,
    showLocModal: PropTypes.func.isRequired,
    passAudit: PropTypes.func.isRequired,
    returnAudit: PropTypes.func.isRequired,
    withDraw: PropTypes.func.isRequired,
    hidePreviewer: PropTypes.func.isRequired,
    returnShipment: PropTypes.func.isRequired,
    showShipmentAdvanceModal: PropTypes.func.isRequired,
    showSpecialChargeModal: PropTypes.func.isRequired,
    sendMessage: PropTypes.func.isRequired,
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'tracking', 'pod', 'exception']),
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
    const { previewer: { row } } = this.props;
    if (e.key === 'shareShipment') {
      this.props.onShowShareShipmentModal();
    } else if (e.key === 'terminateShipment') {
      this.handleShipmtRevoke(row.disp_id);
    }
  }
  handleShowExportShipment = () => {
    this.setState({ exportPDFvisible: true });
    setTimeout(() => {
      this.setState({ exportPDFvisible: false });
    }, 200);
  }
  handleDownloadPod = () => {
    const { previewer: { row } } = this.props;
    window.open(`${API_ROOTS.default}v1/transport/tracking/exportShipmentPodPDF/${createFilename('pod')}.pdf?shipmtNo=${row.shipmt_no}&podId=${row.pod_id}&publickKey=${row.public_key}`);
  }
  handleShipmtAccept = (dispId) => {
    this.props.loadAcceptDispatchers(
      this.props.tenantId, [dispId]
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleShipmtRevoke = (dispId) => {
    this.props.revokeOrReject('revoke', dispId);
  }
  handleShipmtReject = (dispId) => {
    this.props.revokeOrReject('reject', dispId);
  }
  handleShipmtSend = (shipmt) => {
    let msg = `将【${shipmt.shipmt_no}】运单发送给【${shipmt.sp_name}】？`;
    if (!shipmt.sp_tenant_id && shipmt.task_id > 0) {
      msg = `将【${shipmt.shipmt_no}】运单发送给【${shipmt.task_vehicle}】？`;
    }
    Modal.confirm({
      title: '确认发送运单',
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId, loginId, avatar, loginName } = this.props;
        this.props.doSend(null, {
          tenantId,
          loginId,
          avatar,
          loginName,
          list: JSON.stringify([{ dispId: shipmt.key,
          shipmtNo: shipmt.shipmt_no,
          sp_tenant_id: shipmt.sp_tenant_id,
          sr_name: shipmt.sr_name,
          status: shipmt.status,
          consigner_province: shipmt.consigner_province,
          consigner_city: shipmt.consigner_city,
          consigner_district: shipmt.consigner_district,
          consignee_province: shipmt.consignee_province,
          consignee_city: shipmt.consignee_city,
          consignee_district: shipmt.consignee_district,
          parentId: shipmt.parent_id }]),
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          }
        });
      },
    });
  }
  handleShipmtReturn = (shipmt) => {
    let msg = `将预分配给【${shipmt.sp_name}】的【${shipmt.shipmt_no}】运单退回吗？`;
    if (!shipmt.sp_tenant_id && shipmt.task_id > 0) {
      msg = `将预分配给【${shipmt.task_vehicle}】的【${shipmt.shipmt_no}】运单退回吗？`;
    }

    Modal.confirm({
      title: '确认退回运单',
      content: msg,
      okText: this.msg('btnTextOk'),
      cancelText: this.msg('btnTextCancel'),
      onOk: () => {
        const { tenantId } = this.props;
        this.props.doReturn(null, {
          tenantId,
          dispId: shipmt.key,
          parentId: shipmt.parent_id,
          shipmtNo: shipmt.shipmt_no,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          }
        });
      },
    });
  }
  handleDispatchDockShow = (shipmt) => {
    this.props.changeDockStatus({ dispDockShow: true, shipmts: [shipmt] });
  }
  handleSegmentDockShow = (shipmt) => {
    this.props.changeDockStatus({ segDockShow: true, shipmts: [shipmt] });
  }
  handleShowVehicleModal = (row) => {
    this.props.showVehicleModal(row.disp_id, row.shipmt_no);
  }
  handleShowPickModal = (row) => {
    const shipments = [{ dispId: row.disp_id, shipmtNo: row.shipmt_no }];
    this.props.showDateModal(shipments, 'pickup');
  }
  handleShowDeliverModal = (row) => {
    const shipments = [{ dispId: row.disp_id, shipmtNo: row.shipmt_no }];
    this.props.showDateModal(shipments, 'deliver');
  }
  handleShowPodModal = (row) => {
    this.props.showPodModal(-1, row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShowShipmentAdvanceModal = (row) => {
    this.props.showShipmentAdvanceModal({ visible: true, dispId: row.parent_id, shipmtNo: row.shipmt_no,
      transportModeId: row.transport_mode_id, customerPartnerId: row.customer_partner_id, goodsType: row.goods_type });
  }
  handleShowSpecialChargeModal = (row) => {
    this.props.showSpecialChargeModal({ visible: true, dispId: row.disp_id, shipmtNo: row.shipmt_no,
      parentDispId: row.parent_id, spTenantId: row.sp_tenant_id });
  }
  handleResubmit = (row) => {
    this.props.showPodModal(row.pod_id, row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShowTransitModal = (row) => {
    this.props.showLocModal({
      shipmt_no: row.shipmt_no,
      parent_no: row.parent_no,
    });
  }
  handleAuditPass = (row) => {
    const { loginName, tenantId, loginId } = this.props;
    this.props.passAudit(row.pod_id, row.disp_id, row.parent_id, loginName, tenantId, loginId).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.hidePreviewer();
      }
    });
  }
  handleAuditReturn = (row) => {
    this.props.returnAudit(row.disp_id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.hidePreviewer();
      }
    });
  }
  handleWithDraw = (row) => {
    const { tenantId, loginId, loginName } = this.props;
    const list = [{ dispId: row.disp_id, shipmtNo: row.shipmt_no, parentId: row.parent_id }];
    this.props.withDraw({ tenantId, loginId, loginName, list: JSON.stringify(list) }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.hidePreviewer();
      }
    });
  }
  handleReturn = (row) => {
    const { tenantId, loginId, loginName } = this.props;
    const shipmtDispIds = [row.key];
    this.props.returnShipment({ shipmtDispIds, tenantId, loginId, loginName }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.hidePreviewer();
      }
    });
  }
  render() {
    const { tenantId, stage, previewer: { shipmt, dispatch, row } } = this.props;
    let menu = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="shareShipment">共享运单</MenuItem>
      </Menu>
    );
    let buttons = <div />;
    if (stage === 'acceptance') {
      if (row.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        if (row.source === SHIPMENT_SOURCE.consigned) {
          buttons = (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <ButtonGroup>
                <Button type="ghost" onClick={() => this.handleShipmtAccept(row.key)} >
                  接单
                </Button>
                <Button type="ghost" onClick={() => this.context.router.push(`/transport/shipment/edit/${row.shipmt_no}`)}>
                  修改
                </Button>
              </ButtonGroup>
            </PrivilegeCover>
          );
          menu = (<div />);
        } else if (row.source === SHIPMENT_SOURCE.subcontracted) {
          buttons = (
            <PrivilegeCover module="transport" feature="shipment" action="edit">
              <Button type="ghost" onClick={() => this.handleShipmtAccept(row.key)} >
                接单
              </Button>
            </PrivilegeCover>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.accepted) {
        buttons = (
          <PrivilegeCover module="transport" feature="shipment" action="edit">
            <Tooltip placement="top" title="退回至未接单状态">
              <Button type="ghost" onClick={() => this.handleReturn(row)}>
                退回
              </Button>
            </Tooltip>
          </PrivilegeCover>
        );
        if (shipmt.tenant_id === tenantId) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
              <MenuItem key="terminateShipment">终止运单</MenuItem>
            </Menu>
          );
        }
      }
      return (
        <div className="toolbar">
          {buttons}
          <span />
          <DropdownButton type="ghost" overlay={menu} onClick={this.handleShowExportShipment}>
            <Icon type="export" />
          </DropdownButton>
          <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={row.shipmt_no} publickKey={shipmt.public_key} />
        </div>
      );
    } else if (stage === 'dispatch') {
      if (row.child_send_status === 0 && row.status === 2 && row.disp_status === 1 && row.sp_tenant_id === tenantId) {
        buttons = (
          <PrivilegeCover module="transport" feature="dispatch" action="create">
            <ButtonGroup>
              <Button type="ghost" onClick={() => this.handleDispatchDockShow(row)} >
                分配
              </Button>
              <Button type="ghost" onClick={() => this.handleSegmentDockShow(row)} >
                分段
              </Button>
            </ButtonGroup>
          </PrivilegeCover>
        );
      } else if (row.disp_status === 0 && row.sr_tenant_id === tenantId) {
        buttons = (
          <PrivilegeCover module="transport" feature="dispatch" action="edit">
            <ButtonGroup>
              <Button type="ghost" onClick={() => this.handleShipmtSend(row)} >
                发送
              </Button>
              <Button type="ghost" onClick={() => this.handleShipmtReturn(row)}>
                退回
              </Button>
            </ButtonGroup>
          </PrivilegeCover>
        );
      } else if (row.disp_status > 0 && row.sr_tenant_id === tenantId) {
        if (dispatch.downstream_status === 1) {
          buttons = (
            <PrivilegeCover module="transport" feature="dispatch" action="edit">
              <Tooltip placement="top" title="承运商尚未接单，可立即撤回">
                <Button type="ghost" onClick={() => this.handleWithDraw(row)} >
                  撤回
                </Button>
              </Tooltip>
            </PrivilegeCover>
          );
        }
      }
      if (row.status <= SHIPMENT_TRACK_STATUS.dispatched && shipmt.tenant_id === tenantId) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="shareShipment">共享运单</MenuItem>
            <MenuItem key="terminateShipment">终止运单</MenuItem>
          </Menu>
        );
      }
      return (
        <div className="toolbar">
          {buttons}
          <span />
          <DropdownButton type="ghost" overlay={menu} onClick={this.handleShowExportShipment}>
            <Icon type="export" />
          </DropdownButton>
          <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={row.shipmt_no} publickKey={shipmt.public_key} />
        </div>
      );
    } else if (stage === 'tracking') {
      if (row.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        buttons = (
          <PrivilegeCover module="transport" feature="tracking" action="create">
            <Button type="ghost" onClick={
              () => this.props.sendMessage({ notifyType: 'notifyAccept', shipment: row })
            }
            >
                催促接单
            </Button>
          </PrivilegeCover>
        );
        if (shipmt.tenant_id === tenantId) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
              <MenuItem key="terminateShipment">终止运单</MenuItem>
            </Menu>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.accepted) {
        if (row.sp_tenant_id === -1) {
            // 线下客户手动更新
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <Button type="ghost" onClick={() => this.handleShowVehicleModal(row)} >
                  更新车辆司机
              </Button>
            </PrivilegeCover>
          );
        } else {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button type="ghost" onClick={() => this.props.sendMessage({ notifyType: 'notifyDispatch', shipment: row })} >
                  催促调度
              </Button>
            </PrivilegeCover>
          );
        }
        if (shipmt.tenant_id === tenantId) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
              <MenuItem key="terminateShipment">终止运单</MenuItem>
            </Menu>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (row.sp_tenant_id === -1) {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <Button type="ghost" onClick={() => this.handleShowPickModal(row)} >
                更新提货
              </Button>
            </PrivilegeCover>
          );
        } else if (row.sp_tenant_id === 0) {
            // 已分配给车队
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              // 线下司机
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <Button type="ghost" size="large"
                  onClick={() => this.handleShowPickModal(row)}
                >
                  更新提货
                </Button>
              </PrivilegeCover>
            );
          } else {
            // 司机更新
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button type="ghost" onClick={
                    () => this.props.sendMessage({ notifyType: 'notifyDriverPickup', shipment: row })
                  }
                >
                    催促提货
                </Button>
              </PrivilegeCover>
            );
          }
        } else {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button type="ghost" onClick={
                  () => this.props.sendMessage({ notifyType: 'notifySpPickup', shipment: row })
                }
              >
                  催促提货
              </Button>
            </PrivilegeCover>
          );
        }
        if (shipmt.tenant_id === tenantId) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
              <MenuItem key="terminateShipment">终止运单</MenuItem>
            </Menu>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (row.sp_tenant_id === -1) {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <ButtonGroup>
                <Button type="ghost" onClick={() => this.handleShowDeliverModal(row)} >
                  更新送货
                </Button>
                <Button type="ghost" onClick={() => this.handleShowTransitModal(row)} >
                  上报位置
                </Button>
                <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(row)} >
                  添加垫付费用
                </Button>
                <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(row)} >
                  添加特殊费用
                </Button>
              </ButtonGroup>
            </PrivilegeCover>
          );
        } else if (row.sp_tenant_id === 0) {
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <ButtonGroup>
                  <Button type="ghost" onClick={() => this.handleShowDeliverModal(row)} >
                    更新送货
                  </Button>
                  <Button type="ghost" onClick={() => this.handleShowTransitModal(row)} >
                    上报位置
                  </Button>
                  <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(row)} >
                    添加垫付费用
                  </Button>
                  <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(row)} >
                    添加特殊费用
                  </Button>
                </ButtonGroup>
              </PrivilegeCover>
            );
          } else {
            // 司机更新
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <ButtonGroup>
                  <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(row)} >
                    添加代垫费用
                  </Button>
                  <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(row)} >
                    添加特殊费用
                  </Button>
                </ButtonGroup>
              </PrivilegeCover>
            );
          }
        } else {
          // 承运商更新
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <ButtonGroup>
                <Button type="ghost" onClick={() => this.handleShowShipmentAdvanceModal(row)} >
                    添加代垫费用
                </Button>
                <Button type="ghost" onClick={() => this.handleShowSpecialChargeModal(row)} >
                    添加特殊费用
                </Button>
              </ButtonGroup>
            </PrivilegeCover>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.delivered) {
        if (row.pod_type === 'none') {
          buttons = <div />;
        } else if (row.sp_tenant_id === -1) {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button type="ghost" size="large"
                onClick={() => this.handleShowPodModal(row)}
              >
                  上传回单
              </Button>
            </PrivilegeCover>
          );
        } else if (row.sp_tenant_id === 0) {
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button type="ghost" size="large"
                  onClick={() => this.handleShowPodModal(row)}
                >
                    上传回单
                </Button>
              </PrivilegeCover>
            );
          } else {
            // 司机上传
            buttons = <div />;
          }
        } else {
          // 承运商上传
          buttons = <div />;
        }
      }
      return (
        <div className="toolbar">
          {buttons}
          <span />
          <DropdownButton type="ghost" overlay={menu} onClick={this.handleShowExportShipment}>
            <Icon type="export" />
          </DropdownButton>
          <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={row.shipmt_no} publickKey={shipmt.public_key} />
        </div>
      );
    } else if (stage === 'pod') {
      if (row.pod_status === null || row.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
        if (row.sp_tenant_id === -1) {
          buttons = (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <Button type="ghost" onClick={() => this.handleShowPodModal(row)} >
                  上传回单
              </Button>
            </PrivilegeCover>
          );
        } else if (row.sp_tenant_id === 0) {
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button type="ghost" onClick={() => this.handleShowPodModal(row)} >
                    上传回单
                </Button>
              </PrivilegeCover>
            );
          } else {
            // 司机上传
            buttons = (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <Button type="ghost" onClick={
                    () => this.props.sendMessage({ notifyType: 'notifyDriverPod', shipment: row })
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
                  () => this.props.sendMessage({ notifyType: 'notifySpPod', shipment: row })
                }
              >
                  催促回单
              </Button>
            </PrivilegeCover>
          );
        }
        return (
          <div className="toolbar">
            {buttons}
            <span />
            <PrivilegeCover module="transport" feature="shipment" action="create">
              <div className="more-actions">
                <DropdownButton overlay={menu} />
              </div>
            </PrivilegeCover>
          </div>
        );
      } else if (row.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
        // 重新上传
        buttons = (
          <PrivilegeCover module="transport" feature="tracking" action="edit">
            <Button type="ghost" size="large"
              onClick={() => this.handleResubmit(row)}
            >
                重新上传回单
            </Button>
          </PrivilegeCover>
        );
        return (
          <div className="toolbar">
            {buttons}
            <span />
            <DropdownButton overlay={menu} />
          </div>
        );
      } else if (row.pod_status === SHIPMENT_POD_STATUS.pending) {
        // 审核回单
        buttons = (
          <PrivilegeCover module="transport" feature="tracking" action="edit">
            <ButtonGroup>
              <Button type="ghost" onClick={() => this.handleAuditPass(row)} >
                接受
              </Button>
              <Button type="ghost" onClick={() => this.handleAuditReturn(row)} >
                拒绝
              </Button>
            </ButtonGroup>
          </PrivilegeCover>
        );
      } else if (row.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
        // 我方拒绝
        buttons = (<div />);
      } else if (row.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
        // 提交给上游客户
        buttons = (<div />);
      } else if (row.pod_status === SHIPMENT_POD_STATUS.acceptByClient) {
        // 上游客户已接受
        buttons = (<div />);
      }
      return (
        <div className="toolbar">
          {buttons}
          <span />
          <DropdownButton overlay={menu} onClick={this.handleDownloadPod}>
            <Icon type="download" />
          </DropdownButton>
          <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={row.shipmt_no} publickKey={shipmt.public_key} />
        </div>
      );
    } else if (stage === 'exception') {
      buttons = (<div />);
    }
    return (
      <div className="toolbar">
        {buttons}
        <span />
        <DropdownButton type="ghost" overlay={menu} onClick={this.handleShowExportShipment}>
          <Icon type="export" />
        </DropdownButton>
        <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={row.shipmt_no} publickKey={shipmt.public_key} />
      </div>
    );
  }
}
