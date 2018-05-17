import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Transfer } from 'antd';
import { hideServiceTeamModal, addServiceTeamMembers, loadServiceTeamMembers, loadTenantUsers } from 'common/reducers/sofCustomers';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.sofCustomers.serviceTeamModal.visible,
    tenantUsers: state.sofCustomers.serviceTeamModal.tenantUsers,
  }),
  {
    hideServiceTeamModal, addServiceTeamMembers, loadServiceTeamMembers, loadTenantUsers,
  }
)
export default class ServiceTeamModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantUsers: PropTypes.arrayOf({ user_id: PropTypes.number }),
    hideServiceTeamModal: PropTypes.func.isRequired,
    customer: PropTypes.shape({ id: PropTypes.number }).isRequired,
    selectedUserIds: PropTypes.arrayOf(PropTypes.number),
  }
  state = {
    targetKeys: [],
    selectedKeys: [],
  }
  componentDidMount() {
    const { tenantId, selectedUserIds } = this.props;
    this.props.loadTenantUsers(tenantId);
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
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.hideServiceTeamModal();
  }
  handleAdd = () => {
    const partnerId = this.props.customer.id;
    const { targetKeys } = this.state;
    this.props.addServiceTeamMembers(partnerId, targetKeys).then((result) => {
      if (!result.error) {
        this.props.hideServiceTeamModal();
        this.props.loadServiceTeamMembers(partnerId);
      }
    });
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
  render() {
    const { visible, tenantUsers } = this.props;
    const { targetKeys, selectedKeys } = this.state;
    return (
      <Modal maskClosable={false} visible={visible} title={this.msg('addToServiceTeam')} onCancel={this.handleCancel} onOk={this.handleAdd} width={600}>
        <Transfer
          dataSource={tenantUsers}
          titles={[this.msg('allMembers'), this.msg('serviceTeam')]}
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
          listStyle={{ height: 400, width: 240 }}
        />
      </Modal>
    );
  }
}
