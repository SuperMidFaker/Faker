import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import DataTable from '../DataTable';
import toolbar from './toolbar';
import actions from './actions';
import extra from './extra';
import BulkActions from './bulkActions';
import './style.less';

export default class DataPane extends React.Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
    scrollOffset: 356,
  }
  static propTypes = {
    baseCls: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.string,
    // fullscreen: PropTypes.bool,
    scrollOffset: PropTypes.number,
    bulkActions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
    selectedRowKeys: PropTypes.arrayOf(PropTypes.string),
    onDeselectRows: PropTypes.func,
    onFilterSelected: PropTypes.func,
  }
  static contextTypes = {
    fullscreen: PropTypes.bool,
  }
  componentWillReceiveProps(nextProps, nextContext) {
    if (nextContext.fullscreen !== this.context.fullscreen) {
      if (nextContext.fullscreen) {
        //
      } else {
        //
      }
    }
  }
  render() {
    const {
      baseCls, children, header, pagination,
      selectedRowKeys, onDeselectRows, onFilterSelected, bulkActions,
    } = this.props;
    return (
      <div className={baseCls}>
        {header ? <div className={`${baseCls}-header`}>{header}</div> : null}
        {children}
        <DataTable
          size="middle"
          {...this.props}
          pagination={pagination || {
            defaultPageSize: 20,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
          showToolbar={false}
        />
        {selectedRowKeys &&
          <div className={`${baseCls}-toolbar-row-selection ${selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Tooltip title="取消选择" placement="top">
              <Button type="primary" ghost size="small" shape="circle" icon="close" onClick={onDeselectRows} />
            </Tooltip>
            <span className={`${baseCls}-toolbar-row-selection-text`}>
              已选中<a onClick={onFilterSelected}>{selectedRowKeys.length}</a>项
            </span>
            {bulkActions}
          </div>}
      </div>
    );
  }
}

DataPane.Toolbar = toolbar;
DataPane.Actions = actions;
DataPane.Extra = extra;
DataPane.BulkActions = BulkActions;
