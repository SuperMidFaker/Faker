import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, message, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadInbounds, loadInboundPartners, openModal, openCreateModal } from 'common/reducers/scvinbound';
import Table from 'client/components/remoteAntTable';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadInbounds({
    tenantId: state.account.tenantId,
    filter: JSON.stringify({ status: 'all' }),
    pageSize: state.scvinbound.list.pageSize,
    current: state.scvinbound.list.current,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    reload: state.scvinbound.reload,
    inboundlist: state.scvinbound.list,
    listFilter: state.scvinbound.listFilter,
  }),
  { loadInbounds, loadInboundPartners, openModal, openCreateModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class InventoryStockList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    reload: PropTypes.bool.isRequired,
    inboundlist: PropTypes.object.isRequired,
    listFilter: PropTypes.object.isRequired,
    loadInbounds: PropTypes.func.isRequired,
    loadInboundPartners: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
  }
  state = {
    expandedKeys: [],
    uploadChangeCount: 0,
    inUpload: false,
    uploadPercent: 10,
    uploadStatus: 'active',
  }
  componentDidMount() {
    this.inboundPoll = setInterval(() => {
      const { tenantId, listFilter, inboundlist: { pageSize, current } } = this.props;
      this.props.loadInbounds({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current,
      });
    }, 20 * 1000);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      const { tenantId, listFilter, inboundlist: { pageSize } } = nextProps;
      nextProps.loadInbounds({
        tenantId,
        filter: JSON.stringify(listFilter),
        pageSize,
        current: 1,
      });
    }
  }
  componentWillUnmount() {
    if (this.inboundPoll) {
      clearInterval(this.inboundPoll);
    }
  }
  inboundPoll = undefined
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('finishedProduct'),
    dataIndex: 'product_name',
    width: 120,
  }, {
    title: this.msg('category'),
    dataIndex: 'product_category',
    width: 100,
  }, {
    title: this.msg('warehouse'),
    dataIndex: 'wh_name',
    width: 100,
  }, {
    title: this.msg('stockPlan'),
    width: 80,
    dataIndex: 'stock',
  }, {
    title: this.msg('unitPrice'),
    width: 100,
    dataIndex: 'unit_price',
  }, {
    title: this.msg('stockCost'),
    width: 80,
    dataIndex: 'stock_cost',
  }, {
    title: this.msg('cartoonSize'),
    width: 80,
    colSpan: 3,
  }, {
    title: this.msg('cbmPerSku'),
    width: 80,
    dataIndex: 'unit_cbm',
  }, {
    title: this.msg('cbm'),
    width: 60,
    dataIndex: 'cbm',
  }, {
    title: this.msg('productDesc'),
    width: 150,
    dataIndex: 'product_desc',
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadInbounds(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.inboundlist,
  })
  handleImport = (info) => {
    if (this.state.uploadChangeCount === 0) {
      this.state.uploadChangeCount++;
      this.setState({ inUpload: true, uploadStatus: 'active', uploadPercent: 10 });
    } else if (info.event) {
      this.state.uploadChangeCount++;
      this.setState({ uploadPercent: info.event.percent });
    } else if (info.file.status === 'done') {
      this.setState({ inUpload: false, uploadStatus: 'success' });
      this.state.uploadChangeCount = 0;
      const { tenantId, pageSize } = this.props;
      this.props.loadInbounds({
        tenantId,
        pageSize,
        current: 1,
      });
    } else if (info.file.status === 'error') {
      this.setState({ inUpload: false, uploadStatus: 'exception' });
      this.state.uploadChangeCount = 0;
    }
  }
  handleExpandedChange = (expandedKeys) => {
    this.setState({ expandedKeys });
  }
  handleSendAtDest = (row) => {
    this.props.loadInboundPartners(this.props.tenantId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.openModal(row);
        }
      });
  }
  handleShipmentLoad = () => {
    const { tenantId, listFilter, inboundlist: { pageSize, current } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
      tenantId,
      filter: JSON.stringify(listFilter),
      pageSize,
      current,
    });
  }
  handleRadioChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {
      return;
    }
    const filter = { ...this.props.listFilter, status: ev.target.value };
    const { tenantId, inboundlist: { pageSize } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleShipmentCreate = () => {
    this.props.openCreateModal();
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, shipment_no: value };
    const { tenantId, inboundlist: { pageSize } } = this.props;
    this.setState({ expandedKeys: [] });
    this.props.loadInbounds({
      tenantId,
      filter: JSON.stringify(filter),
      pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { inboundlist } = this.props;
    this.dataSource.remotes = inboundlist;
    return (
      <Layout>
        <Header className="top-bar">
          <span>{this.msg('inventory')}</span>
        </Header>
        <Layout>
          <Sider width={280} className="menu-sider" key="sider">
            Search
          </Sider>
          <Content className="main-content" key="main">
            <div className="page-body">
              <div className="toolbar">
                <Button icon="export" onClick={this.handleShipmentCreate}>
                  {this.msg('exportInventory')}
                </Button>
              </div>
              <div className="panel-body table-panel expandable">
                <Table columns={this.columns} dataSource={this.dataSource} loading={inboundlist.loading}
                  expandedRowKeys={this.state.expandedKeys} rowKey="id"
                  expandedRowRender={this.handleExpandDetail}
                  scroll={{ x: 1200 }} onExpandedRowsChange={this.handleExpandedChange}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
