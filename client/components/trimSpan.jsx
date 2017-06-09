import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

export default function TrimSpan(props) {
  const { maxLen = 13, text } = props;
  if (text && text.length > maxLen) {
    const spanText = `${text.substring(0, maxLen)}...`;
    return (
      <Tooltip title={text}>
        <span>{spanText}</span>
      </Tooltip>
    );
  } else {
    return <span>{text || ''}</span>;
  }
}

TrimSpan.propTypes = {
  maxLen: PropTypes.number,
  text: PropTypes.string,
};
