import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { Breadcrumb, Layout } from 'antd';
import EditableCell from 'client/components/EditableCell';
import Table from 'client/components/remoteAntTable';
import { loadTrackingItems, loadTrackingOrders, upsertTrackingOrderCustom } from 'common/reducers/scvTracking';
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
  { loadTrackingItems, loadTrackingOrders, upsertTrackingOrderCustom }
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
  handleSave = (id, field, value) => {
    this.props.upsertTrackingOrderCustom(id, field, value);
  }
  dataSource = new Table.DataSource({
    fetcher: params => this.loadTrackingOrders({
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
  columns = [{
    title: '追踪单号',
    dataIndex: 'shipmt_order_no',
    width: 150,
    fixed: 'left',
  }]
  render() {
    const { trackingItems, orders } = this.props;
    const { tracking } = this.state;
    const columns = this.columns.concat(trackingItems.map(item => ({
      key: item.field,
      dataIndex: item.field,
      title: item.custom_title,
      width: item.source === 3 && item.datatype === 'DATE' ? 200 : 150,
      render: (fld, row) => {
        if (item.source === 3) {
          if (item.datatype === 'DATE') {
            return (
              <EditableCell value={fld} type="date"
                onSave={value => this.handleSave(row.id, item.field, value)}
              />
            );
          } else {
            return (
              <EditableCell value={fld}
                onSave={value => this.handleSave(row.id, item.field, value)}
              />
            );
          }
        } else if (item.datatype === 'DATE') {
          return fld && moment(fld).format('YY-MM-DD HH:mm');
        } else {
          return fld;
        }
      },
    })));
    this.dataSource.remotes = orders;
    const tableWidth = 150 + 150 * trackingItems.length + 50;
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
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="panel-body table-panel">
              <Table columns={columns} scroll={{ x: tableWidth }} dataSource={this.dataSource} rowKey="shipmt_order_no" />
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}
