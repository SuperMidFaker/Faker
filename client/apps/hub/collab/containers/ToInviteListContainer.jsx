import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Icon, Table, Tooltip } from 'antd';
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
    toInvites: PropTypes.array.isRequired, // 待邀请的partner
    inviteOnlinePartner: PropTypes.func.isRequired, // 邀请线上partner的action creator
    showInviteModal: PropTypes.func.isRequired, // 邀请线下partner的action creator
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
    render: (o, record) => {
      if (record.partner_tenant_id === -1) {
        return <Tooltip title="线下企业" placement="left"><Badge status="default" />{o}</Tooltip>;
      } else if (record.partner_tenant_id > 0) {
        return <Tooltip title="线上租户" placement="left"><Badge status="processing" />{o}</Tooltip>;
      }
    },
  }, {
    title: '统一社会信用代码',
    dataIndex: 'partner_unique_code',
    key: 'partner_unique_code',
  }, {
    title: '业务关系',
    dataIndex: 'partnerships',
    key: 'partnerships',
    width: 200,
    render: o => <PartnershipsColumn partnerships={o} />,
  }, {
    title: '创建日期',
    dataIndex: 'created_date',
    key: 'created_date',
    width: 150,
    render(_, record) {
      return (
        <span>{moment(record.created_date).format('YYYY/MM/DD HH:mm')}</span>
      );
    },
  }, {
    title: '操作',
    dataIndex: 'tenant_type',
    key: 'tenant_type',
    width: 100,
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
              <a onClick={() => this.handleShowInviteModal(inviteeInfo)}><Icon type="rocket" /> 申请开通</a>
            </PrivilegeCover>
          );
        } else {
          return (
            <PrivilegeCover module="corp" feature="partners" action="edit">
              <a onClick={() => this.props.inviteOnlinePartner({ tenantId, inviteeInfo })}><Icon type="star-o" /> 邀请加入</a>
            </PrivilegeCover>
          );
        }
      } else if (record.invited === 2) {
        return <span><Icon type="hourglass" /> 已申请</span>;
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
        <Table columns={this.columns} dataSource={addUniqueKeys(toInvites)} rowSelection={rowSelection}
          pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
        />
        <InviteModal />
      </div>
    );
  }
}
