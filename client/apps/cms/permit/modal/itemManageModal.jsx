import React, { Component } from 'react';
import { Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleItemManageModal, loadModelItems, deleteModelItem, loadPermitModels, toggleTradeItemModal } from 'common/reducers/cmsPermit';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
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
    intl: intlShape.isRequired,
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
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleClose = () => {
    this.props.toggleItemManageModal(false);
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
    title: this.msg('productNo'),
    dataIndex: 'cop_product_no',
  }, {
    title: this.msg('hscode'),
    dataIndex: 'hscode',
    width: 120,
  }, {
    title: this.msg('gName'),
    dataIndex: 'g_name',
  }, {
    title: this.msg('customsControl'),
    dataIndex: 'customs_control',
  }, {
    title: this.msg('inspectionQuarantine'),
    dataIndex: 'inspection_quarantine',
  }, {
    dataIndex: 'OPS_COL',
    width: 60,
    render: (o, record) => <RowAction danger confirm={this.msg('ensureDelete')} onConfirm={this.handleDelete} icon="delete" tooltip={this.msg('delete')} row={record} />,
  }]
  render() {
    const { visible, loading } = this.props;
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
    const title = (<div>
      <span>{this.msg('productNoManage')}</span>
      <div className="toolbar-right">
        <Button onClick={this.handleClose}>{this.msg('close')}</Button>
      </div>
    </div>);
    const toolbarActions = (<span>
      <Button type="primary" icon="plus-circle-o" onClick={this.toggleTradeItemModal}>{this.msg('add')}</Button>
    </span>);
    return (
      <Modal
        width="100%"
        title={title}
        wrapClassName="fullscreen-modal"
        closable={false}
        footer={null}
        visible={visible}
      >
        <DataTable
          noSetting
          columns={this.columns}
          dataSource={dataSource}
          loading={loading}
          toolbarActions={toolbarActions}
        />
      </Modal>
    );
  }
}
