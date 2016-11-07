import React from 'react';
import moment from 'moment';
import { Icon, Tag, Tooltip } from 'antd';
import TrimSpan from 'client/components/trimSpan';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_VEHICLE_CONNECT } from
  'common/constants';
import RowUpdater from './rowUpdater';
import { renderConsignLoc } from '../../common/consignLocation';
import ShipmtnoColumn from '../../common/shipmtnoColumn';
import PickupDeliverUpdaterPopover from './modals/pickup-deliver-updater-popover';
import ExceptionListPopover from './modals/exception-list-popover';

function renderActDate(recordActDate, recordEstDate) {
  if (recordActDate) {
    const actDate = new Date(recordActDate);
    actDate.setHours(0, 0, 0, 0);
    const estDate = new Date(recordEstDate);
    estDate.setHours(0, 0, 0, 0);
    if (actDate.getTime() > estDate.getTime()) {
      return (
        <span className="mdc-text-red">
          {moment(recordActDate).format('YYYY.MM.DD')}
        </span>);
    } else {
      return (
        <span className="mdc-text-green">
          {moment(recordActDate).format('YYYY.MM.DD')}
        </span>);
    }
  } else {
    return <span />;
  }
}
export default function makeColumns(type, handlers, msg) {
  const columns = [{
    title: msg('shipNo'),
    dataIndex: 'shipmt_no',
    fixed: 'left',
    width: 150,
    render: (o, record) => {
      return (
        <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key}
          shipment={record} onClick={handlers.onShipmtPreview}
        />);
    },
  }, {
    title: msg('spDispLoginName'),
    dataIndex: 'sp_disp_login_name',
  }, {
    title: msg('refCustomerNo'),
    dataIndex: 'ref_external_no',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: msg('departurePlace'),
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} maxLen={8} />,
  }, {
    title: msg('shipmtEstPickupDate'),
    dataIndex: 'pickup_est_date',
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD'),
  }, {
    title: msg('shipmtActPickupDate'),
    dataIndex: 'pickup_act_date',
    render: (o, record) => {
      if (type !== 'pod' && type === 'status' && record.status === SHIPMENT_TRACK_STATUS.dispatched) {
        if (record.sp_tenant_id === -1) {
          return (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <PickupDeliverUpdaterPopover
                type="pickup"
                shipmtNo={record.shipmt_no}
                dispId={record.disp_id}
                onOK={handlers.onTableLoad}
              >
                <Icon type="edit" />{msg('updatePickup')}
              </PickupDeliverUpdaterPopover>
            </PrivilegeCover>
          );
        } else if (record.sp_tenant_id === 0) {
            // 已分配给车队
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              // 线下司机
            return (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <PickupDeliverUpdaterPopover
                  type="pickup"
                  shipmtNo={record.shipmt_no}
                  dispId={record.disp_id}
                  onOK={handlers.onTableLoad}
                >
                  <Icon type="edit" />{msg('updatePickup')}
                </PickupDeliverUpdaterPopover>
              </PrivilegeCover>
            );
          }
        }
      } else {
        return renderActDate(record.pickup_act_date, record.pickup_est_date);
      }
    },
  }, {
    title: msg('arrivalPlace'),
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} maxLen={8} />,
  }, {
    title: msg('shipmtEstDeliveryDate'),
    dataIndex: 'deliver_est_date',
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD'),
  }, {
    title: msg('shipmtActDeliveryDate'),
    dataIndex: 'deliver_act_date',
    render: (o, record) => {
      if (type !== 'pod' && type === 'status' && record.status === SHIPMENT_TRACK_STATUS.intransit) {
        if (record.sp_tenant_id === -1) {
          return (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <PickupDeliverUpdaterPopover
                type="deliver"
                shipmtNo={record.shipmt_no}
                dispId={record.disp_id}
                onOK={handlers.onTableLoad}
              >
                <Icon type="edit" />{msg('updateDelivery')}
              </PickupDeliverUpdaterPopover>
            </PrivilegeCover>
          );
        } else if (record.sp_tenant_id === 0) {
          if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
            return (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <PickupDeliverUpdaterPopover
                  type="deliver"
                  shipmtNo={record.shipmt_no}
                  dispId={record.disp_id}
                  onOK={handlers.onTableLoad}
                >
                  <Icon type="edit" />{msg('updateDelivery')}
                </PickupDeliverUpdaterPopover>
              </PrivilegeCover>
            );
          }
        }
      } else {
        return renderActDate(record.deliver_act_date, record.deliver_est_date);
      }
    },
  }, {
    title: msg('shipmtStatus'),
    dataIndex: 'status',
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
        return <Tag>{msg('pendingShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
        return <Tag>{msg('acceptedShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
        return <Tag color="yellow">{msg('dispatchedShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
        return <Tag color="blue">{msg('intransitShipmt')}</Tag>;
      } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
        return <Tag color="green">{msg('deliveredShipmt')}</Tag>;
      } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
        return <Tag color="green">{msg('proofOfDelivery')}</Tag>;
      } else {
        return <span />;
      }
    },
  }, {
    title: msg('shipmtException'),
    dataIndex: 'excp_count',
    render(o, record) {
      return (<ExceptionListPopover
        shipmtNo={record.shipmt_no}
        dispId={record.disp_id}
        excpCount={o}
      />);
    },
  }];

  columns.push({
    title: msg('shipmtCarrier'),
    dataIndex: 'sp_name',
    render: (o, record) => {
      if (record.sp_name) {
        const spSpan = <TrimSpan text={record.sp_name} maxLen={10} />;
        if (record.sp_tenant_id > 0) {
            // todo pure css circle
          return (
            <span>
              <i className="zmdi zmdi-circle mdc-text-green" />
              {spSpan}
            </span>
          );
        } else if (record.sp_tenant_id === -1) {
          return (
            <span>
              <i className="zmdi zmdi-circle mdc-text-grey" />
              {spSpan}
            </span>
          );
        } else {
          return spSpan;
        }
      } else {
        return msg('ownFleet');
      }
    },
  }, {
    title: msg('shipmtVehicle'),
    dataIndex: 'task_vehicle',
    render: (o, record) => {
      if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
        if (record.sp_tenant_id === -1) { // 线下客户手动更新
          return (
            <PrivilegeCover module="transport" feature="tracking" action="edit">
              <RowUpdater label={msg('updateVehicleDriver')}
                onAnchored={handlers.onShowVehicleModal} row={record}
              />
            </PrivilegeCover>
          );
        }
      } else {
        return (<TrimSpan text={o} maxLen={14} />);
      }
    },
  }, {
    title: msg('packageNum'),
    dataIndex: 'total_count',
  }, {
    title: msg('shipWeight'),
    dataIndex: 'total_weight',
  }, {
    title: msg('shipVolume'),
    dataIndex: 'total_volume',
  }, {
    title: msg('shipmtCustomer'),
    dataIndex: 'customer_name',
    render: o => <TrimSpan text={o} maxLen={10} />,
  }, {
    title: msg('shipmtMode'),
    dataIndex: 'transport_mode',
  });

  if (type === 'pod') { // 回单处理
    columns.push({
      title: msg('proofOfDelivery'),
      dataIndex: 'pod_type',
      fixed: 'right',
      width: 60,
      render: (text, record) => {
        if (record.pod_type === 'qrPOD') {
          return (<Tooltip title="扫码签收回单"><Icon type="qrcode" /></Tooltip>);
        } else if (record.pod_type === 'ePOD') {
          return (<Tooltip title="拍摄上传回单"><Icon type="scan" /></Tooltip>);
        } else {
          return (<Tooltip title="无须上传回单"><Icon type="file-excel" /></Tooltip>);
        }
      },
    }, {
      title: msg('podTime'),
      fixed: 'right',
      width: 120,
      render: (o, record) => {
        if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          return `${msg('podUploadAction')}
            ${moment(record.pod_recv_date).format('MM.DD HH:mm')}`;
        }
      },
    }, {
      title: msg('podStatus'),
      fixed: 'right',
      width: 100,
      render: (o, record) => {
        if (record.pod_status === null || record.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
          return '未上传';
        } else if (record.pod_status === SHIPMENT_POD_STATUS.pending) {
          return '已上传';
        } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
          return '我方拒绝';
        } else if (record.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
          return '我方接受';
        } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          return '客户拒绝';
        } else if (record.pod_status === SHIPMENT_POD_STATUS.acceptByClient) {
          return '客户接受';
        }
      },
    }, {
      title: msg('shipmtNextUpdate'),
      width: 140,
      fixed: 'right',
      render: (o, record) => {
        if (record.pod_status === null || record.pod_status === SHIPMENT_POD_STATUS.unsubmit) {
          if (record.sp_tenant_id === -1) {
            return (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <RowUpdater label={msg('submitPod')}
                  onAnchored={handlers.onShowPodModal} row={record}
                />
              </PrivilegeCover>
            );
          } else if (record.sp_tenant_id === 0) {
            if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              return (
                <PrivilegeCover module="transport" feature="tracking" action="create">
                  <RowUpdater label={msg('submitPod')}
                    onAnchored={handlers.onShowPodModal} row={record}
                  />
                </PrivilegeCover>
              );
            } else {
              // 司机上传
              return (
                <PrivilegeCover module="transport" feature="tracking" action="create">
                  <RowUpdater label={msg('notifyPOD')} row={record}
                    onAnchored={() => { handlers.sendMessage({ notifyType: 'notifyDriverPod', shipment: record }); }}
                  />
                </PrivilegeCover>
              );
            }
          } else {
            // 承运商上传
            return (
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <RowUpdater label={msg('notifyPOD')} row={record}
                  onAnchored={() => { handlers.sendMessage({ notifyType: 'notifySpPod', shipment: record }); }}
                />
              </PrivilegeCover>
            );
          }
        } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          // 重新上传
          return (
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <div>
                <Icon type="frown" />
                <RowUpdater label={msg('resubmitPod')} onAnchored={handlers.onResubmit}
                  row={record}
                />
              </div>
            </PrivilegeCover>
          );
        } else if (record.pod_status === SHIPMENT_POD_STATUS.pending) {
          // 审核回单
          return (
            <div>
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <RowUpdater label={msg('auditPod')} onAnchored={handlers.onShowAuditModal}
                  row={record}
                />
              </PrivilegeCover>
            </div>
          );
        } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
          // 我方拒绝
          return (
            <span><Icon type="clock-circle-o" /> {msg('waitingResubmitPOD')}</span>
          );
        } else if (record.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
          if (record.tenant_id === handlers.tenantId) {
            return (
              <span><Icon type="smile" /> {msg('finished')}</span>
            );
          }
          // 提交给上游客户
          return (
            <span><Icon type="clock-circle-o" /> {msg('submitToUpper')}</span>
          );
        }
      },
    });
  } else if (type === 'status') {
    columns.push({
      title: msg('proofOfDelivery'),
      dataIndex: 'pod_type',
      render: (text, record) => {
        if (record.pod_type === 'qrPOD') {
          return (<Tooltip title="扫码签收回单"><Icon type="qrcode" /></Tooltip>);
        } else if (record.pod_type === 'ePOD') {
          return (<Tooltip title="拍摄上传回单"><Icon type="scan" /></Tooltip>);
        } else {
          return (<Tooltip title="无须上传回单"><Icon type="file-excel" /></Tooltip>);
        }
      },
    }, {
      title: msg('shipmtPrevTrack'),
      render: (o, record) => {
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          return `${msg('sendAction')}
            ${moment(record.disp_time).format('MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {
          return `${msg('acceptAction')}
            ${moment(record.acpt_time).format('MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) {
          return `${msg('dispatchAction')}
            ${moment(record.disp_time).format('MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          return `${msg('pickupAction')}
            ${moment(record.pickup_act_date).format('MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
          return `${msg('deliverAction')}
            ${moment(record.deliver_act_date).format('MM.DD HH:mm')}`;
        } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          return `${msg('podUploadAction')}
            ${moment(record.pod_recv_date).format('MM.DD HH:mm')}`;
        }
      },
    }, {
      title: msg('shipmtNextUpdate'),
      width: 160,
      fixed: 'right',
      render: (o, record) => {
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {   // 待接单
          return (
            <div>
              <PrivilegeCover module="transport" feature="tracking" action="create">
                <RowUpdater label={msg('notifyAccept')} row={record}
                  onAnchored={() => { handlers.sendMessage({ notifyType: 'notifyAccept', shipment: record }); }}
                />
              </PrivilegeCover>
            </div>
          );
        } else if (record.status === SHIPMENT_TRACK_STATUS.accepted) {  // 待调度
          if (record.sp_tenant_id === -1) {
              // 线下客户手动更新
            return (
              <div>
                <PrivilegeCover module="transport" feature="tracking" action="edit">
                  <RowUpdater label={msg('updateVehicleDriver')} row={record}
                    onAnchored={handlers.onShowVehicleModal}
                  />
                </PrivilegeCover>
              </div>
            );
          } else {
            return (
              <div>
                <PrivilegeCover module="transport" feature="tracking" action="create">
                  <RowUpdater label={msg('notifyDispatch')} row={record}
                    onAnchored={() => { handlers.sendMessage({ notifyType: 'notifyDispatch', shipment: record }); }}
                  />
                </PrivilegeCover>
              </div>
            );
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.dispatched) { // 待提货
          if (record.sp_tenant_id === -1) {
            return (<div />);
          } else if (record.sp_tenant_id === 0) {
              // 已分配给车队
            if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
                // 线下司机
              return (<div />);
            } else {
              // 催促司机提货
              return (
                <div>
                  <PrivilegeCover module="transport" feature="tracking" action="create">
                    <RowUpdater label={msg('notifyPickup')} row={record}
                      onAnchored={() => { handlers.sendMessage({ notifyType: 'notifyDriverPickup', shipment: record }); }}
                    />
                  </PrivilegeCover>
                </div>
              );
            }
          } else {
            // 催促承运商提货
            return (
              <div>
                <PrivilegeCover module="transport" feature="tracking" action="create">
                  <RowUpdater label={msg('notifyPickup')} row={record}
                    onAnchored={() => { handlers.sendMessage({ notifyType: 'notifySpPickup', shipment: record }); }}
                  />
                </PrivilegeCover>
              </div>
            );
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) { // 运输中
          if (record.sp_tenant_id === -1) {
            return handlers.renderIntransitUpdater(record);
          } else if (record.sp_tenant_id === 0) {
            if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
              return handlers.renderIntransitUpdater(record);
            }
          } else {
            return (<div />);
          }
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {   // 已送货
          if (record.pod_type === 'none' && record.deliver_confirmed === 0 && handlers.tenantId === record.tenant_id) {
            return (
              <PrivilegeCover module="transport" feature="tracking" action="edit">
                <div>
                  <RowUpdater label={msg('deliverConfirm')} row={record}
                    onAnchored={() => { handlers.deliverConfirm(record.shipmt_no, record.disp_id); }}
                  />
                </div>
              </PrivilegeCover>
            );
          }
          return '';
        }
      },
    });
  }
  return columns;
}
