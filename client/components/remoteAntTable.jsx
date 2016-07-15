import React from 'react';
import { Table } from 'antd';

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
const RemoteAntTable = React.createClass({
  propTypes: {
    dataSource: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.instanceOf(DataSource),
    ]),
  },
  isLocalDataSource(dataSource) {
    return Array.isArray(dataSource);
  },
  fetch(params = {}) {
    const { dataSource } = this.props;
    const builtinParams = { ...params, ...dataSource.extraParams };
    return dataSource.fetcher(builtinParams);
  },
  handleTableChange(pagination, filters, sorter) {
    const { dataSource } = this.props;
    const builtinParams = dataSource.getParams.call(this, pagination, filters, sorter);
    this.fetch(builtinParams);
  },
  resolveCurrent(total, current, pageSize) {
    // 删除完一页时返回上一页
    return total > 0 && (current - 1) * pageSize === total ? current - 1 : current;
  },
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
    return (
      <Table {...this.props} dataSource={dataSource} pagination={pagination}
        onChange={this.handleTableChange}
      />
    );
  },
});

RemoteAntTable.DataSource = DataSource;
export default RemoteAntTable;
