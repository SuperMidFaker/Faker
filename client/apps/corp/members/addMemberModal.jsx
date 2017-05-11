import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Table, Modal, Button } from 'antd';
import { loadNonDepartmentMembers, closeMemberModal } from 'common/reducers/personnel';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.personnel.visibleMemberModal,
    dept_id: state.personnel.memberFilters.dept_id,
  }),
  { loadNonDepartmentMembers, closeMemberModal }
)
export default class AddMemberModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inviteOfflinePartner: PropTypes.func.isRequired,
    showInviteModal: PropTypes.func.isRequired,
    inviteeInfo: PropTypes.object.isRequired,
  }
  state = {
    members: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dept_id !== this.props.dept_id) {
      this.props.loadNonDepartmentMembers(nextProps.dept_id).then((result) => {
        if (!result.error) {
          this.setState({ members: result.data });
        }
      });
    }
  }

  handleCancel = () => {
    this.props.closeMemberModal();
    this.setState({ members: [] });
  }
  handleAddMember = () => {
    const { inviteeInfo } = this.props;
    const { phone, email } = this.state;
    this.props.inviteOfflinePartner({ contactInfo: {
      phone, email,
    }, inviteeInfo }).then(() => {
      this.handleCancel();
    });
  }
  columns = [{
    title: this.msg('fullName'),
    dataIndex: 'name',
    width: 100,
  }, {
    title: '操作',
    width: 80,
    render: () => <Button onClick={this.handleAddMember}>添加</Button>,
  }]
  render() {
    const { members } = this.state;
    const { visible } = this.props;
    return (
      <Modal visible={visible} title="添加成员" onCancel={this.handleCancel} onOk={this.handleCancel}>
        <Table dataSource={members} columns={this.columns} />
      </Modal>
    );
  }
}
