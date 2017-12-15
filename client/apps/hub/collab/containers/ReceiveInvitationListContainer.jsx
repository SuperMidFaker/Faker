import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Icon, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import PartnershipsColumn from '../components/partnershipsColumn';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadReceiveInvitations, rejectInvitation, acceptInvitation } from 'common/reducers/invitation';
import { PARTNER_ROLES } from 'common/constants';

const rowSelection = {
  onChange() {},
};

function fetchData({ state, dispatch }) {
  return dispatch(loadReceiveInvitations(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  tenantId: state.account.tenantId,
  receiveInvitationsLoaded: state.invitation.receiveInvitationsLoaded,
  receiveInvitations: state.invitation.receiveInvitations,
}), { rejectInvitation, acceptInvitation, loadReceiveInvitations })
export default class ReceiveInvitationList extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    receiveInvitationsLoaded: PropTypes.bool.isRequired,
    receiveInvitations: PropTypes.array.isRequired, // 收到的邀请
    rejectInvitation: PropTypes.func.isRequired, // 拒绝邀请的action creator
    acceptInvitation: PropTypes.func.isRequired, // 接受邀请的action creator
    loadReceiveInvitations: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.receiveInvitationsLoaded) {
      this.handleTableLoad();
    }
  }
  handleTableLoad = () => {
    this.props.loadReceiveInvitations(this.props.tenantId);
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'inviter_name',
    key: 'inviter_name',
    render: (o, record) => {
      if (record.inviter_tenant_id === -1) {
        return <Tooltip title="线下企业" placement="left"><Badge status="default" />{o}</Tooltip>;
      } else if (record.inviter_tenant_id > 0) {
        return <Tooltip title="线上租户" placement="left"><Badge status="processing" />{o}</Tooltip>;
      }
    },
  }, {
    title: '统一社会信用代码',
    dataIndex: 'code',
    key: 'partner_unique_code',
  }, {
    title: '业务关系',
    dataIndex: 'partnerships',
    key: 'partnerships',
    width: 200,
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
    width: 100,
    render: (_, record) => {
      if (record.status === 0) {
        return (
          <PrivilegeCover module="corp" feature="partners" action="edit">
            <span>
              <a onClick={() => this.handleAcceptBtnClick(record.id, record.partner_id, record.partnerships, record.customs_code)}><Icon type="check-circle-o" /> 接受</a>
              <span className="ant-divider" />
              <a onClick={() => this.handleRejectBtnClick(record.id, record.partner_id)}><Icon type="close-circle-o" /> 拒绝</a>
            </span>
          </PrivilegeCover>
        );
      } else {
        return null;
      }
    },
  }]
  handleAcceptBtnClick = (id, partnerId, partnerships, customsCode) => {
    const reversePartnerships = [];
    for (let i = 0; i < partnerships.length; i++) {
      if (partnerships[i].business_type && partnerships[i].role) {
        if (partnerships[i].role === PARTNER_ROLES.CUS) {
          // 一级承运商添加客户只区分bussiness_type
          reversePartnerships.push({
            role: PARTNER_ROLES.SUP,
            business_type: partnerships[i].business_type,
            business: null,
          });
        } else if (partnerships[i].role === PARTNER_ROLES.SUP) {
          // 客户添加服务商没有business值/一级承运商添加供应商指定了business
          const businessType = partnerships[i].business_type;
          const business = partnerships[i].business;
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
    this.props.acceptInvitation(id, partnerId, reversePartnerships, customsCode).then(() => {
      this.handleTableLoad();
    });
  }
  handleRejectBtnClick = (id, partnerId) => {
    this.props.rejectInvitation(id, partnerId).then(() => {
      this.handleTableLoad();
    });
  }
  render() {
    const { receiveInvitations } = this.props;
    const dataSource = receiveInvitations.filter(invitation => invitation.status !== 3);
    return (
      <Table columns={this.columns} dataSource={addUniqueKeys(dataSource)} rowSelection={rowSelection}
        pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
      />
    );
  }
}
