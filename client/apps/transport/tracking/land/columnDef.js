import React from 'react';
import moment from 'moment';
import { Icon, Tag } from 'ant-ui';
import RowUpdater from './rowUpdater';
import TrimSpan from 'client/components/trimSpan';
import { renderConsignLoc } from '../../common/consignLocation';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_VEHICLE_CONNECT } from
  'common/constants';

export default function makeColumns(type, handlers, msg) {
  const columns = [{
    title: msg('shipNo'),
    dataIndex: 'shipmt_no',
    fixed: 'left',
    width: 150,
    render: (o, record) => {
      return <RowUpdater label={o} onAnchored={handlers.onShipmtPreview} row={record} />;
    },
  }, {
    title: msg('departurePlace'),
    width: 100,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consigner')} />
  }, {
    title: msg('shipmtEstPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 80,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: msg('shipmtActPickupDate'),
    dataIndex: 'pickup_act_date',
    width: 80,
    render: (o, record) => record.pickup_act_date ?
      (<span className="mdc-text-green">
      {moment(record.pickup_act_date).format('YYYY.MM.DD')}
      </span>
      ) : <span />
  }, {
    title: msg('arrivalPlace'),
    width: 100,
    render: (o, record) => <TrimSpan text={renderConsignLoc(record, 'consignee')} />
  }, {
    title: msg('shipmtEstDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 80,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: msg('shipmtActDeliveryDate'),
    dataIndex: 'deliver_act_date',
    width: 80,
    render: (o, record) => record.deliver_act_date ?
      (<span className="mdc-text-green">
      {moment(record.deliver_act_date).format('YYYY.MM.DD')}
      </span>
      ) : <span />
  }, {
      title: msg('shipmtStatus'),
      dataIndex: 'status',
      width: 100,
      render: (o, record) => {
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          return `1 ${msg('pendingShipmt')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.undispatched) {
          return `2 ${msg('acceptedShipmt')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.undelivered) {
          return `3 ${msg('dispatchedShipmt')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
          return `4 ${msg('intransitShipmt')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
          return `5 ${msg('deliveredShipmt')}`;
        } else if (record.status >= SHIPMENT_TRACK_STATUS.podsubmit) {
          return `6 ${msg('proofOfDelivery')}`;
        } else {
          return <span />;
        }
      }
    }, {
      title: msg('shipmtPrevTrack'),
      width: 140,
      render: (o, record) => {
        if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
          return `${msg('sendAction')}
          ${moment(record.disp_time).format('MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.undispatched) {
          return `${msg('acceptAction')}
          ${moment(record.acpt_time).format('MM.DD HH:mm')}`;
        } else if (record.status === SHIPMENT_TRACK_STATUS.undelivered) {
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
      title: msg('shipmtException'),
      width: 80,
      dataIndex: 'excp_level',
    }];

  columns.push({
    title: msg('shipmtCarrier'),
    dataIndex: 'sp_name',
    width: 200,
    render: (o, record) => {
      if (record.sp_name) {
        const spSpan = <TrimSpan text={record.sp_name} />;
        if (record.sp_tenant_id > 0) {
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
    }
  }, {
    title: msg('shipmtVehicle'),
    dataIndex: 'task_vehicle',
    width: 120
  }, {
    title: msg('packageNum'),
    dataIndex: 'total_count',
    width: 80
  }, {
    title: msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 80
  }, {
    title: msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 80
  }, {
    title: msg('shipmtCustomer'),
    dataIndex: 'customer_name',
    width: 220,
    render: (o) => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: msg('shipmtMode'),
    dataIndex: 'transport_mode',
    width: 80
  }, {
      title: msg('proofOfDelivery'),
      dataIndex: 'pod_type',
      width: 80,
      render: (text, record) => {
        if (record.pod_type === 'none') {
          return <Icon type="tags-o" />;
        } else if (record.pod_type === 'dreceipt') {
          return <Icon type="tags" />;
        } else {
          return <Icon type="qrcode" />;
        }
      }
    });
    
  if (type !== 'pod') {
    if (type === 'status') {
      columns.push({
        title: msg('shipmtNextUpdate'),
        width: 140,
        fixed: 'right',
        render: (o, record) => {
          if (record.status === SHIPMENT_TRACK_STATUS.unaccepted) {
            return msg('carrierUpdate');
          } else if (record.status === SHIPMENT_TRACK_STATUS.undispatched) {
            if (record.sp_tenant_id === -1) {
              // 线下客户手动更新
              return (
                <RowUpdater label={msg('updateVehicleDriver')}
                onAnchored={handlers.onShowVehicleModal} row={record}
                />
              );
            } else {
              return msg('carrierUpdate');
            }
          } else if (record.status === SHIPMENT_TRACK_STATUS.undelivered) {
            if (record.sp_tenant_id === -1) {
              return (
                <RowUpdater label={msg('updatePickup')}
                onAnchored={handlers.onShowPickModal} row={record}
                />
              );
            } else if (record.sp_tenant_id === 0) {
              // 已分配给车队
              if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
                // 线下司机
                return (
                  <RowUpdater label={msg('updatePickup')}
                  onAnchored={handlers.onShowPickModal} row={record}
                  />
                );
              } else {
                return msg('driverUpdate');
              }
            } else {
              return msg('carrierUpdate');
            }
          } else if (record.status === SHIPMENT_TRACK_STATUS.intransit) {
            if (record.sp_tenant_id === -1) {
              return handlers.renderIntransitUpdater(record);
            } else if (record.sp_tenant_id === 0) {
              if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
                return handlers.renderIntransitUpdater(record);
              } else {
                return msg('driverUpdate');
              }
            } else {
              return msg('carrierUpdate');
            }
          } else if (record.status === SHIPMENT_TRACK_STATUS.delivered) {
            if (record.pod_status === SHIPMENT_POD_STATUS.unrequired) {
              return <span />;
            } else if (record.sp_tenant_id === -1) {
              return (
                <RowUpdater label={msg('submitPod')}
                onAnchored={handlers.onShowPodModal} row={record}
                />
              );
            } else if (record.sp_tenant_id === 0) {
              if (record.vehicle_connect_type === SHIPMENT_VEHICLE_CONNECT.disconnected) {
                return (
                  <RowUpdater label={msg('submitPod')}
                  onAnchored={handlers.onShowPodModal} row={record}
                  />
                );
              } else {
                return msg('driverUpdate');
              }
            } else {
              return msg('carrierUpdate');
            }
          } else {
            return msg('carrierUpdate');
          }
        },
      });
    }
  } else {
    columns.push({
      title: msg('shipmtNextUpdate'),
      width: 140,
      fixed: 'right',
      render: (o, record) => {
        if (record.pod_status === SHIPMENT_POD_STATUS.pending) {
          return (
            <div>
            <Icon type="tags" />
            <RowUpdater label={msg('auditPod')}
            onAnchored={handlers.onShowAuditModal} row={record}
            />
            </div>
          );
        } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByUs) {
          return (
            <span>
            <i className="mdc-text-red anticon anticon-tags" />
            {msg('rejectByUs')}
            </span>
          );
        } else if (record.pod_status === SHIPMENT_POD_STATUS.acceptByUs) {
          return (
            <span>
            <Icon type="tags" />
            {msg('submitToUpper')}
            </span>
          );
        } else if (record.pod_status === SHIPMENT_POD_STATUS.rejectByClient) {
          return (
            <div>
            <i className="mdc-text-red anticon anticon-tags" />
            <RowUpdater label={msg('resubmitPod')}
            onAnchored={handlers.onResubmit} row={record}
            />
            </div>
          );
        } else {
          const tagIcon = record.pod_type === 'qrcode' ? <Icon type="qrcode" /> :
            <Icon type="tags" />;
          return (
            <span>
            {tagIcon}
            {msg('acceptByUpper')}
            </span>
          );
        }
      },
    });
  }
  return columns;
}
