import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Table, Tag } from 'antd';
import { toggleSupplierModal, loadSuppliers, deleteSupplier, changeSupplierStatus } from 'common/reducers/cwmWarehouse';
import RowUpdater from 'client/components/rowUpdater';
import SuppliersModal from '../modal/whseSuppliersModal';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    suppliers: state.cwmWarehouse.suppliers,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { toggleSupplierModal, loadSuppliers, deleteSupplier, changeSupplierStatus }
)
export default class SuppliersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadSuppliers(this.props.whseCode, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadSuppliers(nextProps.whseCode, this.props.tenantId);
    }
  }
  columns = [{
    title: '供应商代码',
    dataIndex: 'code',
    width: 150,
  }, {
    title: '供应商名称',
    dataIndex: 'name',
    width: 250,
  }, {
    title: '海关编码',
    dataIndex: 'customs_code',
    width: 150,
  }, {
    title: '发货仓库号',
    dataIndex: 'ftz_whse_code',
    width: 100,
  }, {
    title: '状态',
    dataIndex: 'active',
    render: (o) => {
      if (o) {
        return <Tag color="green">正常</Tag>;
      } else {
        return <Tag color="red">停用</Tag>;
      }
    },
  }, {
    title: '关联货主',
    dataIndex: 'owner_partner_id',
    render: (col) => {
      const owner = this.props.whseOwners.find(item => item.owner_partner_id === col);
      return owner ? owner.owner_name : '';
    },
  }, {
    title: '最后修改时间',
    dataIndex: 'last_updated_date',
    width: 140,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 140,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 150,
    dataIndex: 'OPS_COL',
    render: (o, record) => (
      <span>
        {record.active === 0 ? <RowUpdater onHit={() => this.changeSupplierStatus(record.id, true, this.props.loginId)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeSupplierStatus(record.id, false, this.props.loginId)} label="停用" row={record} />}
        <span className="ant-divider" />
        <RowUpdater onHit={() => this.handleEditSupplier(record)} label="修改" row={record} />
        <span className="ant-divider" />
        <RowUpdater onHit={() => this.deleteSupplier(record.id)} label="删除" row={record} />
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  changeSupplierStatus = (id, status, loginId) => {
    this.props.changeSupplierStatus(id, status, loginId).then((result) => {
      if (!result.error) {
        this.props.loadSuppliers(this.props.whseCode, this.props.tenantId);
      }
    });
  }
  deleteSupplier = (id) => {
    this.props.deleteSupplier(id).then((result) => {
      if (!result.error) {
        this.props.loadSuppliers(this.props.whseCode, this.props.tenantId);
      }
    });
  }
  handleEditSupplier = (supplier) => {
    this.props.toggleSupplierModal(true, supplier);
  }
  render() {
    const { whseCode, suppliers } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.toggleSupplierModal(true)}>添加供应商</Button>
        </div>
        <Table columns={this.columns} dataSource={suppliers} rowKey="id" />
        <SuppliersModal whseCode={whseCode} />
      </div>
    );
  }
}
