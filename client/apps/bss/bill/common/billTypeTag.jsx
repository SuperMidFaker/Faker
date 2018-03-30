import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

export default function BillTypeTag(props) {
  const { billType, msg } = props;
  if (billType === 'OFB') {
    return <Tag>{msg('offlineBill')}</Tag>;
  } else if (billType === 'FPB') {
    return <Tag color="blue">{msg('forwardProposedBill')}</Tag>;
  } else if (billType === 'BPB') {
    return <Tag color="orange">{msg('backwardProposedBill')}</Tag>;
  }
  return null;
}
BillTypeTag.propTypes = {
  billType: PropTypes.string,
  msg: PropTypes.func.isRequired,
};
