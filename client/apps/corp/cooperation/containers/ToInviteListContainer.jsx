import React, { PropTypes, Component } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import InviteModal from '../components/inviteModal';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadToInvites, inviteOnlinePartner, showInviteModal } from 'common/reducers/invitation';
import PartnershipsColumn from '../components/partnershipsColumn';

const rowSelection = {
  onChange() {},
};

function fetchData({ state, dispatch }) {
  return dispatch(loadToInvites(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  toInvitesLoaded: state.invitation.toInvitesLoaded,
  toInvites: state.invitation.toInvites,
  tenantId: state.account.tenantId,
}), { inviteOnlinePartner, showInviteModal, loadToInvites })
export default class ToInviteList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    toInvitesLoaded: PropTypes.bool.isRequired,
    toInvites: PropTypes.array.isRequired,            // 待邀请的partner
    inviteOnlinePartner: PropTypes.func.isRequired,   // 邀请线上partner的action creator
    showInviteModal: PropTypes.func.isRequired,  // 邀请线下partner的action creator
    loadToInvites: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.toInvitesLoaded) {
      this.handleTableLoad();
    }
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'name',
    key: 'name',
  }, {
    title: '企业唯一标识码',
    dataIndex: 'partner_unique_code',
    key: 'partner_unique_code',
  }, {
    title: '代码',
    dataIndex: 'partner_code',
    key: 'partner_code',
  }, {
    title: '业务关系',
    dataIndex: 'partnerships',
    key: 'partnerships',
    render: (o) => {
      return <PartnershipsColumn partnerships={o} />;
    },
  }, {
    title: '创建日期',
    dataIndex: 'created_date',
    key: 'created_date',
    render(_, record) {
      return (
        <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
      );
    },
  }, {
    title: '操作',
    dataIndex: 'tenant_type',
    key: 'tenant_type',
    render: (_, record) => {
      const inviteeInfo = {
        name: record.name,
        code: record.partner_unique_code || '',
        tenantId: record.partner_tenant_id,
        partnerId: record.id,
        phone: record.phone,
        email: record.email,
      };
      const { tenantId } = this.props;
      if (record.invited === 0) {
        if (record.partner_tenant_id === -1) {
          return (
            <PrivilegeCover module="corp" feature="partners" action="edit">
              <a onClick={() => this.handleShowInviteModal(inviteeInfo)}>申请开通</a>
            </PrivilegeCover>
          );
        } else {
          return (
            <PrivilegeCover module="corp" feature="partners" action="edit">
              <a onClick={() => this.props.inviteOnlinePartner({ tenantId, inviteeInfo })}>邀请加入</a>
            </PrivilegeCover>
          );
        }
      } else if (record.invited === 2) {
        return '已申请';
      }

      return '';
    },
  }]
  handleTableLoad = () => {
    this.props.loadToInvites(this.props.tenantId);
  }
  handleShowInviteModal = (inviteeInfo) => {
    this.props.showInviteModal(true, inviteeInfo);
  }
  render() {
    const { toInvites } = this.props;
    return (
      <div>
        <Table columns={this.columns} dataSource={addUniqueKeys(toInvites)} rowSelection={rowSelection} />
        <InviteModal />
      </div>
    );
  }
}
