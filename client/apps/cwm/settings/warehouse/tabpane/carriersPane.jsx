import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Tag } from 'antd';
import { toggleCarrierModal, loadCarriers, deleteCarrier, changeCarrierStatus } from 'common/reducers/cwmWarehouse';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import CarrierModal from '../modal/whseCarrierModal';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    carriers: state.cwmWarehouse.carriers,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { toggleCarrierModal, loadCarriers, deleteCarrier, changeCarrierStatus }
)
export default class CarriersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadCarriers(this.props.whseCode);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadCarriers(nextProps.whseCode);
    }
  }
  columns = [{
    title: '代码',
    dataIndex: 'code',
    width: 100,
  }, {
    title: '承运人名称',
    dataIndex: 'name',
    width: 250,
  }, {
    title: '海关编码',
    dataIndex: 'customs_code',
    width: 150,
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
        <RowAction onClick={() => this.handleEditCarrier(record)} icon="edit" label="修改" row={record} />
        {record.active === 0 ?
          <RowAction onClick={() => this.changeCarrierStatus(record.id, true, this.props.loginId)} icon="play-circle" tooltip="启用" row={record} /> :
          <RowAction onClick={() => this.changeCarrierStatus(record.id, false, this.props.loginId)} icon="pause-circle" tooltip="停用" row={record} />}
        <RowAction danger confirm="确定删除?" onConfirm={() => this.handleDeleteCarrier(record.id)} icon="delete" row={record} />
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  changeCarrierStatus = (id, status) => {
    this.props.changeCarrierStatus(id, status).then((result) => {
      if (!result.error) {
        this.props.loadCarriers(this.props.whseCode);
      }
    });
  }
  handleDeleteCarrier = (id) => {
    this.props.deleteCarrier(id).then((result) => {
      if (!result.error) {
        this.props.loadCarriers(this.props.whseCode);
      }
    });
  }
  handleEditCarrier = (carrier) => {
    this.props.toggleCarrierModal(true, carrier);
  }
  render() {
    const { whseCode, carriers } = this.props;
    return (
      <DataPane
        columns={this.columns} dataSource={carriers} rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle" onClick={() => this.props.toggleCarrierModal(true)}>添加承运人</Button>
        </DataPane.Toolbar>
        <CarrierModal whseCode={whseCode} />
      </DataPane>
    );
  }
}
