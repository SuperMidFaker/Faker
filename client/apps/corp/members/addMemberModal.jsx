import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Table, Modal, Input, Button } from 'antd';
import { loadNonDepartmentMembers, saveDepartMember, closeMemberModal } from 'common/reducers/personnel';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.personnel.visibleMemberModal,
    deptId: state.personnel.memberFilters.dept_id,
  }),
  { loadNonDepartmentMembers, saveDepartMember, closeMemberModal }
)
export default class AddMemberModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    deptId: PropTypes.oneOfType([PropTypes.oneOf([undefined]), PropTypes.number.isRequired]),
    loadNonDepartmentMembers: PropTypes.func.isRequired,
    saveDepartMember: PropTypes.func.isRequired,
    closeMemberModal: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    added: false,
    allMembers: [],
    members: [],
    searchValue: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.deptId !== undefined) {
      this.props.loadNonDepartmentMembers(nextProps.deptId, nextProps.tenantId).then((result) => {
        if (!result.error) {
          this.setState({ allMembers: result.data, members: result.data });
        }
      });
    }
  }

  handleCancel = () => {
    this.props.closeMemberModal();
    if (this.state.added) {
      this.props.reload();
    }
    this.setState({ allMembers: [], members: [], added: false, searchValue: '' });
  }
  handleAddMember = (userId) => {
    this.props.saveDepartMember(this.props.deptId, userId).then((result) => {
      if (!result.error) {
        const members = this.state.members.filter(mem => mem.user_id !== userId);
        const allMembers = this.state.allMembers.filter(mem => mem.user_id !== userId);
        this.setState({ members, allMembers, added: true });
      }
    });
  }
  handleSearchChange = (ev) => {
    this.setState({ searchValue: ev.target.value });
  }
  handleMemberSearch = (searched) => {
    if (searched) {
      const members = this.state.allMembers.filter(mem => mem.name.indexOf(searched) >= 0);
      this.setState({ members });
    } else {
      this.setState({ members: this.state.allMembers });
    }
  }
  columns = [{
    dataIndex: 'name',
    width: '90%',
  }, {
    width: '10%',
    render: (_, row) => <Button onClick={() => this.handleAddMember(row.user_id)}>添加</Button>,
  }]
  render() {
    const { members, searchValue } = this.state;
    const { visible } = this.props;
    return (
      <Modal maskClosable={false} visible={visible} title="添加成员到部门" onCancel={this.handleCancel} footer={null}>
        <Search placeholder="搜索成员" style={{ width: 480, marginBottom: 5, borderBottom: '1px solid #F1F1F1' }}
          onSearch={this.handleMemberSearch} value={searchValue} onChange={this.handleSearchChange}
        />
        <Table dataSource={members} columns={this.columns} showHeader={false} scroll={{ y: 500 }} pagination={false}
          rowKey="user_id"
        />
      </Modal>
    );
  }
}
