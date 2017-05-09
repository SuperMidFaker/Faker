import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Menu, Dropdown, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { SHIPMENT_TRACK_STATUS } from 'common/constants';
import { hidePreviewer } from 'common/reducers/shipment';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadAcceptDispatchers, returnShipment } from 'common/reducers/transport-acceptance';
import { doSend,
         doReturn,
         changeDockStatus,
         withDraw } from 'common/reducers/transportDispatch';
import { showVehicleModal, showChangeActDateModal }
from 'common/reducers/trackingLandStatus';
import { showAdvanceModal, showSpecialChargeModal } from 'common/reducers/transportBilling';
import { passAudit, returnAudit } from 'common/reducers/trackingLandPod';
import ExportPDF from '../../tracking/land/modals/export-pdf';
import { createFilename } from 'client/util/dataTransform';
import { sendMessage } from 'common/reducers/corps';

const formatMsg = format(messages);
const MenuItem = Menu.Item;

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
    const { sourceType, previewer: { shipmt, dispatch } } = this.props;
    let menu = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
        <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
      </Menu>
    );
    if (sourceType === 'sp') {
      menu = (
        <Menu onClick={this.handleMenuClick}>
          <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
          <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
        </Menu>
      );
    } else if (sourceType === 'sr') {
      if (dispatch.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
            <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
          </Menu>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.accepted) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
            <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
          </Menu>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.dispatched) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="exportShipment"><Icon type="export" /> 导出运单</MenuItem>
            <MenuItem key="shareShipment"><Icon type="share-alt" /> 共享运单</MenuItem>
          </Menu>
        );
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (dispatch.sp_tenant_id === -1) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
              <MenuItem key="changeActDate">纠正节点时间</MenuItem>
            </Menu>
          );
        } else if (dispatch.sp_tenant_id === 0) {
          menu = (
            <Menu onClick={this.handleMenuClick}>
              <MenuItem key="shareShipment">共享运单</MenuItem>
              <MenuItem key="changeActDate">纠正节点时间</MenuItem>
            </Menu>
          );
        }
      } else if (dispatch.status === SHIPMENT_TRACK_STATUS.delivered) {
        menu = (
          <Menu onClick={this.handleMenuClick}>
            <MenuItem key="shareShipment">共享运单</MenuItem>
            <MenuItem key="changeActDate">纠正节点时间</MenuItem>
          </Menu>
        );
      }
    }
    return (
      <PrivilegeCover module="transport" feature="shipment" action="create">
        <Dropdown overlay={menu}>
          <Button><Icon type="setting" /> <Icon type="down" /></Button>
        </Dropdown>
        <ExportPDF visible={this.state.exportPDFvisible} shipmtNo={shipmt.shipmt_no} publickKey={shipmt.public_key} />
      </PrivilegeCover>
    );
  }
}
