import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Button, Layout, Tabs } from 'antd';
import { loadStockMatchTask, loadMatchTaskMatched, loadMatchTaskNonmatched, loadMatchTaskLocStock } from 'common/reducers/cwmShFtzStock';
import connectNav from 'client/common/decorators/connect-nav';
import PageHeader from 'client/components/PageHeader';
import Drawer from 'client/components/Drawer';
import MagicCard from 'client/components/MagicCard';
import DescriptionList from 'client/components/DescriptionList';
import DataTable from 'client/components/DataTable';
import TrimSpan from 'client/components/trimSpan';
import FTZStockPane from './tabpane/ftzStockPane';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Description } = DescriptionList;

@injectIntl
@connect(
  state => ({
    whse: state.cwmContext.defaultWhse,
    loading: state.cwmShFtzStock.loading,
    task: state.cwmShFtzStock.matchTask,
  }),
  {
    loadStockMatchTask, loadMatchTaskMatched, loadMatchTaskNonmatched, loadMatchTaskLocStock,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class SHFTZStockMatchTask extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    task: PropTypes.shape({ task: PropTypes.shape({ owner_name: PropTypes.string }) }),
  }
  state = {
    scrollOffset: 368,
  }
  componentDidMount() {
    const { task: { matchedlist, nonmatchlist, locationStock } } = this.props;
    this.props.loadStockMatchTask(this.props.params.taskId);
    this.props.loadMatchTaskMatched({
      taskId: this.props.params.taskId,
      pageSize: matchedlist.pageSize,
      current: 1,
    });
    this.props.loadMatchTaskNonmatched({
      taskId: this.props.params.taskId,
      pageSize: nonmatchlist.pageSize,
      current: 1,
    });
    this.props.loadMatchTaskLocStock({
      taskId: this.props.params.taskId,
      pageSize: locationStock.pageSize,
      current: 1,
    });
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '货号',
    dataIndex: 'product_no',
    width: 150,
    fixed: 'left',
    render: o => <TrimSpan text={o} maxLen={15} />,
  }, {
    title: this.msg('gName'),
    width: 120,
    dataIndex: 'name',
  }, {
    title: '商品分类',
    width: 120,
    dataIndex: 'category',
  }, {
    title: '总数量',
    width: 120,
    dataIndex: 'total_qty',
  }, {
    title: '待出库数量',
    width: 120,
    dataIndex: 'locked_qty',
  }, {
    title: '剩余数量',
    width: 120,
    dataIndex: 'qty',
  }, {
    title: this.msg('unit'),
    width: 100,
    dataIndex: 'unit',
  }, {
    title: '客户订单号',
    width: 120,
    dataIndex: 'cust_order_no',
  }, {
    title: '采购订单号',
    width: 120,
    dataIndex: 'po_no',
  }, {
    title: '发票号',
    width: 120,
    dataIndex: 'invoice_no',
  }, {
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
  }, {
    title: '加锁',
    width: 80,
    dataIndex: 'frozen',
  }, {
    title: '入库日期',
    width: 120,
    dataIndex: 'inbound_timestamp',
    render: ts => ts && moment(ts).format('YYYY-MM-DD'),
  }, {
    title: '批次号',
    width: 80,
    dataIndex: 'external_lot_no',
  }, {
    title: '序列号',
    width: 80,
    dataIndex: 'serial_no',
  }, {
    title: this.msg('ftzEntNo'),
    dataIndex: 'ftz_ent_no',
    width: 200,
  }, {
    title: this.msg('cusNo'),
    width: 180,
    dataIndex: 'cus_decl_no',
  }, {
    title: this.msg('detailId'),
    dataIndex: 'ftz_ent_filed_id',
    width: 100,
  }, {
    title: this.msg('orgCargoId'),
    width: 120,
    dataIndex: 'ftz_cargo_no',
  }, {
    title: this.msg('hsCode'),
    width: 80,
    dataIndex: 'hscode',
  }, {
    title: this.msg('country'),
    width: 80,
    dataIndex: 'country',
  }, {
    title: this.msg('nWeight'),
    width: 120,
    dataIndex: 'net_wt',
  }, {
    title: this.msg('gWeight'),
    width: 120,
    dataIndex: 'gross_wt',
  }, {
    title: this.msg('money'),
    width: 120,
    dataIndex: 'amount',
  }, {
    title: this.msg('curr'),
    width: 80,
    dataIndex: 'currency',
  }, {
    title: '运费',
    width: 80,
    dataIndex: 'freight',
  }, {
    title: '运费币制',
    width: 80,
    dataIndex: 'freight_currency',
  }, {
    title: '成交方式',
    width: 80,
    dataIndex: 'trxn_mode',
  }, {
    title: '分拨',
    width: 60,
    dataIndex: 'portion',
  }, {
    title: '监管库位单位',
    width: 60,
    dataIndex: 'ftz_unit',
  }]
  matchedDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadMatchTaskMatched(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        taskId: this.props.params.taskId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.task.matchedlist,
  })
  nonmatchedDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadMatchTaskNonmatched(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        taskId: this.props.params.taskId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.task.nonmatchlist,
  })
  locDataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadMatchTaskLocStock(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        taskId: this.props.params.taskId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.task.locationStock,
  })
  handleExport = () => {
    const { params, task } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/shftz/stock/matchtask/excel/${task.task.owner_name}_匹配核对${params.taskId}.xlsx?taskId=${params.taskId}`);
  }
  handleCollapseChange = (collapsed) => {
    const scrollOffset = collapsed ? 368 : 280;
    this.setState({ scrollOffset });
  }
  render() {
    const { whse, task, loading } = this.props;
    this.matchedDataSource.remotes = task.matchedlist;
    this.nonmatchedDataSource.remotes = task.nonmatchlist;
    this.locDataSource.remotes = task.locationStock;
    return (
      <Layout>
        <PageHeader
          breadcrumb={[
            whse.name,
            '匹配结果',
            this.props.params.taskId,
          ]}
        >
          <PageHeader.Actions>
            <Button type="primary" onClick={this.handleExport}>导出</Button>
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer top onCollapseChange={this.handleCollapseChange}>
            <DescriptionList col={3}>
              <Description term="货主单位">
                {`${task.task.owner_cus_code} | ${task.task.owner_name}`}
              </Description>

            </DescriptionList>
          </Drawer>
          <Content className="page-content" key="main">
            <MagicCard bodyStyle={{ padding: 0 }}>
              <Tabs defaultActiveKey="comparison">
                <TabPane tab="匹配视图" key="comparison">
                  <DataTable
                    columns={this.columns}
                    dataSource={this.matchedDataSource}
                    rowKey="id"
                    loading={loading}
                    withBorder={false}
                    showToolbar={false}
                    scrollOffset={this.state.scrollOffset}
                  />
                </TabPane>
                <TabPane tab="未匹配视图" key="discrepancy">
                  <DataTable
                    columns={this.columns}
                    dataSource={this.nonmatchedDataSource}
                    rowKey="id"
                    loading={loading}
                    withBorder={false}
                    showToolbar={false}
                    scrollOffset={this.state.scrollOffset}
                  />
                </TabPane>
                <TabPane tab="导入库位库存" key="location">
                  <DataTable
                    columns={this.columns}
                    dataSource={this.locDataSource}
                    rowKey="id"
                    loading={loading}
                    withBorder={false}
                    showToolbar={false}
                    scrollOffset={this.state.scrollOffset}
                  />
                </TabPane>
                <TabPane tab="海关库存数据" key="ftz">
                  <FTZStockPane
                    taskId={this.props.params.taskId}
                    scrollOffset={this.state.scrollOffset}
                  />
                </TabPane>
              </Tabs>
            </MagicCard>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
