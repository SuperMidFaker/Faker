import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table } from 'antd';
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
    tenantId: PropTypes.number.isRequired,
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
    if (nextProps.serviceTeamMembers !== this.props.serviceTeamMembers) {
      const selectedUserIds = nextProps.serviceTeamMembers.map(item => Number(item.user_id));
      this.setState({
        selectedRowKeys: selectedUserIds,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { customer, departments, serviceTeamMembers } = this.props;
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
        } else {
          return record.department.indexOf(value) !== -1;
        }
      },
    }];
    return (
      <div className="pane">
        <div className="panel-header">
          <Button onClick={() => this.props.showServiceTeamModal()}>添加成员</Button>
        </div>
        <div className="panel-body table-panel">
          <Table size="middle" columns={column} dataSource={serviceTeamMembers} pagination={false} rowKey="id" />
        </div>
        <ServiceTeamModal customer={customer} filters={filters} selectedUserIds={this.state.selectedRowKeys} />
      </div>
    );
  }
}
