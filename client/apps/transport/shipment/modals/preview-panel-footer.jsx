import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Menu, Dropdown, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_EFFECTIVES, SHIPMENT_POD_STATUS, SHIPMENT_SOURCE, SHIPMENT_VEHICLE_CONNECT } from 'common/constants';
import { hidePreviewer } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import './preview-panel.less';
import { loadAcceptDispatchers, revokeOrReject, delDraft } from
'common/reducers/transport-acceptance';
import { doSend,
         doReturn,
         segmentCancelRequest,
         segmentCancelCheckRequest,
         loadExpandList,
         loadShipmtsGrouped,
         loadShipmtsGroupedSub,
         loadSegRq,
         removeGroupedSubShipmt,
         changeDockStatus } from 'common/reducers/transportDispatch';
import {
  loadTransitTable, showPodModal, showDateModal, showVehicleModal,
  showLocModal, loadShipmtLastPoint,
} from 'common/reducers/trackingLandStatus';
const formatMsg = format(messages);
const DropdownButton = Dropdown.Button;

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
    showLocModal }
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
    stage: PropTypes.oneOf(['acceptance', 'dispatch', 'tracking', 'pod', 'exception']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)

  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  handleMenuClick = (e) => {
    if (e.key === 'shareShipment') {
      this.props.onShowShareShipmentModal();
    }
  }
  handleShipmtAccept(dispId) {
    this.props.loadAcceptDispatchers(
      this.props.tenantId, [dispId]
    ).then(result => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleShipmtRevoke(dispId) {
    this.props.revokeOrReject('revoke', dispId);
  }
  handleShipmtReject(dispId) {
    this.props.revokeOrReject('reject', dispId);
  }
  handleShipmtSend(shipmt) {
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
        }).then(result => {
          if (result.error) {
            message.error(result.error.message, 5);
          }
        });
      },
    });
  }
  handleShipmtReturn(shipmt) {
    const { status } = this.props.filters;
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
        }).then(result => {
          if (result.error) {
            message.error(result.error.message, 5);
          }
        });
      },
    });
  }
  handleDispatchDockShow(shipmt) {
    this.props.changeDockStatus({ dispDockShow: true, shipmts: [shipmt] });
  }
  handleSegmentDockShow(shipmt) {
    this.props.changeDockStatus({ segDockShow: true, shipmts: [shipmt] });
  }
  handleShowVehicleModal = (row) => {
    this.props.showVehicleModal(row.disp_id, row.shipmt_no);
  }
  handleShowPickModal = (row) => {
    this.props.showDateModal(row.disp_id, row.shipmt_no, 'pickup');
  }
  handleShowDeliverModal = (row) => {
    this.props.showDateModal(row.disp_id, row.shipmt_no, 'deliver');
  }
  handleShowPodModal = (row) => {
    this.props.showPodModal(row.disp_id, row.parent_id, row.shipmt_no);
  }
  handleShowTransitModal = (row) => {
    this.props.showLocModal({
      shipmt_no: row.shipmt_no,
      parent_no: row.parent_no,
      pickup_act_date: row.pickup_act_date,
    });
  }
  renderButtons() {
    const { tenantId, stage, previewer: { tracking, row } } = this.props;
    const dispatch = {};
    console.log(`stage: ${stage}`);
    console.log('row:');
    console.log(row);
    const defaultButtonStyle = { marginRight: 30 };
    if (stage === 'acceptance') {
      if (row.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        if (row.source === SHIPMENT_SOURCE.consigned) {
          return (
            <div>
              <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShipmtAccept(row.key)} >
                接单
              </Button>
              <Button type="default" onClick={() => this.handleShipmtRevoke(row.key)}>
                作废
              </Button>
            </div>
          );
        } else if (row.source === SHIPMENT_SOURCE.subcontracted) {
          return (
            <div>
              <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShipmtAccept(row.key)} >
                接单
              </Button>
              <Button type="default" onClick={() => this.handleShipmtReject(row.key)}>
                退回
              </Button>
            </div>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.undispatched) {
        return (
          <div>
            <Button type="default">
              退回
            </Button>
          </div>
        );
      }
    } else if (stage === 'dispatch') {
      if (row.child_send_status === 0 && row.status === 2 && row.disp_status === 1 && row.sp_tenant_id === tenantId) {
        return (
          <div>
            <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleDispatchDockShow(row)} >
              分配
            </Button>
            <Button type="default" onClick={() => this.handleSegmentDockShow(row)} >
              分段
            </Button>
          </div>
        );
      } else if (row.disp_status === 0 && row.sr_tenant_id === tenantId) {
        return (
          <div>
            <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShipmtSend(row)} >
              发送
            </Button>
            <Button type="default" onClick={() => this.handleShipmtReturn(row)}>
              取消分配
            </Button>
          </div>
        );
      } else if (row.disp_status > 0 && row.sr_tenant_id === tenantId) {
        if (tracking.downstream_status === 1 || row.status === SHIPMENT_TRACK_STATUS.undelivered) {
          return (
            <div>
              <Button type="default">
                撤回
              </Button>
            </div>
          );
        }
      }
    } else if (stage === 'tracking') {
      if (row.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return (
          <div>
            <Button type="default">
              催促接单
            </Button>
          </div>
        );
      } else if (row.status === SHIPMENT_TRACK_STATUS.undispatched) {
        if (row.sp_tenant_id === -1) {
            // 线下客户手动更新
          return (
            <div>
              <Button type="default" onClick={() => this.handleShowVehicleModal(row)} >
                更新车辆司机
              </Button>
            </div>
          );
        } else {
          return (
            <div>
              <Button type="default">
                催促调度
              </Button>
            </div>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.undelivered) {
        if (row.sp_tenant_id === -1) {
          return (
            <div>
              <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShowPickModal(row)} >
                更新提货
              </Button>
            </div>
          );
        } else if (row.sp_tenant_id === 0) {
            // 已分配给车队
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              // 线下司机
            return (
              <div>
                <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShowPickModal(row)} >
                  更新提货
                </Button>
              </div>
            );
          } else {
            // 司机更新
            return (
              <div>
              </div>
            );
          }
        } else {
          return (
            <div>
              <Button type="default">
                催促提货
              </Button>
            </div>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (row.sp_tenant_id === -1) {
          return (
            <div>
              <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShowDeliverModal(row)} >
                更新交货
              </Button>
              <Button type="default" onClick={() => this.handleShowTransitModal(row)} >
                上报位置
              </Button>
            </div>
          );
        } else if (row.sp_tenant_id === 0) {
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            return (
              <div>
                <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShowDeliverModal(row)} >
                  更新交货
                </Button>
                <Button type="default" onClick={() => this.handleShowTransitModal(row)} >
                  上报位置
                </Button>
              </div>
            );
          } else {
            // 司机更新
            return (
              <div>
              </div>
            );
          }
        } else {
          // 承运商更新
          return (
            <div>
            </div>
          );
        }
      } else if (row.status === SHIPMENT_TRACK_STATUS.delivered) {
        if (row.pod_status === SHIPMENT_POD_STATUS.unrequired) {
          return <span />;
        } else if (row.sp_tenant_id === -1) {
          return (
            <div>
              <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShowPodModal(row)} >
                上传回单
              </Button>
            </div>
          );
        } else if (row.sp_tenant_id === 0) {
          if (row.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            return (
              <div>
                <Button type="primary" style={defaultButtonStyle} onClick={() => this.handleShowPodModal(row)} >
                  上传回单
                </Button>
              </div>
            );
          } else {
            // 司机上传
            return (
              <div>
                <Button type="default">
                  催促回单
                </Button>
              </div>
            );
          }
        } else {
          // 承运商上传
          return (
            <div>
              <Button type="default">
                催促回单
              </Button>
            </div>
          );
        }
      }
    } else if (stage === 'pod') {
      if (row.pod_status === SHIPMENT_POD_STATUS.pending) {
        // 审核回单
        return (
          <div>
            <Button type="primary" style={defaultButtonStyle} >
              接受
            </Button>
            <Button type="default">
              拒绝
            </Button>
          </div>
        );
      } else if (row.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
        // 我方拒绝
        return (<div></div>);
      } else if (row.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
        // 提交给上游客户
        return (<div></div>);
      } else if (row.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
        // 重新上传
        return (
          <div>
            <Button type="primary" style={defaultButtonStyle} >
              重新上传回单
            </Button>
          </div>
        );
      } else {
        // 上游客户已接受
        return (<div></div>);
      }
    } else if (stage === 'exception') {
      return (<div></div>);
    }
    return (<div></div>);
  }
  render() {
    const { visible, shipmtNo, status, effective } = this.props;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="shareShipment">共享运单</Menu.Item>
      </Menu>
    );
    return (
      <div className="footer">
        {this.renderButtons()}
        <div className="more-actions">
          <DropdownButton overlay={menu}>
            <Icon type="export" />导出
          </DropdownButton>
        </div>
      </div>
    );
  }
}
