import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Tooltip } from 'antd';
import './style.less';
import toolbar from './toolbar';
import actions from './actions';
import extra from './extra';
import BulkActions from './bulkActions';


export default class DataPane extends React.Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
    scrollOffset: 470,
  }
  static propTypes = {
    baseCls: PropTypes.string,
    children: PropTypes.node,
    header: PropTypes.string,
    fullscreen: PropTypes.bool,
    scrollOffset: PropTypes.number,
    bulkActions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
    selectedRowKeys: PropTypes.arrayOf(PropTypes.string),
    onDeselectRows: PropTypes.func,
    onFilterSelected: PropTypes.func,
  }
  state = { scrollY: 0 }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - this.props.scrollOffset,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fullscreen !== this.props.fullscreen) {
      if (nextProps.fullscreen) {
        this.setState({
          scrollY: window.innerHeight - this.props.scrollOffset,
        });
      } else {
        this.setState({
          scrollY: window.innerHeight - 200,
        });
      }
    }
  }
  render() {
    const {
      baseCls, children, columns, header, pagination,
      selectedRowKeys, onDeselectRows, onFilterSelected, bulkActions,
    } = this.props;
    return (
      <div className={baseCls}>
        {header ? <div className={`${baseCls}-header`}>{header}</div> : null}
        {children}
        <Table
          size="middle"
          {...this.props}
          pagination={pagination || {
            defaultPageSize: 20,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条`,
          }}
          scroll={{
            x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0),
            y: this.state.scrollY,
          }}
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
