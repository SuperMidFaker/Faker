import React from 'react';
import ShipmtnoColumn from '../../../common/shipmtnoColumn';
import AddressColumn from '../../../common/addressColumn';
import ActDate from '../../../common/actDate';
import TrimSpan from 'client/components/trimSpan';
import moment from 'moment';
export const columnDef = handle => [{
  dataIndex: 'shipment',
  width: 200,
  className: 'table-cell-vertical-align-top',
  render: (o, record) => (
    <div>
      <ShipmtnoColumn shipmtNo={record.shipmt_no} publicKey={record.public_key}
        shipment={record} onClick={() => handle.handleLoadShipmtDetail(record.shipmt_no)}
      />
      <div className="mdc-text-grey dashboard-table-font-small">{record.ref_external_no}</div>
      <div className="mdc-text-grey dashboard-table-font-small"><TrimSpan text={record.customer_name} maxLen={14} /></div>
    </div>
    ),
}, {
  dataIndex: 'departurePlace',
  width: 150,
  className: 'table-cell-vertical-align-top',
  render: (o, record) => (
    <div>
      <strong><AddressColumn shipment={record} consignType="consigner" /></strong>
      <div className="mdc-text-grey dashboard-table-font-small">{handle.msg('shipmtEstPickupDate')}: {moment(record.pickup_est_date).format('YYYY.MM.DD')}</div>
      <div className="dashboard-table-font-small">{record.pickup_act_date ? (<ActDate actDate={record.pickup_act_date} estDate={record.pickup_est_date} textBefore={`${handle.msg('shipmtActPickupDate')}:`} />) : ''}</div>
    </div>
  ),
}, {
  dataIndex: 'arrivalPlace',
  width: 150,
  className: 'table-cell-vertical-align-top',
  render: (o, record) => {
    let deliverActDate = null;
    if (record.deliver_act_date) {
      const deliverPrmDate = new Date(record.pickup_act_date);
      deliverPrmDate.setDate(deliverPrmDate.getDate() + record.transit_time);
      deliverActDate = (<ActDate actDate={record.deliver_act_date} estDate={deliverPrmDate} textBefore={`${handle.msg('shipmtActDeliveryDate')}:`} />);
    }
    return (
      <div>
        <strong><AddressColumn shipment={record} consignType="consignee" /></strong>
        <div className="mdc-text-grey dashboard-table-font-small">{handle.msg('shipmtEstDeliveryDate')}: {moment(record.deliver_est_date).format('YYYY.MM.DD')}</div>
        <div className="dashboard-table-font-small">{deliverActDate}</div>
      </div>
    );
  },
}];
