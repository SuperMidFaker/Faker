import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Transfer } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { loadTenantUsers } from 'common/reducers/sofCustomers';
import { hideStaffModal, addStaff, loadStaffs } from 'common/reducers/cwmWarehouse';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cwmWarehouse.staffModal.visible,
    loginId: state.account.loginId,
    tenantUsers: state.sofCustomers.serviceTeamModal.tenantUsers,
  }),
  {
    hideStaffModal, addStaff, loadStaffs, loadTenantUsers,
  }
)

export default class ServiceTeamModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantUsers: PropTypes.array,
    getTenantUsers: PropTypes.func.isRequired,
    selectedUserIds: PropTypes.array,
  }
  state = {
    targetKeys: [],
    selectedKeys: [],
  }
  componentWillMount() {
    const { selectedUserIds } = this.props;
    this.props.loadTenantUsers();
    this.setState({
      targetKeys: selectedUserIds,
    });
  }
  componentWillReceiveProps(nextProp) {
    const { selectedUserIds } = nextProp;
    if (selectedUserIds !== this.props.selectedUserIds) {
      this.setState({
        targetKeys: selectedUserIds,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.hideStaffModal();
  }
  filterOption = (inputValue, option) => {
    const reg = new RegExp(inputValue);
    return reg.test(option.name) || reg.test(option.department);
  }
  handleChange = (keys) => {
    this.setState({ targetKeys: keys });
  }
  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...targetSelectedKeys, ...sourceSelectedKeys] });
  }
  handleAdd = () => {
    const { whseCode, loginId } = this.props;
    const targetKeys = this.state.targetKeys;
    const staffs = this.props.tenantUsers.filter(user => targetKeys.find(key => key === user.user_id));
    this.props.addStaff(whseCode, staffs, loginId).then((result) => {
      if (!result.error) {
        this.props.hideStaffModal();
        this.props.loadStaffs(whseCode);
      }
    });
  }
  render() {
    const { visible, tenantUsers } = this.props;
    const { targetKeys, selectedKeys } = this.state;
    return (
      <Modal maskClosable={false} visible={visible} title="添加员工" onCancel={this.handleCancel} onOk={this.handleAdd} width={600}>
        <Transfer
          dataSource={tenantUsers}
          titles={['所有成员', '添加员工']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={this.handleChange}
          onSelectChange={this.handleSelectChange}
          filterOption={this.filterOption}
          render={item => (<span>
            <div style={{ width: '45%', display: 'inline-block' }}>{item.name}</div>
            <div style={{ width: '45%', display: 'inline-block' }} className="mdc-text-grey">{item.department}</div>
          </span>)}
          rowKey={item => item.user_id}
          showSearch
          listStyle={{
            width: 260,
            height: 400,
          }}
        />
      </Modal>
    );
  }
}
