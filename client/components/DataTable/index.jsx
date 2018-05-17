import React from 'react';
import PropTypes from 'prop-types';
import { Table, Tooltip, Button, Popover, message } from 'antd';
import classNames from 'classnames';
import update from 'immutability-helper';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import SearchBox from 'client/components/SearchBox';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import SelectItem from './selectItem';
// import AnimTableBody from './animTableBody';
import './style.less';

function noop() {
}
function isLocalDataSource(dataSource) {
  return Array.isArray(dataSource);
}
function resolveCurrent(total, current, pageSize) {
  // 删除完一页时返回上一页
  return total > 0 && (current - 1) * pageSize === total ? current - 1 : current;
}
export function ResizeableTitle(props) {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      axis="x"
      onResize={onResize}
      minConstraints={[60, 0]}
      maxConstraints={[500, 0]}
    >
      <th {...restProps} />
    </Resizable>
  );
}

ResizeableTitle.propTypes = {
  onResize: PropTypes.func,
  width: PropTypes.number,
};

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

class DataTable extends React.Component {
  static defaultProps = {
    baseCls: 'welo-data-table',
    fixedBody: true,
    showToolbar: true,
    withBorder: true,
    scrollOffset: 280,
    paginationSize: 'small',
  }
  static propTypes = {
    baseCls: PropTypes.string,
    scrollOffset: PropTypes.number,
    dataSource: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.instanceOf(DataSource),
    ]),
    node: PropTypes.node,
    toolbarActions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
    bulkActions: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
    selectedRowKeys: PropTypes.arrayOf(PropTypes.string),
    onDeselectRows: PropTypes.func,
    onFilterSelected: PropTypes.func,
    onSearch: PropTypes.func,
    searchTips: PropTypes.string,
    withBorder: PropTypes.bool,
    fixedBody: PropTypes.bool,
    noSetting: PropTypes.bool,
    total: PropTypes.node,
    paginationSize: PropTypes.string,
    showToolbar: PropTypes.bool,
    minWidth: PropTypes.number,
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
    const { location } = this.context.router;
    let columnRule;
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ scrollY: window.innerHeight - this.props.scrollOffset });
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
      const popoverColumns = this.props.columns.filter(column =>
        (column.dataIndex !== 'OPS_COL' && column.dataIndex !== 'SPACER_COL'));
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
      let popoverColumns = this.props.columns.filter(column =>
        (column.dataIndex !== 'OPS_COL' && column.dataIndex !== 'SPACER_COL'));
      popoverColumns = popoverColumns.map((column, index) => ({
        ...column,
        checked: true,
        index,
      }));
      this.setState({
        tableColumns,
        popoverColumns,
        pathname: location.pathname,
      });
    }
  }
  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize, false);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!this.isSameColumns(nextProps.columns, this.props.columns)) {
      const tableColumns = nextProps.columns.map((column, index) => ({
        ...column,
        checked: true,
        index,
      }));
      let popoverColumns = nextProps.columns.filter(column =>
        (column.dataIndex !== 'OPS_COL' && column.dataIndex !== 'SPACER_COL'));
      popoverColumns = popoverColumns.map((column, index) => ({
        ...column,
        checked: true,
        index,
      }));
      this.setState({
        popoverColumns,
        tableColumns,
      });
    }
    if (nextProps.scrollOffset !== this.props.scrollOffset) {
      this.setState({ scrollY: window.innerHeight - nextProps.scrollOffset });
    }
  }
  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
  }
  onResize = () => {
    if (typeof window !== 'undefined') {
      this.setState({ scrollY: window.innerHeight - this.props.scrollOffset });
    }
  }
  isSameColumns = (nextColumns, currColumns) => {
    if (nextColumns === currColumns) {
      return true;
    } if (nextColumns.length === currColumns.length) {
      for (let i = 0; i < nextColumns.length; i++) {
        if (nextColumns[i] !== currColumns[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  fetch = (params = {}) => {
    const { dataSource } = this.props;
    const builtinParams = { ...params, ...dataSource.extraParams };
    return dataSource.fetcher(builtinParams);
  }
  handleColumnResize = index => (e, { size }) => {
    this.setState(({ tableColumns }) => {
      const nextColumns = [...tableColumns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { tableColumns: nextColumns };
    });
  };
  handleTableChange = (pagination, filters, sorter) => {
    const { dataSource } = this.props;
    if (!isLocalDataSource(dataSource)) {
      const builtinParams = dataSource.getParams.call(this, pagination, filters, sorter);
      this.fetch(builtinParams);
    }
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
  handleReset = () => {
    const { pathname } = this.state;
    if (window.localStorage) {
      window.localStorage.removeItem(pathname);
    }
    let popoverColumns = this.props.columns.filter(column =>
      (column.dataIndex !== 'OPS_COL' && column.dataIndex !== 'SPACER_COL'));
    popoverColumns = popoverColumns.map((column, index) => ({
      ...column,
      checked: true,
      index,
    }));
    this.setState({
      tableColumns: this.props.columns,
      popoverColumns,
      visible: false,
    });
    message.info('列表视图已重置');
  }
  handleSave = () => {
    const tableColumns = [...this.state.tableColumns];
    const popoverColumns = [...this.state.popoverColumns];
    const { pathname } = this.state;
    let columns = popoverColumns.filter(column => column.checked);
    const operation = tableColumns.find(column =>
      (column.dataIndex !== 'OPS_COL' && column.dataIndex !== 'SPACER_COL'));
    if (operation) { columns = columns.concat(operation); }
    const newColumns = columns.map(column => ({ ...column }));
    this.setState({
      tableColumns: newColumns,
      visible: false,
    });
    if (window.localStorage) {
      const popoverStorage = popoverColumns.map(column =>
        ({ dataIndex: column.dataIndex, fixed: column.fixed, checked: column.checked }));
      const tableStorage = newColumns.map(column =>
        ({ dataIndex: column.dataIndex, fixed: column.fixed, checked: column.checked }));
      const obj = { popoverStorage, tableStorage };
      window.localStorage.setItem(pathname, JSON.stringify(obj));
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
    const {
      baseCls, withBorder, fixedBody, noSetting, paginationSize, minWidth,
      selectedRowKeys, onDeselectRows, onFilterSelected, bulkActions,
      showToolbar, toolbarActions, onSearch, searchTips,
    } = this.props;
    let { dataSource } = this.props;
    let { pagination } = this.props;
    if (dataSource && !isLocalDataSource(dataSource)) {
      const data = dataSource.resolve(dataSource.remotes);
      pagination = pagination !== false ? {
        ...pagination,
        ...dataSource.getPagination(dataSource.remotes, resolveCurrent),
      } : pagination;
      dataSource = data;
    }
    if (pagination) {
      pagination.size = paginationSize;
    }
    let scrollProp;
    if (this.state.scrollY) {
      scrollProp = this.props.scroll ? { ...this.props.scroll, y: this.state.scrollY } :
        {
          x: minWidth || this.state.tableColumns.reduce((acc, cur) =>
            acc + (cur.width ? cur.width : 100), 0),
          y: this.state.scrollY,
        };
    }
    const content = this.state.popoverColumns.map((column, index) => (
      <SelectItem
        id={index}
        key={column.index}
        index={column.index}
        checked={column.checked}
        title={column.title}
        moveSelect={this.moveSelect}
        onChange={this.handleCheckBoxChange}
        onFixed={this.fixedColumns}
        fixed={column.fixed}
      />));
    content.push(<div className="col-selection-actions" key="col-sel-buttons">
      <Button type="primary" style={{ marginRight: 8 }} onClick={this.handleSave}>确定</Button>
      <Button onClick={this.handleReset}>重置</Button>
    </div>);
    const classes = classNames(baseCls, {
      [`${baseCls}-no-border`]: !withBorder,
    });
    const bodyClasses = classNames(`${baseCls}-body`, {
      [`${baseCls}-body-fixed`]: fixedBody,
    });
    // const animateBody = props => <AnimTableBody {...props} />;
    const columns = this.state.tableColumns.map((col, index) => ({
      ...col,
      onHeaderCell: (column) => {
        if (!column.fixed || column.fixed === 'left') {
          return ({
            width: column.width,
            onResize: this.handleColumnResize(index),
          });
        }
        return null;
      },
    }));
    return (
      <div className={classes}>
        {showToolbar &&
        <div className={`${baseCls}-toolbar`}>
          {onSearch && <SearchBox placeholder={searchTips} onSearch={onSearch} />}
          {toolbarActions}
          <div className={`${baseCls}-toolbar-right`}>
            {this.props.total}
            {!noSetting && <Popover
              placement="leftTop"
              trigger="click"
              title="选择、排序显示字段"
              content={<div className="col-selection">{content}</div>}
              visible={this.state.visible}
              onVisibleChange={this.handleVisibleChange}
            >
              <Tooltip title="表头设置">
                <Button shape="circle" icon="setting" />
              </Tooltip>
            </Popover>}
          </div>
        </div>}
        <div className={bodyClasses}>
          <Table
            {...this.props}
            dataSource={dataSource}
            pagination={pagination}
            onChange={this.handleTableChange}
            scroll={scrollProp}
            columns={columns}
            components={{
              header: {
                cell: ResizeableTitle,
              },
              //  body: { wrapper: animateBody },
            }}
          />
          {selectedRowKeys &&
            <div className={`${baseCls}-body-row-selection ${selectedRowKeys.length === 0 ? 'hide' : ''}`}>
              <Tooltip title="取消选择" placement="top">
                <Button type="primary" ghost size="small" shape="circle" icon="close" onClick={onDeselectRows} />
              </Tooltip>
              <h4 className={`${baseCls}-body-row-selection-text`}>
                已选中<Button type="dashed" size="small" onClick={onFilterSelected}>{selectedRowKeys.length}</Button> 项
              </h4>
              {bulkActions}
            </div>}
        </div>
      </div>
    );
  }
}

DataTable.DataSource = DataSource;
export default DragDropContext(HTML5Backend)(DataTable);
