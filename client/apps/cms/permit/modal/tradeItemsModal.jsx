import React, { Component } from 'react';
import { Modal, Input } from 'antd';
import { connect } from 'react-redux';
import { toggleTradeItemModal, loadTradeItems, addPermitTradeItem, loadPermitModels } from 'common/reducers/cmsPermit';
import DataTable from 'client/components/DataTable';

const { Search } = Input;

@connect(
  state => ({
    visible: state.cmsPermit.tradeItemModal.visible,
    modelId: state.cmsPermit.tradeItemModal.modelId,
    currentPermit: state.cmsPermit.currentPermit,
    tradeItemList: state.cmsPermit.tradeItemList,
    pageSize: state.cmsPermit.tradeItemList.pageSize,
    currentPage: state.cmsPermit.tradeItemList.current,
    loading: state.cmsPermit.tradeItemList.loading,
  }),
  {
    toggleTradeItemModal, loadTradeItems, addPermitTradeItem, loadPermitModels,
  }
)
export default class PermitItemModal extends Component {
  state = {
    searchText: '',
    selectedRowKeys: [],
    selectedRows: [],
  }
  columns = [{
    title: '序号',
    width: 45,
    render: (o, record, index) => index + 1,
  }, {
    title: '商品货号',
    dataIndex: 'cop_product_no',
  }, {
    title: 'HS编码',
    dataIndex: 'hscode',
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
  }]
  handleCancel = () => {
    this.props.toggleTradeItemModal(false);
    this.setState({
      searchText: '',
    });
  }
  handleChange = (e) => {
    this.setState({
      searchText: e.target.value,
    });
  }
  handleSearch = () => {
    const { pageSize, currentPage } = this.props;
    this.props.loadTradeItems({
      ownerPartnerId: this.props.currentPermit.owner_partner_id,
      searchText: this.state.searchText,
      pageSize,
      currentPage,
    });
  }
  handleOk = () => {
    const { modelId } = this.props;
    const { selectedRows } = this.state;
    this.props.addPermitTradeItem(modelId, selectedRows).then((result) => {
      if (!result.error) {
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
        this.handleCancel();
        this.props.loadPermitModels(this.props.permitId);
      }
    });
  }
  dataSource = new DataTable.DataSource({
    fetcher: params => this.props.loadTradeItems(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      hideOnSinglePage: true,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        ownerPartnerId: this.props.currentPermit.owner_partner_id,
        searchText: this.state.searchText,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      return params;
    },
    remotes: this.props.tradeItemList,
  })
  render() {
    this.dataSource.remotes = this.props.tradeItemList;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    return (
      <Modal
        title="关联商品货号"
        width={800}
        visible={this.props.visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        destroyOnClose
      >
        <DataTable
          size="middle"
          noSetting
          columns={this.columns}
          dataSource={this.dataSource}
          rowkey="cop_product_no"
          loading={this.props.loading}
          rowSelection={rowSelection}
          toolbarActions={
            <Search
              style={{ width: 200 }}
              value={this.state.searchText}
              onChange={this.handleChange}
              onSearch={this.handleSearch}
            />
          }
        />
      </Modal>
    );
  }
}
