import React, { PropTypes, Component } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import inviteModal from '../components/inviteModal';
import { mapPartnerships } from '../util/dataMapping';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadToInvites, inviteOnlinePartner, inviteOfflinePartner } from 'common/reducers/invitation';

const rowSelection = {
  onChange() {}
};

function fetchData({ state, dispatch }) {
  return dispatch(loadToInvites(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  toInvites: state.invitation.toInvites,
  tenantId: state.account.tenantId
}), { inviteOnlinePartner, inviteOfflinePartner })
export default class ToInviteList extends Component {
  static propTypes = {
    toInvites: PropTypes.array.isRequired,            // 待邀请的partner
    inviteOnlinePartner: PropTypes.func.isRequired,   // 邀请线上partner的action creator
    inviteOfflinePartner: PropTypes.func.isRequired,  // 邀请线下partner的action creator
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
      title: '关系类型',
      dataIndex: 'partnerships',
      key: 'partnerships',
      render(_, record) {
        return (
          <span>{mapPartnerships(record.partnerships)}</span>
        );
      }
    },
    {
      title: '创建日期',
      dataIndex: 'created_date',
      key: 'created_date',
      render(_, record) {
        return (
          <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
        );
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (_, record) => {
        const inviteeInfo = {
          name: record.name,
          code: record.code,
          tenantId: record.tenant_id,
          partnerId: record.partner_id,
        };
        return (
          <a onClick={() => this.handleInviteBtnClick(inviteeInfo)}>邀请加入</a>
        );
      }
    }
  ]
  handleInviteBtnClick = (inviteeInfo) => {
    const { tenantId } = this.props;
    if (inviteeInfo.tenantId === -1) { // 线下邀请
      inviteModal({
        onOk: (contactInfo) => {
          this.props.inviteOfflinePartner({tenantId, contactInfo, inviteeInfo});
        }
      });
    } else { // 线上邀请
      this.props.inviteOnlinePartner({tenantId, inviteeInfo});
    }
  }
  render() {
    const { toInvites } = this.props;
    return (
      <Table columns={this.columns} dataSource={addUniqueKeys(toInvites)} rowSelection={rowSelection}/>
    );
  }
}
