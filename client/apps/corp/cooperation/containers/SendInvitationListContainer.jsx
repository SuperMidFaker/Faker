import React, { PropTypes, Component } from 'react';
import { Table } from 'antd';
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
  sendInvitations: state.invitation.sendInvitations
}), { cancelInvite, loadSendInvitations })
export default class SendInvitation extends Component {
  static propTypes = {
    sendInvitationsLoaded: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    sendInvitations: PropTypes.array.isRequired,  // 发出的邀请
    cancelInvite: PropTypes.func.isRequired,      // 取消邀请的action creator
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
  columns = [
    {
      title: '合作伙伴',
      dataIndex: 'invitee_name',
      key: 'invitee_name',
    }, {
      title: '代码',
      dataIndex: 'invitee_code',
      key: 'invitee_code',
    }, {
      title: '业务关系',
      dataIndex: 'partnerships',
      key: 'partnerships',
      render: (o) => {
        return <PartnershipsColumn partnerships={o}/>;
      },
    }, {
      title: '发出时间',
      dataIndex: 'created_date',
      key: 'created_date',
      render(_, record) {
        return (
          <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
        );
      },
    }, {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render(_, record) {
        switch (record.status) {
          case 0:
            return (<span>待定</span>);
          case 1:
            return (<span>已接受</span>);
          case 2:
            return (<span>已拒绝</span>);
          case 3:
            return (<span>已取消</span>);
          default:
            return null;
        }
      },
    }, {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
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
      <Table columns={this.columns} dataSource={addUniqueKeys(sendInvitations)} rowSelection={rowSelection} />
    );
  }
}
