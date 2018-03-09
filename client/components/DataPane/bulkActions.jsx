import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';

export default function BulkActions(props) {
  const {
    baseCls = 'welo-data-pane', children, selectedRowKeys, handleDeselectRows,
  } = props;
  return (
    <div className={`${baseCls}-toolbar-row-selection ${selectedRowKeys.length === 0 ? 'hide' : ''}`}>
      <h3>已选中{selectedRowKeys.length}项</h3>
      {children}
      <div className={`${baseCls}-toolbar-right`}>
        <Tooltip title="取消选择" placement="left">
          <Button type="primary" ghost shape="circle" icon="close" onClick={handleDeselectRows} />
        </Tooltip>
      </div>
    </div>
  );
}

BulkActions.props = {
  baseCls: PropTypes.string,
  children: PropTypes.node,
  selectedRowKeys: PropTypes.array,
  handleDeselectRows: PropTypes.func,
};
