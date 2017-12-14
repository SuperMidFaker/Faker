import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Tag } from 'antd';
import { toggleSupplierModal, loadSuppliers, deleteSupplier, changeSupplierStatus } from 'common/reducers/cwmWarehouse';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SuppliersModal from '../modal/whseSuppliersModal';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    suppliers: state.cwmWarehouse.suppliers,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  {
    toggleSupplierModal, loadSuppliers, deleteSupplier, changeSupplierStatus,
  }
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
    this.props.loadSuppliers(this.props.whseCode);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadSuppliers(nextProps.whseCode);
    }
  }
  columns = [{
    title: '代码',
    dataIndex: 'code',
    width: 100,
  }, {
    title: '供货商名称',
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
    fixed: 'right',
    render: (o, record) => (
      <span>
        <RowAction onClick={() => this.handleEditSupplier(record)} icon="edit" label="修改" row={record} />
        {record.active === 0 ?
          <RowAction onClick={() => this.changeSupplierStatus(record.id, true, this.props.loginId)} icon="play-circle" tooltip="启用" row={record} /> :
          <RowAction onClick={() => this.changeSupplierStatus(record.id, false, this.props.loginId)} icon="pause-circle" tooltip="停用" row={record} />}
        <RowAction danger confirm="确定删除?" onConfirm={() => this.handleDeleteSupplier(record.id)} icon="delete" row={record} />
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
  handleDeleteSupplier = (id) => {
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
      <DataPane
        columns={this.columns} dataSource={suppliers} rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle" onClick={() => this.props.toggleSupplierModal(true)}>添加供货商</Button>
        </DataPane.Toolbar>
        <SuppliersModal whseCode={whseCode} />
      </DataPane>
    );
  }
}
