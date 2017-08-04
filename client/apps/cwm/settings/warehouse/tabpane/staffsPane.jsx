import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Layout, Table, Tag } from 'antd';
import { showStaffModal, loadStaffs, changeStaffStatus, deleteStaff } from 'common/reducers/cwmWarehouse';
import RowUpdater from 'client/components/rowUpdater';
import StaffModal from '../modal/staffModal';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    staffs: state.cwmWarehouse.staffs,
  }),
  { showStaffModal, loadStaffs, changeStaffStatus, deleteStaff }
)
export default class StaffsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadStaffs(this.props.whseCode, this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadStaffs(nextProps.whseCode, nextProps.whseTenantId);
    }
    if (nextProps.staffs !== this.props.staffs) {
      const selectedUserIds = nextProps.staffs.map(item => Number(item.login_id));
      this.setState({
        selectedRowKeys: selectedUserIds,
      });
    }
  }
  columns = [{
    title: '姓名',
    dataIndex: 'staff_name',
    width: 150,
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
    title: '操作',
    width: 100,
    render: record => (
      <span>
        {record.active === 0 ? <RowUpdater onHit={() => this.changeStaffStatus(record.id, true)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeStaffStatus(record.id, false)} label="停用" row={record} />}
        <span className="ant-divider" />
        <RowUpdater onHit={this.handleDeleteStaff} label="删除" row={record} />
      </span>
    ),
  }]
  handleDeleteStaff = (row) => {
    this.props.deleteStaff(row.id).then((result) => {
      if (!result.err) {
        this.props.loadStaffs(this.props.whseCode, this.props.tenantId);
      }
    });
  }
  changeStaffStatus = (id, status) => {
    this.props.changeStaffStatus(status, id).then((result) => {
      if (!result.err) {
        this.props.loadStaffs(this.props.whseCode, this.props.tenantId);
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { whseCode, staffs } = this.props;
    return (
      <Content>
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.showStaffModal()}>添加员工</Button>
        </div>
        <Table columns={this.columns} dataSource={staffs} rowKey="id" />
        <StaffModal whseCode={whseCode} selectedUserIds={this.state.selectedRowKeys} />
      </Content>
    );
  }
}
