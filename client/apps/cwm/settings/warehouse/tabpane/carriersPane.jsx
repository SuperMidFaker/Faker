import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Table, Tag } from 'antd';
import { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, changeOwnerStatus } from 'common/reducers/cwmWarehouse';
import { loadWhse } from 'common/reducers/cwmContext';
import RowUpdater from 'client/components/rowUpdater';
import WhseOwnersModal from '../modal/whseOwnersModal';
import OwnerControlModal from '../modal/ownerControlModal';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, changeOwnerStatus, loadWhse }
)
export default class CarriersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      owner_code: PropTypes.string,
      owner_name: PropTypes.string.isRequired,
    })),
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode, this.props.whseTenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadwhseOwners(nextProps.whseCode, nextProps.whseTenantId);
    }
  }
  columns = [{
    title: '承运人代码',
    dataIndex: 'code',
    width: 150,
  }, {
    title: '承运人名称',
    dataIndex: 'ent_name',
    width: 250,
  }, {
    title: '状态',
    dataIndex: 'active',
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
    render: record => (
      <span>
        <RowUpdater onHit={this.handleOwnerControl} label="控制属性" row={record} />
        <span className="ant-divider" />
        {record.active === 0 ? <RowUpdater onHit={() => this.changeOwnerStatus(record.id, true)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeOwnerStatus(record.id, false)} label="停用" row={record} />}
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  handleOwnerControl = (ownerAuth) => {
    this.props.showOwnerControlModal(ownerAuth);
  }
  changeOwnerStatus = (id, status) => {
    this.props.changeOwnerStatus(id, status).then((result) => {
      if (!result.error) {
        this.handleOwnerLoad();
      }
    });
  }
  handleOwnerLoad = () => {
    this.props.loadwhseOwners(this.props.whseCode, this.props.whseTenantId);
    if (this.props.whseCode === this.props.defaultWhse.code) {
      this.props.loadWhse(this.props.whseCode, this.props.tenantId);
    }
  }
  render() {
    const { whseCode, whseTenantId, whseOwners } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.showWhseOwnersModal()}>添加承运人</Button>
        </div>
        <Table columns={this.columns} dataSource={whseOwners} rowKey="id" />
        <WhseOwnersModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
        <OwnerControlModal whseCode={whseCode} reload={this.handleOwnerLoad} />
      </div>
    );
  }
}
