import React from 'react';
import moment from 'moment';
import TrimSpan from 'client/components/trimSpan';
import NavLink from 'client/components/nav-link';
import RowUpdater from './rowUpater';
export default function makeColumn(type, handlers, msg) {
  const columns = [{
    title: msg('delgNo'),
    dataIndex: 'delg_no',
    width: 150,
    fixed: 'left',
    render: (o, record) => {
      return (
        <RowUpdater onHit={handlers.onPreview} label={o} extra={{
          style: record.status < 0 ? { color : '#999' } : {},
        }}
        />
      );
    }
  }];
  if (type === 'undeclared') {
    columns.push(
  {
    title: this.msg('delgClient'),
    dataIndex: 'sr_name',
    width: 240,
    render: (o) => <TrimSpan text={o} maxLen={14} />,
  }, {
    title: this.msg('shipMode'),
    dataIndex: 'transport_mode',
    width: 80
  }, {
    title: this.msg('shipPickupDate'),
    dataIndex: 'pickup_est_date',
    width: 90,
    render: (o, record) => moment(record.pickup_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipDeliveryDate'),
    dataIndex: 'deliver_est_date',
    width: 90,
    render: (o, record) => moment(record.deliver_est_date).format('YYYY.MM.DD')
  }, {
    title: this.msg('shipConsignor'),
    dataIndex: 'consigner_name',
    width: 200,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('consignorPlace'),
    width: 200,
  }, {
    title: this.msg('consignorAddr'),
    dataIndex: 'consigner_addr',
    width: 220,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('shipConsignee'),
    dataIndex: 'consignee_name',
    width: 200,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('consigneePlace'),
    width: 200,
  }, {
    title: this.msg('consigneeAddr'),
    dataIndex: 'consignee_addr',
    width: 220,
    render: (o) => <TrimSpan text={o} />,
  }, {
    title: this.msg('packageNum'),
    dataIndex: 'total_count',
    width: 80
  }, {
    title: this.msg('shipWeight'),
    dataIndex: 'total_weight',
    width: 80
  }, {
    title: this.msg('shipVolume'),
    dataIndex: 'total_volume',
    width: 80
  }, {
    title: this.msg('shipSource'),
    dataIndex: 'source',
    width: 50,
    render: (o, record) => {
        return <span>{record.source}</span>;
    }
  }, {
    title: this.msg('shipCreateDate'),
    dataIndex: 'created_date',
    width: 100,
    sorter: true,
    render: (text, record) => moment(record.created_date).format('MM-DD HH:mm')
  }, {
    title: this.msg('shipAcceptTime'),
    dataIndex: 'acpt_time',
    width: 100,
    sorter: true,
    render: (text, record) => record.acpt_time ?
     moment(record.acpt_time).format('MM-DD HH:mm') : ' '
  },
       {
        title: msg('opColumn'),
        width: 110,
        fixed: 'right',
        render: (o, record) => {
          return (
            <span>
              <NavLink to={`/transport/acceptance/shipment/draft/${record.shipmt_no}`}>
                制单单
              </NavLink>
            </span>
          );
        }
      }
    );
  }
}
