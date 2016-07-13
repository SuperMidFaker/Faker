import React, { PropTypes, Component } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import { mapPartnerships } from '../util/dataMapping';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadSendInvitations, cancelInvite } from 'common/reducers/invitation';

const rowSelection = {
  onChange() {}
};

function fetchData({ state, dispatch }) {
  return dispatch(loadSendInvitations(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({sendInvitations: state.invitation.sendInvitations}), { cancelInvite })
export default class SendInvitation extends Component {
  static propTypes = {
    sendInvitations: PropTypes.array.isRequired,  // 发出的邀请
    cancelInvite: PropTypes.func.isRequired,      // 取消邀请的action creator
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
      title: '邀请对方成为',
      dataIndex: 'partnerships',
      key: 'partnerships',
      render(_, record) {
        return (
          <span>{mapPartnerships(record.partnerships)}</span>
        );
      }
    },
    {
      title: '发出时间',
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
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        if (record.status === 0) {
          return (<a onClick={() => this.handleCancelInviteBtnClick(record.id, record.partnerId)}>取消邀请</a>);
        } else {
          return null;
        }
      }
    }
  ]
  handleCancelInviteBtnClick = (id, partnerId) => {
    this.props.cancelInvite(id, partnerId);
  }
  render() {
    const { sendInvitations } = this.props;
    return (
      <Table columns={this.columns} dataSource={addUniqueKeys(sendInvitations)} rowSelection={rowSelection}/>
    );
  }
}
