import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Icon, Tag } from 'antd';
import { showStaffModal, loadStaffs, changeStaffStatus, deleteStaff } from 'common/reducers/cwmWarehouse';
import RowAction from 'client/components/RowAction';
import StaffModal from '../modal/staffModal';
import DataPane from 'client/components/DataPane';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
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
    this.props.loadStaffs(this.props.whseCode);
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
    fixed: 'right',
    render: record => (
      <span>
        {record.active === 0 ? <RowAction onClick={() => this.changeStaffStatus(record.id, true)} label="启用" row={record} /> :
        <RowAction onClick={() => this.changeStaffStatus(record.id, false)} label="停用" row={record} />}
        <span className="ant-divider" />
        <RowAction onClick={this.handleDeleteStaff} label={<Icon type="delete" />} row={record} />
      </span>
    ),
  }]
  handleDeleteStaff = (row) => {
    this.props.deleteStaff(row.id).then((result) => {
      if (!result.err) {
        this.props.loadStaffs(this.props.whseCode);
      }
    });
  }
  changeStaffStatus = (id, status) => {
    this.props.changeStaffStatus(status, id).then((result) => {
      if (!result.err) {
        this.props.loadStaffs(this.props.whseCode);
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { whseCode, staffs } = this.props;
    return (
      <DataPane
        columns={this.columns} dataSource={staffs} rowKey="id"
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle" onClick={() => this.props.showStaffModal()}>添加员工</Button>
        </DataPane.Toolbar>
        <StaffModal whseCode={whseCode} selectedUserIds={this.state.selectedRowKeys} />
      </DataPane>
    );
  }
}
