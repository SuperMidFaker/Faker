import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Tooltip, Button, Popover } from 'antd';
import update from 'react/lib/update';
import SelectItem from './selectItems';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

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
  propTypes = {
    scrollOffset: PropTypes.number,
    dataSource: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.instanceOf(DataSource),
    ]),
  }

  state = {
    scrollY: null,
    popoverColumns: [],
    tableColumns: [],
    visible: false,
  }
  componentWillMount() {
    const offset = this.props.scrollOffset ? this.props.scrollOffset : 300;
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ scrollY: window.innerHeight - offset });
    }
    const tableColumns = this.props.columns.map((column, index) => ({
      ...column,
      checked: true,
      index,
    }));
    const popoverColumns = this.props.columns.map((column, index) => ({
      ...column,
      checked: true,
      index,
    }));
    this.setState({
      tableColumns,
      popoverColumns,
    });
  }
  isLocalDataSource(dataSource) {
    return Array.isArray(dataSource);
  }
  fetch(params = {}) {
    const { dataSource } = this.props;
    const builtinParams = { ...params, ...dataSource.extraParams };
    return dataSource.fetcher(builtinParams);
  }
  handleTableChange(pagination, filters, sorter) {
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
    changeOne.fixed = false;
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
    const columns = this.state.popoverColumns.filter(column => column.checked);
    const width = columns.reduce((prev, curr) => prev + curr.width ? curr.width : 0, 0);
    let newColumns = [];
    if (width > 1200) {
      newColumns = columns.map(column => ({ ...column }));
    } else {
      newColumns = columns.map(column => ({ ...column, fixed: false }));
    }

    this.setState({
      tableColumns: newColumns,
      visible: false,
    });
  }
  moveSelect = (dragIndex, hoverIndex) => {
    const popoverColumns = [...this.state.popoverColumns];
    const dragSelect = popoverColumns[dragIndex];
    const state = update(this.state, {
      popoverColumns: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragSelect],
        ],
      },
    });
    this.setState({ ...state });
  }
  render() {
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
      scrollProp = this.props.scroll ? { ...this.props.scroll, y: this.state.scrollY } : { y: this.state.scrollY };
    }
    const content = this.state.popoverColumns.map((column, index) => (
      <SelectItem id={index} index={column.index} checked={column.checked} title={column.title} moveSelect={this.moveSelect}
        onChange={this.handleCheckBoxChange}
      />));
    content.push(
      <div style={{ marginTop: 8 }}>
        <Button type="primary" style={{ marginRight: 8 }} onClick={this.handleSave}>Save</Button>
        <Button onClick={this.hidePopover}>cancel</Button>
      </div>
    );
    return (
      <div className="panel-body table-panel table-fixed-layout">
        <Popover placement="right" trigger="click" content={content} visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
          <Tooltip title="显示字段设置">
            <Button size="large" icon="setting" style={{ margin: 8 }} />
          </Tooltip>
        </Popover>
        <Table {...this.props} dataSource={dataSource} pagination={pagination}
          onChange={this.handleTableChange} scroll={scrollProp} columns={this.state.tableColumns}
        />
      </div>
    );
  }
}

DataTable.DataSource = DataSource;
export default DragDropContext(HTML5Backend)(DataTable);
