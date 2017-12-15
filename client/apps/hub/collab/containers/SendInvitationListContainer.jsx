import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import PartnershipsColumn from '../components/partnershipsColumn';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadSendInvitations, cancelInvite } from 'common/reducers/invitation';

const rowSelection = {
  onChange() {},
};

function fetchData({ state, dispatch }) {
  return dispatch(loadSendInvitations(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  sendInvitationsLoaded: state.invitation.sendInvitationsLoaded,
  tenantId: state.account.tenantId,
  sendInvitations: state.invitation.sendInvitations,
}), { cancelInvite, loadSendInvitations })
export default class SendInvitation extends Component {
  static propTypes = {
    sendInvitationsLoaded: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    sendInvitations: PropTypes.array.isRequired, // 发出的邀请
    cancelInvite: PropTypes.func.isRequired, // 取消邀请的action creator
    loadSendInvitations: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.sendInvitationsLoaded) {
      this.handleTableLoad();
    }
  }
  handleTableLoad = () => {
    this.props.loadSendInvitations(this.props.tenantId);
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'invitee_name',
    key: 'invitee_name',
    render: (o, record) => {
      if (record.invitee_tenant_id === -1) {
        return <Tooltip title="线下企业" placement="left"><Badge status="default" />{o}</Tooltip>;
      } else if (record.invitee_tenant_id > 0) {
        return <Tooltip title="线上租户" placement="left"><Badge status="processing" />{o}</Tooltip>;
      }
    },
  }, {
    title: '统一社会信用代码',
    dataIndex: 'invitee_code',
    key: 'partner_unique_code',
  }, {
    title: '业务关系',
    dataIndex: 'partnerships',
    key: 'partnerships',
    width: 200,
    render: o => <PartnershipsColumn partnerships={o} />,
  }, {
    title: '发出时间',
    dataIndex: 'created_date',
    key: 'created_date',
    width: 150,
    render(_, record) {
      return (
        <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
      );
    },
  }, {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render(_, record) {
      switch (record.status) {
        case 0:
          return (<Tag color="#ffbf00">待定</Tag>);
        case 1:
          return (<Tag color="#00a854">已接受</Tag>);
        case 2:
          return (<Tag color="#f04134">已拒绝</Tag>);
        case 3:
          return (<Tag color="#bfbfbf">已取消</Tag>);
        default:
          return null;
      }
    },
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 100,
    render: (_, record) => {
      if (record.status === 0) {
        return (<a onClick={() => this.handleCancelInviteBtnClick(record.id, record.partner_id)}>取消邀请</a>);
      } else {
        return null;
      }
    },
  }]
  handleCancelInviteBtnClick = (id, partnerId) => {
    this.props.cancelInvite(id, partnerId);
  }
  render() {
    const { sendInvitations } = this.props;
    return (
      <Table columns={this.columns} dataSource={addUniqueKeys(sendInvitations)} rowSelection={rowSelection}
        pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
      />
    );
  }
}
