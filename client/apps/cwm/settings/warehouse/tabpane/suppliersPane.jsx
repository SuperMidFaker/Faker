import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Table, Tag } from 'antd';
import { showSuppliersModal, loadSuppliers, changeEnterpriseStatus } from 'common/reducers/cwmWarehouse';
import RowUpdater from 'client/components/rowUpdater';
import SuppliersModal from '../modal/suppliersModal';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    suppliers: state.cwmWarehouse.suppliers,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { showSuppliersModal, loadSuppliers, changeEnterpriseStatus }
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
    dataIndex: 'ent_code',
    width: 150,
  }, {
    title: '供应商名称',
    dataIndex: 'ent_name',
    width: 250,
  }, {
    title: '海关编码',
    dataIndex: 'ent_cus_code',
    width: 150,
  }, {
    title: '状态',
    dataIndex: 'status',
    render: (o) => {
      if (o) {
        return <Tag color="green">正常</Tag>;
      } else {
        return <Tag>停用</Tag>;
      }
    },
  }, {
    title: '关联货主',
    dataIndex: 'related_owners',
  }, {
    title: '最后修改时间',
    dataIndex: 'last_updated_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 150,
    dataIndex: 'OPS_COL',
    render: (o, record) => (
      <span>
        {record.status === 0 ? <RowUpdater onHit={() => this.changeEnterpriseStatus(record.id, true)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeEnterpriseStatus(record.id, false)} label="停用" row={record} />}
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  changeEnterpriseStatus = (id, status) => {
    this.props.changeEnterpriseStatus(id, status).then((result) => {
      if (!result.error) {
        this.props.loadSuppliers(this.props.whseCode, this.props.tenantId);
      }
    });
  }
  render() {
    const { whseCode, suppliers } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.showSuppliersModal()}>添加供应商</Button>
        </div>
        <Table columns={this.columns} dataSource={suppliers} rowKey="id" />
        <SuppliersModal whseCode={whseCode} />
      </div>
    );
  }
}
