import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import connectFetch from 'client/common/decorators/connect-fetch';
import RowAction from 'client/components/RowAction';
import { loadReceiveInvitations, rejectInvitation, acceptInvitation } from 'common/reducers/invitation';
import { PARTNER_ROLES } from 'common/constants';
import PartnershipsColumn from './common/partnershipsColumn';
import { formatMsg } from '../message.i18n';

const rowSelection = {
  onChange() {},
};

function fetchData({ state, dispatch }) {
  return dispatch(loadReceiveInvitations(state.account.tenantId));
}

@injectIntl
@connectFetch()(fetchData)
@connect(state => ({
  tenantId: state.account.tenantId,
  receiveInvitationsLoaded: state.invitation.receiveInvitationsLoaded,
  receiveInvitations: state.invitation.receiveInvitations,
}), { rejectInvitation, acceptInvitation, loadReceiveInvitations })
export default class ReceivedInvitationList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    receiveInvitationsLoaded: PropTypes.bool.isRequired,
    receiveInvitations: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      partner_id: PropTypes.number.isRequired,
    })).isRequired, // 收到的邀请
    rejectInvitation: PropTypes.func.isRequired, // 拒绝邀请的action creator
    acceptInvitation: PropTypes.func.isRequired, // 接受邀请的action creator
    loadReceiveInvitations: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.receiveInvitationsLoaded) {
      this.handleTableLoad();
    }
  }
  msg = formatMsg(this.props.intl);
  handleTableLoad = () => {
    this.props.loadReceiveInvitations(this.props.tenantId);
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'inviter_name',
    key: 'inviter_name',
    width: 350,
    render: (o, record) => {
      if (record.inviter_tenant_id === -1) {
        return <Tooltip title="线下企业" placement="left"><Badge status="default" />{o}</Tooltip>;
      } else if (record.inviter_tenant_id > 0) {
        return <Tooltip title="线上租户" placement="left"><Badge status="processing" />{o}</Tooltip>;
      }
      return null;
    },
  }, {
    title: '统一社会信用代码',
    dataIndex: 'code',
    key: 'partner_unique_code',
    width: 200,
  }, {
    title: '业务关系',
    dataIndex: 'partnerships',
    key: 'partnerships',
    render: o => <PartnershipsColumn partnerships={o} />,
  }, {
    title: '收到时间',
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
          return (<Tag color="#ffbf00">待回应</Tag>);
        case 1:
          return (<Tag color="#00a854">已接受</Tag>);
        case 2:
          return (<Tag color="#f04134">已拒绝</Tag>);
        default:
          return null;
      }
    },
  }, {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 180,
    render: (_, record) => {
      if (record.status === 0) {
        return (
          <PrivilegeCover module="corp" feature="partners" action="edit">
            <RowAction onClick={() => this.handleAccept(record)} icon="check-circle-o" label={this.msg('accept')} />
            <RowAction onClick={() => this.handleReject(record)} icon="close-circle-o" label={this.msg('reject')} />
          </PrivilegeCover>
        );
      }
      return null;
    },
  }]
  handleAccept = (partner) => {
    const reversePartnerships = [];
    for (let i = 0; i < partner.partnerships.length; i++) {
      if (partner.partnerships[i].business_type && partner.partnerships[i].role) {
        if (partner.partnerships[i].role === PARTNER_ROLES.CUS) {
          // 一级承运商添加客户只区分bussiness_type
          reversePartnerships.push({
            role: PARTNER_ROLES.VEN,
            business_type: partner.partnerships[i].business_type,
            business: null,
          });
        } else if (partner.partnerships[i].role === PARTNER_ROLES.VEN) {
          // 客户添加服务商没有business值/一级承运商添加供应商指定了business
          const businessType = partner.partnerships[i].business_type;
          const { business } = partner.partnerships[i];
          if (business) {
            reversePartnerships.push({
              role: PARTNER_ROLES.DCUS,
              business,
              business_type: businessType,
            });
          } else {
            reversePartnerships.push({
              role: PARTNER_ROLES.CUS,
              business: null,
              business_type: businessType,
            });
          }
        }
      }
    }
    this.props.acceptInvitation(
      partner.id,
      partner.partner_id,
      reversePartnerships,
      partner.customsCode
    ).then(() => {
      this.handleTableLoad();
    });
  }
  handleReject = (partner) => {
    this.props.rejectInvitation(partner.id, partner.partner_id).then(() => {
      this.handleTableLoad();
    });
  }
  render() {
    const { receiveInvitations } = this.props;
    const dataSource = receiveInvitations.filter(invitation => invitation.status !== 3);
    return (
      <Table
        columns={this.columns}
        dataSource={addUniqueKeys(dataSource)}
        rowSelection={rowSelection}
        pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
      />
    );
  }
}
