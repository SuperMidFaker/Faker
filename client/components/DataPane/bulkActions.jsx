import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';

export default class BulkActions extends Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
  }
  static propTypes = {
    selectedRowKeys: PropTypes.array,
    handleDeselectRows: PropTypes.func,
  }
  render() {
    const {
      baseCls, children, selectedRowKeys, handleDeselectRows,
    } = this.props;
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
}
