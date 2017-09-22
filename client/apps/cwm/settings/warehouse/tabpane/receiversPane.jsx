import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Icon, Table, Tag } from 'antd';
import { toggleReceiverModal, loadReceivers, deleteReceiver, changeReceiverStatus } from 'common/reducers/cwmWarehouse';
import RowUpdater from 'client/components/rowUpdater';
import WhseReceiversModal from '../modal/whseReceiversModal';
import { formatMsg } from '../message.i18n';
import * as Location from 'client/util/location';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
    receivers: state.cwmWarehouse.receivers,
    loginId: state.account.loginId,
  }),
  { toggleReceiverModal, loadReceivers, deleteReceiver, changeReceiverStatus }
)
export default class ReceiversPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    receivers: PropTypes.array.isRequired,
    whseOwners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      owner_code: PropTypes.string,
      owner_name: PropTypes.string.isRequired,
    })),
  }
  componentWillMount() {
    this.props.loadReceivers(this.props.whseCode, this.props.whseTenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadReceivers(nextProps.whseCode, nextProps.whseTenantId);
    }
  }
  columns = [{
    title: '代码',
    dataIndex: 'code',
    width: 100,
  }, {
    title: '收货人名称',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '海关编码',
    dataIndex: 'customs_code',
    width: 150,
  }, {
    title: '收货仓库号',
    dataIndex: 'ftz_whse_code',
    width: 100,
  }, {
    title: '地区',
    dataIndex: 'province',
    width: 150,
    rencer: (col, row) => Location.renderLocation(row),
  }, {
    title: '状态',
    dataIndex: 'active',
    width: 80,
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
    width: 150,
    render: (col) => {
      const owner = this.props.whseOwners.find(item => item.owner_partner_id === col);
      return owner ? owner.owner_name : '';
    },
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
    width: 140,
    dataIndex: 'id',
    render: (o, record) => (
      <span>
        {record.active === 0 ? <RowUpdater onHit={() => this.changeReceiverStatus(record.id, true)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeReceiverStatus(record.id, false)} label="停用" row={record} />}
        <span className="ant-divider" />
        <RowUpdater onHit={() => this.handleEditReceiver(record)} label={<Icon type="edit" />} row={record} />
        <span className="ant-divider" />
        <RowUpdater onHit={() => this.handleDeleteReceiver(record.id)} label={<Icon type="delete" />} row={record} />
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  changeReceiverStatus = (id, status) => {
    this.props.changeReceiverStatus(id, status, this.props.loginId).then((result) => {
      if (!result.error) {
        this.handleReceiverLoad();
      }
    });
  }
  handleDeleteReceiver = (id) => {
    this.props.deleteReceiver(id).then((result) => {
      if (!result.error) {
        this.handleReceiverLoad();
      }
    });
  }
  handleEditReceiver = (receiver) => {
    this.props.toggleReceiverModal(true, receiver);
  }
  handleReceiverLoad = () => {
    this.props.loadReceivers(this.props.whseCode, this.props.whseTenantId);
  }
  render() {
    const { whseCode, whseTenantId, whseOwners, receivers } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.toggleReceiverModal(true)}>添加收货人</Button>
        </div>
        <Table columns={this.columns} dataSource={receivers} rowKey="id"
          scroll={{ x: this.columns.map(item => item.width).reduce((a, b) => a + b) }}
        />
        <WhseReceiversModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
      </div>
    );
  }
}
