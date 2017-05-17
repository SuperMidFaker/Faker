import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Table } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { hideServiceTeamModal, addServiceTeamMembers, loadServiceTeamMembers, loadTenantUsers } from 'common/reducers/crmCustomers';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.crmCustomers.serviceTeamModal.visible,
    tenantUsers: state.crmCustomers.serviceTeamModal.tenantUsers,
  }),
  { hideServiceTeamModal, addServiceTeamMembers, loadServiceTeamMembers, loadTenantUsers }
)

export default class ServiceTeamModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantUsers: PropTypes.array,
    hideServiceTeamModal: PropTypes.func.isRequired,
    getTenantUsers: PropTypes.func.isRequired,
    departments: PropTypes.array,
    customer: PropTypes.object.isRequired,
    selectedUserIds: PropTypes.array,
    filters: PropTypes.array.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    const { tenantId, selectedUserIds } = this.props;
    this.props.loadTenantUsers(tenantId);
    this.setState({
      selectedRowKeys: selectedUserIds,
    });
  }
  componentWillReceiveProps(nextProp) {
    const { selectedUserIds } = nextProp;
    if (selectedUserIds !== this.props.selectedUserIds) {
      this.setState({
        selectedRowKeys: selectedUserIds,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    const { selectedUserIds } = this.props;
    this.setState({
      selectedRowKeys: selectedUserIds,
    });
    this.props.hideServiceTeamModal();
  }
  handleAdd = () => {
    const partnerId = this.props.customer.id;
    const selectedRowKeys = this.state.selectedRowKeys;
    this.props.addServiceTeamMembers(partnerId, selectedRowKeys).then(
      (result) => {
        if (!result.error) {
          this.props.hideServiceTeamModal();
          this.props.loadServiceTeamMembers(partnerId);
        }
      }
    );
  }
  render() {
    const { visible, tenantUsers, filters } = this.props;
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      filters,
      onFilter: (value, record) => {
        if (!record.department) {
          return false;
        } else {
          return record.department.indexOf(value) !== -1;
        }
      },
    }];
    const rowSelection = {
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      selectedRowKeys: this.state.selectedRowKeys,
    };
    return (
      <Modal visible={visible} title="添加成员至服务团队" onCancel={this.handleCancel} onOk={this.handleAdd}>
        <Table columns={columns} dataSource={tenantUsers} rowKey="user_id" rowSelection={rowSelection} pagination={false} />
      </Modal>
    );
  }
}
