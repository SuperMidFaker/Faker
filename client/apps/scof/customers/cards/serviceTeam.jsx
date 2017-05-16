import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { showServiceTeamModal, loadServiceTeamMembers } from 'common/reducers/crmCustomers';
import { loadDepartments } from 'common/reducers/personnel';
import messages from '../message.i18n';
import ServiceTeamModal from '../modals/serviceTeamModal';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    serviceTeamMembers: state.crmCustomers.serviceTeamMembers,
    departments: state.personnel.departments,
  }),
  { showServiceTeamModal, loadServiceTeamMembers, loadDepartments },
)

export default class ServiceTeam extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenanId: PropTypes.number.isRequired,
    serviceTeamMembers: PropTypes.array,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    const { tenantId } = this.props;
    this.props.loadDepartments(tenantId);
  }
  componentWillReceiveProps(nextProps) {
    const partnerId = nextProps.customer.id;
    if (partnerId !== this.props.customer.id) {
      this.props.loadServiceTeamMembers(partnerId);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { customer, departments, serviceTeamMembers } = this.props;
    const selectedUserIds = [];
    for (let i = 0; i < serviceTeamMembers.length; i++) {
      selectedUserIds.push(Number(serviceTeamMembers[i].user_id));
    }
    const filters = [];
    for (let i = 0; i < departments.length; i++) {
      filters.push({ text: departments[i].name, value: departments[i].name });
    }
    const column = [{
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
    return (
      <Card bodyStyle={{ padding: 0, backgroundColor: '#fff' }} className="secondary-card" title={this.msg('serviceTeam')} extra={<a href="#" onClick={() => this.props.showServiceTeamModal()}>添加成员</a>} >
        <Table columns={column} dataSource={serviceTeamMembers} pagination={false} rowKey="id" />
        <ServiceTeamModal customer={customer} filters={filters} selectedUserIds={selectedUserIds} />
      </Card>
    );
  }
}
