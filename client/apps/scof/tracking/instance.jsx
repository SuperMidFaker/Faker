import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Button, Input } from 'antd';
import EditableCell from 'client/components/EditableCell';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import RangePickerPopover from './modals/rangePickerPopover';
import { loadTrackingItems, loadTrackingOrders, upsertTrackingOrderCustom } from 'common/reducers/scvTracking';
import { makeExcel } from 'common/reducers/common';
import { createFilename } from 'client/util/dataTransform';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;
const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackings: state.scvTracking.trackings,
    trackingItems: state.scvTracking.trackingItems,
    orders: state.scvTracking.orderList,
  }),
  {
    loadTrackingItems, loadTrackingOrders, upsertTrackingOrderCustom, makeExcel,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
export default class Instance extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    trackings: PropTypes.array.isRequired,
    trackingItems: PropTypes.array.isRequired,
    loadTrackingItems: PropTypes.func.isRequired,
    loadTrackingOrders: PropTypes.func.isRequired,
    upsertTrackingOrderCustom: PropTypes.func.isRequired,
    makeExcel: PropTypes.func.isRequired,
  }
  state = {
    tracking: {},
    sorter: { field: '', order: 'descend' },
    filters: {},
    exportLoading: false,
  }
  componentWillMount() {
    this.props.loadTrackingItems(Number(this.props.params.trackingId));
    this.handleTableload(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.trackingId !== this.props.params.trackingId) {
      nextProps.loadTrackingItems(Number(nextProps.params.trackingId));
      this.handleTableload(nextProps);
    }
    this.setState({ tracking: nextProps.trackings.find(item => item.id === Number(nextProps.params.trackingId)) });
  }
  handleTableload = (props) => {
    props.loadTrackingOrders({
      searchValue: props.orders.searchValue,
      tracking_id: props.params.trackingId,
      pageSize: props.orders.pageSize,
      current: 1,
      sorter: JSON.stringify({
        field: this.state.sorter.field,
        order: this.state.sorter.order === 'ascend' ? 'ASC' : 'DESC',
      }),
      filters: JSON.stringify(this.state.filters),
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = (id, field, value, source) => {
    this.props.upsertTrackingOrderCustom(id, field, value, source);
  }
  handleDateFilter = (field, values) => {
    if (values.length > 0) {
      this.setState({ filters: { ...this.state.filters, [field]: [values[0].toString(), values[1].toString()] } }, () => {
        this.handleTableload(this.props);
      });
    } else {
      const filters = { ...this.state.filters };
      delete filters[field];
      this.setState({ filters }, () => {
        this.handleTableload(this.props);
      });
    }
  }
  makeColumns = () => this.props.trackingItems.map((item) => {
    let title = item.custom_title;
    if (item.source !== 3 && item.datatype === 'DATE') {
      title = (
        <span>
          {item.custom_title}
          <RangePickerPopover onChange={value => this.handleDateFilter(item.field, value)} />
        </span>);
    }
    return {
      key: item.field,
      dataIndex: item.field,
      title,
      custom_title: item.custom_title,
      width: item.width,
      sorter: item.source !== 3,
      sortOrder: this.state.sorter.columnKey === item.field && this.state.sorter.order,
      render: (fld, row) => {
        if (item.editable === 1) {
          if (item.datatype === 'DATE') {
            return (
              <EditableCell value={fld} type="date" cellTrigger
                onSave={value => this.handleSave(row.id, item.field, value, item.source)}
              />
            );
          } else {
            return (
              <EditableCell value={fld} cellTrigger
                onSave={value => this.handleSave(row.id, item.field, value, item.source)}
              />
            );
          }
        } else if (item.datatype === 'DATE') {
          return fld && moment(fld).format('YYYY.MM.DD');
        } else {
          return fld;
        }
      },
      renderExcelCell: (fld) => {
        if (item.source === 3) {
          return fld;
        } else if (item.datatype === 'DATE') {
          return fld ? moment(fld).format('YYYY-MM-DD') : '';
        } else {
          return fld;
        }
      },
    };
  })
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadTrackingOrders({
      searchValue: this.props.orders.searchValue,
      tracking_id: this.props.params.trackingId,
      pageSize: params.pageSize,
      current: params.current,
      sorter: JSON.stringify(params.sorter),
      filters: JSON.stringify(this.state.filters),
    }),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      this.setState({ sorter });
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: {
          field: sorter.field,
          order: sorter.order === 'ascend' ? 'ASC' : 'DESC',
        },
      };
      return params;
    },
    remotes: this.props.orders,
  })
  handleExport = () => {
    this.setState({ exportLoading: true });
    this.props.loadTrackingOrders({
      searchValue: '',
      tracking_id: this.props.params.trackingId,
      pageSize: 99999999,
      current: 1,
      sorter: JSON.stringify({
        field: this.state.sorter.field,
        order: this.state.sorter.order === 'ascend' ? 'ASC' : 'DESC',
      }),
      filters: JSON.stringify(this.state.filters),
    }).then((result) => {
      const table = [];
      const columns = this.makeColumns();
      const head = columns.map(item => item.custom_title);
      head.push('追踪单号');
      table.push(head);
      result.data.data.forEach((items) => {
        const row = columns.map(item => item.renderExcelCell(items[item.dataIndex], items));
        table.push([...row, items.shipmt_order_no]);
      });
      const sheets = [{ name: 'sheet1', data: table }];
      this.props.makeExcel(sheets, `${createFilename('scvTracking')}.xlsx`).then((result1) => {
        window.open(`${API_ROOTS.default}v1/common/excel/${result1.data.filename}`);
        this.setState({ exportLoading: false });
      });
    });
  }
  handleSearch = (value) => {
    this.props.loadTrackingOrders({
      searchValue: value,
      tracking_id: this.props.params.trackingId,
      pageSize: this.props.orders.pageSize,
      current: 1,
      sorter: JSON.stringify({
        field: this.state.sorter.field,
        order: this.state.sorter.order === 'ascend' ? 'ASC' : 'DESC',
      }),
    });
  }
  render() {
    const { trackingItems, orders } = this.props;
    const { tracking } = this.state;
    this.dataSource.remotes = orders;
    const tableWidth = trackingItems.map(item => item.width).reduce((a, b) => a + b, 0);
    const toolbarActions = (<span>
      <Search
        style={{ width: 240 }}
        placeholder="搜索"
        onSearch={this.handleSearch}
      />
    </span>);
    return (
      <Layout>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('shipmentsTracking')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {tracking.name}
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <Button type="primary" ghost icon="export" onClick={this.handleExport} loading={this.state.exportLoading}>导出</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable toolbarActions={toolbarActions} columns={this.makeColumns()} scroll={{ x: tableWidth }} dataSource={this.dataSource} rowKey="shipmt_order_no" />
        </Content>
      </Layout>
    );
  }
}
