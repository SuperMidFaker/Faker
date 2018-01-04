import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleItemManageModal, loadModelItems, deleteModelItem, loadPermitModels, toggleTradeItemModal } from 'common/reducers/cmsPermit';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';

@connect(
  state => ({
    visible: state.cmsPermit.itemManageModal.visible,
    productNos: state.cmsPermit.itemManageModal.productNos,
    modelId: state.cmsPermit.itemManageModal.modelId,
    currentPermit: state.cmsPermit.currentPermit,
    modelItems: state.cmsPermit.modelItems,
    pageSize: state.cmsPermit.modelItems.pageSize,
    current: state.cmsPermit.modelItems.current,
    loading: state.cmsPermit.modelItems.loading,
  }),
  {
    toggleItemManageModal, loadModelItems, deleteModelItem, loadPermitModels, toggleTradeItemModal,
  }
)

export default class ItemManageModal extends Component {
  static propTypes = {
    permitId: PropTypes.number.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.props.loadModelItems({
        ownerPartnerId: nextProps.currentPermit.owner_partner_id,
        pageSize: nextProps.pageSize,
        current: 1,
        productNos: nextProps.productNos,
      });
    }
  }
  handleCancel = () => {
    this.props.toggleItemManageModal(false);
  }
  handleOk = () => {
    this.handleCancel();
  }
  handleDelete = (row) => {
    this.props.deleteModelItem(this.props.modelId, row.cop_product_no).then((result) => {
      if (!result.error) {
        const productNos = [...this.props.productNos.split(',')];
        const index = productNos.findIndex(no => no === row.cop_product_no);
        productNos.splice(index, 1);
        this.props.loadPermitModels(this.props.permitId);
        this.props.loadModelItems({
          ownerPartnerId: this.props.currentPermit.owner_partner_id,
          pageSize: this.props.pageSize,
          current: this.props.current,
          productNos: productNos.join(','),
        });
      }
    });
  }
  toggleTradeItemModal = () => {
    this.props.toggleTradeItemModal(true, this.props.modelId);
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
  }, {
    title: '海关监管条件',
    dataIndex: 'customs_control',
  }, {
    title: '检验检疫条件',
    dataIndex: 'inspection_quarantine',
  }, {
    dataIndex: 'OPS_COL',
    width: 45,
    render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
  }]
  render() {
    const { visible, loading } = this.props;
    const toolbarActions = (<span>
      <Button onClick={this.toggleTradeItemModal}>手动关联商品</Button>
    </span>);
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadModelItems(params),
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
          ownerPartnerId: this.props.currentPermit.owner_partner_id,
          pageSize: pagination.pageSize,
          current: pagination.current,
          productNos: this.props.productNos,
        };
        return params;
      },
      remotes: this.props.modelItems,
    });
    return (
      <Modal width="100%" title="料件管理" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <DataTable
          columns={this.columns}
          dataSource={dataSource}
          loading={loading}
          toolbarActions={toolbarActions}
        />
      </Modal>
    );
  }
}
