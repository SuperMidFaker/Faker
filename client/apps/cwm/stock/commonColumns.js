import React from 'react';
import moment from 'moment';
import { Tag } from 'antd';
import { CWM_DAMAGE_LEVEL, CWM_TRANSACTIONS_TYPE } from 'common/constants';
import { formatMsg } from './message.i18n';

exports.commonTraceColumns = (intl) => {
  const msg = formatMsg(intl);
  return [{
    title: msg('traceId'),
    width: 220,
    dataIndex: 'trace_id',
  }, {
    title: msg('SKU'),
    dataIndex: 'product_sku',
    width: 160,
    sorter: true,
  }, {
    title: msg('lotNo'),
    width: 180,
    dataIndex: 'external_lot_no',
  }, {
    title: msg('serialNo'),
    width: 120,
    dataIndex: 'serial_no',
  }, {
    title: msg('virtualWhse'),
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: msg('bonded'),
    width: 120,
    dataIndex: 'bonded',
    render: bonded => bonded ? '是' : '否',
  }, {
    title: msg('portion'),
    width: 120,
    dataIndex: 'portion',
    render: portion => portion ? '是' : '否',
  }, {
    title: msg('damageLevel'),
    width: 120,
    dataIndex: 'damage_level',
    render: dl => (dl || dl === 0) && <Tag color={CWM_DAMAGE_LEVEL[dl].color}>{CWM_DAMAGE_LEVEL[dl].text}</Tag>,
  }, {
    title: msg('expiryDate'),
    width: 120,
    dataIndex: 'expiry_date',
    render: expirydate => expirydate && moment(expirydate).format('YYYY.MM.DD'),
    sorter: true,
  }, {
    title: msg('attrib1'),
    width: 120,
    dataIndex: 'attrib_1_string',
  }, {
    title: msg('attrib2'),
    width: 120,
    dataIndex: 'attrib_2_string',
  }, {
    title: msg('attrib3'),
    width: 120,
    dataIndex: 'attrib_3_string',
  }, {
    title: msg('attrib4'),
    width: 120,
    dataIndex: 'attrib_4_string',
  }, {
    title: msg('attrib5'),
    width: 120,
    dataIndex: 'attrib_5_string',
  }, {
    title: msg('attrib6'),
    width: 120,
    dataIndex: 'attrib_6_string',
  }, {
    title: msg('attrib7'),
    width: 120,
    dataIndex: 'attrib_7_date',
    render: attr7date => attr7date && moment(attr7date).format('YYYY.MM.DD'),
  }, {
    title: msg('attrib8'),
    width: 120,
    dataIndex: 'attrib_8_date',
    render: attr8date => attr8date && moment(attr8date).format('YYYY.MM.DD'),
  }, {
    title: msg('ftzEntryId'),
    width: 120,
    dataIndex: 'ftz_ent_filed_id',
  }, {
    title: msg('grossWeight'),
    dataIndex: 'gross_weight',
    className: 'cell-align-right',
    width: 120,
  }, {
    title: msg('cbm'),
    dataIndex: 'cbm',
    className: 'cell-align-right',
    width: 120,
  }];
};

exports.transactionColumns = (/* intl */) => [{
  title: '操作类型',
  width: 100,
  dataIndex: 'type',
  render: type => <span className="text-success">{CWM_TRANSACTIONS_TYPE[type].text}</span>,
}, {
  title: '操作数量',
  width: 100,
  dataIndex: 'transaction_qty',
  className: 'cell-align-right text-emphasis',
  render: (text) => {
    if (text > 0) {
      return <span className="text-success">+{text}</span>;
    } else {
      return <span className="text-warning">{text}</span>;
    }
  },
}, {
  title: '原因',
  width: 100,
  dataIndex: 'reason',
}, {
  title: '操作人',
  width: 100,
  dataIndex: 'trxn_login_name',
}, {
  title: '事务单号',
  width: 180,
  dataIndex: 'transaction_no',
}, {
  title: '客户单号',
  width: 160,
  dataIndex: 'ref_order_no',
}];
