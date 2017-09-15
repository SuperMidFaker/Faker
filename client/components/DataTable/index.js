import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Tooltip, Button, Popover, message } from 'antd';
import classNames from 'classnames';
import update from 'react/lib/update';
import SelectItem from './selectItem';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import './index.less';

function noop() {
}

class DataSource {
  init(config) {
    this.fetcher = config.fetcher || noop;
    this.resolve = config.resolve || noop;
    this.getParams = config.getParams || noop;
    this.getPagination = config.getPagination || noop;
    this.extraParams = config.extraParams || {};
    this.needUpdate = config.needUpdate || false;
    this.remotes = config.remotes || {}; // 远程返回数据
  }

  constructor(config) {
    if (config) {
      this.init(config);
    }
  }
}

/* eslint react/prefer-es6-class: 0 */
class DataTable extends Component {
  static defaultProps = {
    baseCls: 'welo-data-table',
  }
  static propTypes = {
    scrollOffset: PropTypes.number,
    dataSource: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.instanceOf(DataSource),
    ]),
    node: PropTypes.node,
    toolbarActions: PropTypes.node,
    bulkActions: PropTypes.node,
    selectedRowKeys: PropTypes.array,
    handleDeselectRows: PropTypes.func,
    noBorder: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    scrollY: null,
    popoverColumns: [],
    tableColumns: [],
    visible: false,
    pathname: '',
  }
  componentWillMount() {
    const offset = this.props.scrollOffset ? this.props.scrollOffset : 300;
    const location = this.context.router.location;
    let columnRule;
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ scrollY: window.innerHeight - offset });
      if (window.localStorage) {
        columnRule = JSON.parse(window.localStorage.getItem(location.pathname));
      }
    }
    if (columnRule) {
      const tableColumns = this.props.columns;
      const newTableColumns = [];
      const newPopoverColumns = [];
      for (let i = 0; i < columnRule.tableStorage.length; i++) {
        const item = columnRule.tableStorage[i];
        let currentOne = null;
        if (item.dataIndex) {
          currentOne = tableColumns.find(column => column.dataIndex === item.dataIndex);
        } else {
          currentOne = tableColumns.find(column => !column.dataIndex);
        }
        newTableColumns.push({ ...currentOne, ...item, index: i });
      }
      const popoverColumns = this.props.columns.filter(column => column.dataIndex !== 'OPS_COL');
      for (let i = 0; i < columnRule.popoverStorage.length; i++) {
        const item = columnRule.popoverStorage[i];
        let currentOne = null;
        if (item.dataIndex) {
          currentOne = popoverColumns.find(column => column.dataIndex === item.dataIndex);
        } else {
          currentOne = popoverColumns.find(column => !column.dataIndex);
        }
        newPopoverColumns.push({ ...currentOne, ...item, index: i });
      }
      this.setState({
        tableColumns: newTableColumns,
        popoverColumns: newPopoverColumns,
        pathname: location.pathname,
      });
    } else {
      const tableColumns = this.props.columns.map((column, index) => ({
        ...column,
        checked: true,
        index,
      }));
      let popoverColumns = this.props.columns.filter(column => column.dataIndex !== 'OPS_COL');
      popoverColumns = popoverColumns.map((column, index) => ({
        ...column,
        checked: true,
        index }));
      this.setState({
        tableColumns,
        popoverColumns,
        pathname: location.pathname,
      });
    }
  }
  isLocalDataSource(dataSource) {
    return Array.isArray(dataSource);
  }
  fetch = (params = {}) => {
    const { dataSource } = this.props;
    const builtinParams = { ...params, ...dataSource.extraParams };
    return dataSource.fetcher(builtinParams);
  }
  handleTableChange = (pagination, filters, sorter) => {
    const { dataSource } = this.props;
    const builtinParams = dataSource.getParams.call(this, pagination, filters, sorter);
    this.fetch(builtinParams);
  }
  resolveCurrent(total, current, pageSize) {
    // 删除完一页时返回上一页
    return total > 0 && (current - 1) * pageSize === total ? current - 1 : current;
  }
  handleCheckBoxChange = (index) => {
    const columns = [...this.state.popoverColumns];
    const changeOne = columns.find(column => column.index === index);
    changeOne.checked = !changeOne.checked;
    delete changeOne.fixed;
    let newColumns = [];
    if (!changeOne.checked) {
      newColumns = columns.filter(column => column.index !== index).concat(changeOne);
    } else {
      newColumns = columns.filter(column => column.index !== index);
      const checkedColumns = newColumns.filter(column => column.checked);
      const uncheckedColumns = newColumns.filter(column => !column.checked);
      checkedColumns.push(changeOne);
      newColumns = checkedColumns.concat(uncheckedColumns);
    }
    this.setState({
      popoverColumns: newColumns,
    });
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  hidePopover = () => {
    this.setState({
      visible: false,
    });
  }
  handleSave = () => {
    const tableColumns = [...this.state.tableColumns];
    const popoverColumns = [...this.state.popoverColumns];
    const { pathname } = this.state;
    let columns = popoverColumns.filter(column => column.checked);
    const operation = tableColumns.find(column => column.dataIndex === 'OPS_COL');
    if (operation) { columns = columns.concat(operation); }
    const newColumns = columns.map(column => ({ ...column }));
    this.setState({
      tableColumns: newColumns,
      visible: false,
    });
    if (window.localStorage) {
      const popoverStorage = popoverColumns.map(column => ({ dataIndex: column.dataIndex, fixed: column.fixed, checked: column.checked }));
      const tableStorage = newColumns.map(column => ({ dataIndex: column.dataIndex, fixed: column.fixed, checked: column.checked }));
      const obj = { popoverStorage, tableStorage };
      const storage = window.localStorage;
      storage.setItem(pathname, JSON.stringify(obj));
    }
    message.info('列表视图已更新');
  }
  moveSelect = (dragIndex, hoverIndex) => {
    let popoverColumns = [...this.state.popoverColumns];
    const dragSelect = popoverColumns[dragIndex];
    const state = update(this.state, {
      popoverColumns: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragSelect],
        ],
      },
    });
    popoverColumns = state.popoverColumns.map((column) => {
      const newColumn = column;
      delete newColumn.fixed;
      return newColumn;
    });
    this.setState({ popoverColumns });
  }
  fixedColumns = (index) => {
    const popoverColumns = [...this.state.popoverColumns];
    const position = popoverColumns.findIndex(column => column.index === index);
    for (let i = 0; i < popoverColumns.length; i++) {
      const column = popoverColumns[i];
      if (i <= position) {
        column.fixed = 'left';
      } else {
        delete column.fixed;
      }
    }
    this.setState({ popoverColumns });
  }
  render() {
    const { baseCls, noBorder } = this.props;
    let dataSource = this.props.dataSource;
    let pagination = this.props.pagination;
    if (dataSource && !this.isLocalDataSource(dataSource)) {
      const data = dataSource.resolve(dataSource.remotes);
      pagination = pagination !== false ? {
        ...pagination,
        ...dataSource.getPagination(dataSource.remotes, this.resolveCurrent),
      } : pagination;
      dataSource = data;
    }
    let scrollProp;
    if (this.state.scrollY) {
      scrollProp = this.props.scroll ? { ...this.props.scroll, y: this.state.scrollY } :
        { x: this.state.tableColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0), y: this.state.scrollY };
    }
    const content = this.state.popoverColumns.map((column, index) => (
      <SelectItem id={index} key={column.index} index={column.index} checked={column.checked} title={column.title} moveSelect={this.moveSelect}
        onChange={this.handleCheckBoxChange} onFixed={this.fixedColumns} fixed={column.fixed}
      />));
    content.push(
      <div className="col-selection-actions" key="col-sel-buttons">
        <Button type="primary" style={{ marginRight: 8 }} onClick={this.handleSave}>确定</Button>
        <Button onClick={this.hidePopover}>取消</Button>
      </div>
    );
    const classes = classNames(baseCls, {
      [`${baseCls}-no-border`]: noBorder,
    });
    return (
      <div className={classes}>
        <div className={`${baseCls}-toolbar`}>
          {this.props.toolbarActions}
          <div className={`${baseCls}-toolbar-right`}>
            <Popover placement="leftTop" trigger="click" title="选择、排序显示字段" content={<div className="col-selection">{content}</div>}
              visible={this.state.visible} onVisibleChange={this.handleVisibleChange}
            >
              <Tooltip title="显示字段设置">
                <Button shape="circle" icon="layout" />
              </Tooltip>
            </Popover>
          </div>
          {this.props.selectedRowKeys &&
          <div className={`${baseCls}-toolbar-row-selection ${this.props.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.props.selectedRowKeys.length}项</h3>
            {this.props.bulkActions}
            <div className={`${baseCls}-toolbar-right`}>
              <Tooltip title="取消选择" placement="left">
                <Button type="primary" ghost shape="circle" icon="close" onClick={this.props.handleDeselectRows} />
              </Tooltip>
            </div>
          </div>}
        </div>
        <div className={`${baseCls}-body ${baseCls}-body-fixed`}>
          <Table {...this.props} dataSource={dataSource} pagination={pagination}
            onChange={this.handleTableChange} scroll={scrollProp} columns={this.state.tableColumns}
          />
        </div>
      </div>
    );
  }
}

DataTable.DataSource = DataSource;
export default DragDropContext(HTML5Backend)(DataTable);
