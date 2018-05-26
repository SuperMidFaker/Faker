import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import { showServiceTeamModal, loadServiceTeamMembers } from 'common/reducers/sofCustomers';
import { loadDepartments } from 'common/reducers/personnel';
import DataTable from 'client/components/DataTable';
import TeamModal from './teamModal';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    teamMembers: state.sofCustomers.serviceTeamMembers,
    departments: state.personnel.departments,
  }),
  { showServiceTeamModal, loadServiceTeamMembers, loadDepartments },
)
export default class ServiceTeamPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    teamMembers: PropTypes.arrayOf(PropTypes.shape({ user_id: PropTypes.number })),
  }
  state = {
    selectedRowKeys: [],
  }
  componentDidMount() {
    const { tenantId } = this.props;
    this.props.loadDepartments(tenantId);
    this.props.loadServiceTeamMembers(this.props.customer.id);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.teamMembers !== this.props.teamMembers) {
      const selectedUserIds = nextProps.teamMembers.map(item => Number(item.user_id));
      this.setState({
        selectedRowKeys: selectedUserIds,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { customer, departments, teamMembers } = this.props;
    const filters = departments.map(item => ({ text: item.name, value: item.name }));
    const column = [{
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      className: 'service-team-th-name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }, {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      filters,
      onFilter: (value, record) => {
        if (!record.department) {
          return false;
        }
        return record.department.indexOf(value) !== -1;
      },
    }];
    const toolbarActions = <Button onClick={() => this.props.showServiceTeamModal()}>添加成员</Button>;
    return (
      <div className="pane-content tab-pane">
        <DataTable size="middle" toolbarActions={toolbarActions} columns={column} dataSource={teamMembers} noSetting rowKey="id" />
        <TeamModal customer={customer} selectedUserIds={this.state.selectedRowKeys} />
      </div>
    );
  }
}
