import React, { PropTypes, Component } from 'react';
import { Table } from 'ant-ui';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import { mapPartnerships } from '../util/dataMapping';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadReceiveInvitations, rejectInvitation, acceptInvitation } from 'common/reducers/invitation';

const rowSelection = {
  onChange() {}
};

function fetchData({ state, dispatch }) {
  return dispatch(loadReceiveInvitations(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({receiveInvitations: state.invitation.receiveInvitations}), { rejectInvitation, acceptInvitation })
export default class ReceiveInvitationList extends Component {
  static propTypes = {
    receiveInvitations: PropTypes.array.isRequired,    // 收到的邀请
    rejectInvitation: PropTypes.func.isRequired,       // 拒绝邀请的action creator
    acceptInvitation: PropTypes.func.isRequired,       // 接受邀请的action creator
  }
  columns = [
    {
      title: '合作伙伴',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '代码',
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: '邀请我方成为',
      dataIndex: 'partnerships',
      key: 'partnerships',
      render(_, record) {
        return (
          <span>{mapPartnerships(record.partnerships)}</span>
        );
      }
    },
    {
      title: '收到时间',
      dataIndex: 'created_date',
      key: 'created_date',
      render(_, record) {
        return (
          <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render(_, record) {
        switch (record.status) {
          case 0:
            return (<span>待回应</span>);
          case 1:
            return (<span>已接受</span>);
          case 2:
            return (<span>已拒绝</span>);
          default:
            return null;
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        if (record.status === 0) {
          return (
            <span>
              <a onClick={() => this.handleAcceptBtnClick(record.id)}>接受</a>
              <span className="ant-divider"></span>
              <a onClick={() => this.handleRejectBtnClick(record.id)}>拒绝</a>
            </span>
          );
        } else {
          return null;
        }
      }
    }
  ]
  handleAcceptBtnClick = (id) => {
    this.props.acceptInvitation(id);
  }
  handleRejectBtnClick = (id) => {
    this.props.rejectInvitation(id);
  }
  render() {
    const { receiveInvitations } = this.props;

    const dataSource = receiveInvitations.filter(invitation => invitation.status !== 3);
    return (
      <Table columns={this.columns} dataSource={addUniqueKeys(dataSource)} rowSelection={rowSelection}/>
    );
  }
}
