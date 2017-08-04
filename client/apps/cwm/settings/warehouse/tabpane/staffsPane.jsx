import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Layout, Table } from 'antd';
import { showStaffModal, loadStaffs } from 'common/reducers/cwmWarehouse';
import StaffModal from '../modal/staffModal';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    staffs: state.cwmWarehouse.staffs,
  }),
  { showStaffModal, loadStaffs }
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
  }]
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
