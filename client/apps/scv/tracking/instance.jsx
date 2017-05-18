import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout, Button } from 'antd';
import EditableCell from 'client/components/EditableCell';
import Table from 'client/components/remoteAntTable';
import { loadTrackingItems, loadTrackingOrders, upsertTrackingOrderCustom } from 'common/reducers/scvTracking';
import { makeExcel } from 'common/reducers/common';
import { createFilename } from 'client/util/dataTransform';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackings: state.scvTracking.trackings,
    trackingItems: state.scvTracking.trackingItems,
    orders: state.scvTracking.orderList,
  }),
  { loadTrackingItems, loadTrackingOrders, upsertTrackingOrderCustom, makeExcel }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
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
  }
  componentWillMount() {
    this.props.loadTrackingItems(Number(this.props.params.trackingId));
    this.props.loadTrackingOrders({
      tracking_id: this.props.params.trackingId,
      pageSize: this.props.orders.pageSize,
      current: 1,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.trackingId !== this.props.params.trackingId) {
      nextProps.loadTrackingItems(Number(nextProps.params.trackingId));
      nextProps.loadTrackingOrders({
        tracking_id: nextProps.params.trackingId,
        pageSize: nextProps.orders.pageSize,
        current: 1,
      });
    }
    this.setState({ tracking: nextProps.trackings.find(item => item.id === Number(nextProps.params.trackingId)) });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = (id, field, value, source) => {
    this.props.upsertTrackingOrderCustom(id, field, value, source);
  }
  columns = this.props.trackingItems.map(item => ({
    key: item.field,
    dataIndex: item.field,
    title: item.custom_title,
    width: item.width,
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
  }))
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadTrackingOrders({
      tracking_id: this.props.params.trackingId,
      pageSize: params.pageSize,
      current: params.current,
    }),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: false,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: {
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        },
      };
      return params;
    },
    remotes: this.props.orders,
  })
  handleExport = () => {
    this.props.loadTrackingOrders({
      tracking_id: this.props.params.trackingId,
      pageSize: 99999999,
      current: 1,
    }).then((result) => {
      const table = [];
      const head = this.columns.map(item => item.title);
      table.push(head);
      result.data.data.forEach((items) => {
        const row = this.columns.map(item => item.renderExcelCell(items[item.dataIndex], items));
        table.push(row);
      });
      const sheets = [{ name: 'sheet1', data: table }];
      this.props.makeExcel(sheets, `${createFilename('scvTracking')}.xlsx`).then((result1) => {
        window.open(`${API_ROOTS.default}v1/common/excel/${result1.data.filename}`);
      });
    });
  }
  render() {
    const { trackingItems, orders } = this.props;
    const { tracking } = this.state;
    this.dataSource.remotes = orders;
    const tableWidth = trackingItems.map(item => item.width).reduce((a, b) => a + b, 0);
    return (
      <Layout>
        <Header className="top-bar">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('shipmentsTracking')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {tracking.name}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="top-bar-tools">
            <Button type="primary" size="large" ghost icon="export" onClick={this.handleExport}>导出</Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table columns={this.columns} scroll={{ x: tableWidth }} dataSource={this.dataSource} rowKey="shipmt_order_no" />
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}
