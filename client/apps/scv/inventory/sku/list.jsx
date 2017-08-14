import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, message } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { loadSkusByOwner } from 'common/reducers/cwmSku';
import Table from 'client/components/remoteAntTable';
import SearchBar from 'client/components/SearchBar';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadSkusByOwner({
    tenantId: state.account.tenantId,
    filter: JSON.stringify(state.cwmSku.listFilter),
    sorter: JSON.stringify(state.cwmSku.sortFilter),
    pageSize: state.cwmSku.list.pageSize,
    current: 1,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loading: state.cwmSku.loading,
    skulist: state.cwmSku.list,
    listFilter: state.cwmSku.listFilter,
    sortFilter: state.cwmSku.sortFilter,
  }),
  { loadSkusByOwner }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class SCVSkuList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('shipperOwner'),
    dataIndex: 'owner_name',
    width: 160,
  }, {
    title: 'SKU',
    dataIndex: 'sku_no',
    width: 100,
  }, {
    title: this.msg('productNo'),
    width: 120,
    dataIndex: 'product_no',
  }, {
    title: this.msg('productName'),
    width: 120,
    dataIndex: 'product_name',
  }, {
    title: this.msg('productCategory'),
    width: 120,
    dataIndex: 'product_category',
  }, {
    title: this.msg('productDesc'),
    width: 200,
    dataIndex: 'product_desc',
  }, {
    title: this.msg('productType'),
    width: 100,
    dataIndex: 'product_type',
  }, {
    title: this.msg('opColumn'),
    width: 160,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadSkusByOwner(params),
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
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
        sorter: JSON.stringify({
          field: sorter.field,
          order: sorter.order === 'descend' ? 'DESC' : 'ASC',
        }),
        filter: JSON.stringify(this.props.listFilter),
      };
      return params;
    },
    remotes: this.props.skulist,
  })
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, sku: value };
    this.props.loadSkusByOwner({
      tenantId: this.props.tenantId,
      filter: JSON.stringify(filter),
      sorter: JSON.stringify(this.props.sortFilter),
      pageSize: this.props.skulist.pageSize,
      current: 1,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleCreateBtnClick = () => {
    this.context.router.push('/scv/inventory/sku/create');
  }
  render() {
    const { skulist, loading } = this.props;
    this.dataSource.remotes = skulist;
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('products')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {this.msg('productsSku')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div className="page-header-tools">
            <Button size="large" icon="cloud-upload">
              {this.msg('productImport')}
            </Button>
            <Button type="primary" size="large" icon="plus" onClick={this.handleCreateBtnClick}>
              {this.msg('createSKU')}
            </Button>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <div className="toolbar">
              <SearchBar size="large" placeholder={this.msg('productSearchPlaceholder')} onInputSearch={this.handleSearch} />
            </div>
            <div className="panel-body table-panel table-fixed-layout">
              <Table columns={this.columns} dataSource={this.dataSource} rowKey="id"
                scroll={{ x: 1400 }} loading={loading}
              />
            </div>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
