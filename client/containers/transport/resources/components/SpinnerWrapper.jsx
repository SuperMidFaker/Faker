/**
 * This conponent is just to wrapper `ant-ui Spin Component`,
 * in the latest antd version, we will no longer will this.
 */
import React, { PropTypes } from 'react';
import { Spin } from 'ant-ui';

export default function SpinWrapper(props) {
  if (props.spinning) {
    return (
      <Spin>{props.children}</Spin>
    );
  } else {
    return (
      <div>{props.children}</div>
    );
  }
}

SpinWrapper.propTypes = {
  spinning: PropTypes.bool.isRequired, // 是否显示加载状态
};
