import React from 'react';
import moment from 'moment';
import { Tag } from 'antd';
import { CWM_DAMAGE_LEVEL, CWM_TRANSACTIONS_TYPE } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';
import { formatMsg } from './message.i18n';

exports.commonTraceColumns = (intl) => {
  const msg = formatMsg(intl);
  return [{
    title: msg('bonded'),
    width: 80,
    dataIndex: 'bonded',
    align: 'center',
    render: bonded => (bonded ? <Tag color="blue">保税</Tag> : <Tag>非保税</Tag>),
    filters: [{ text: '保税', value: 1 }, { text: '非保', value: 0 }], // todo true "true"
    filterMultiple: false,
  }, {
    title: msg('portion'),
    width: 80,
    dataIndex: 'portion',
    align: 'center',
    render: portion => (portion ? <Tag color="green">可分拨</Tag> : '/'),
    filters: [{ text: '可分拨', value: 1 }, { text: '非分拨', value: 0 }],
    filterMultiple: false,
  }, {
    title: msg('SKU'),
    dataIndex: 'product_sku',
    width: 160,
    sorter: true,
  }, {
    title: msg('inCustOrderNo'),
    width: 150,
    dataIndex: 'cust_order_no',
  }, {
    title: msg('poNo'),
    width: 150,
    dataIndex: 'po_no',
  }, {
    title: msg('invoiceNo'),
    width: 150,
    dataIndex: 'invoice_no',
  }, {
    title: msg('asnNo'),
    width: 150,
    dataIndex: 'asn_no',
  }, {
    title: msg('lotNo'),
    width: 120,
    dataIndex: 'external_lot_no',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('serialNo'),
    width: 120,
    dataIndex: 'serial_no',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('virtualWhse'),
    width: 120,
    dataIndex: 'virtual_whse',
  }, {
    title: msg('damageLevel'),
    width: 120,
    dataIndex: 'damage_level',
    render: dl => (dl || dl === 0) &&
    <Tag color={CWM_DAMAGE_LEVEL[dl].color}>{CWM_DAMAGE_LEVEL[dl].text}</Tag>,
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
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('attrib2'),
    width: 120,
    dataIndex: 'attrib_2_string',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('attrib3'),
    width: 120,
    dataIndex: 'attrib_3_string',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('attrib4'),
    width: 120,
    dataIndex: 'attrib_4_string',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('attrib5'),
    width: 120,
    dataIndex: 'attrib_5_string',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
  }, {
    title: msg('attrib6'),
    width: 120,
    dataIndex: 'attrib_6_string',
    render: o => <TrimSpan text={o} maxLen={10} tailer={3} />,
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
    align: 'right',
    width: 120,
  }, {
    title: msg('cbm'),
    dataIndex: 'cbm',
    align: 'right',
    width: 120,
  }];
};

exports.transactionColumns = (/* intl */) => [{
  title: '事务类型',
  width: 80,
  dataIndex: 'type',
  align: 'center',
  render: type => type && <span className="text-emphasis">{CWM_TRANSACTIONS_TYPE[type].text}</span>,
}, {
  title: '变动数量',
  width: 100,
  dataIndex: 'transaction_qty',
  align: 'right',
  render: (text) => {
    if (text > 0) {
      return <span className="text-success">+{text}</span>;
    }
    return <span className="text-warning">{text}</span>;
  },
}, {
  title: '原因',
  width: 100,
  dataIndex: 'reason',
  className: 'text-normal',
}, {
  title: '事务时间',
  width: 150,
  dataIndex: 'transaction_timestamp',
  render: traxTime => traxTime && moment(traxTime).format('YYYY.MM.DD HH:mm'),
}, {
  title: '操作人',
  width: 100,
  dataIndex: 'trxn_login_name',
}, {
  title: '关联单号',
  width: 180,
  dataIndex: 'transaction_no',
}, {
  title: '客户单号',
  width: 160,
  dataIndex: 'ref_order_no',
}];
