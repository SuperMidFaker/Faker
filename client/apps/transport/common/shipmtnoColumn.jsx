import React, { PropTypes } from 'react';

function makeShipmtPublicUrl(shipmtNo, publicKey) {
  return `/pub/tms/tracking/detail/${shipmtNo}/${publicKey}`;
}

export default function ShipmtNoColumnRender(props) {
  const { publicKey, shipmtNo, ...extra } = props;
  return (
    <a {...extra} href={makeShipmtPublicUrl(shipmtNo, publicKey)} target="_blank">
    {shipmtNo}
    </a>
  );
}

ShipmtNoColumnRender.propTypes = {
  publicKey: PropTypes.string.isRequired,
  shipmtNo: PropTypes.string.isRequired,
};
