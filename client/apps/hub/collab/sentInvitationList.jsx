import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Badge, Table, Tag, Tooltip, message } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { addUniqueKeys } from 'client/util/dataTransform';
import connectFetch from 'client/common/decorators/connect-fetch';
import RowAction from 'client/components/RowAction';
import { loadSendInvitations, cancelInvite } from 'common/reducers/invitation';
import PartnershipsColumn from './common/partnershipsColumn';
import { formatMsg } from './message.i18n';

const rowSelection = {
  onChange() {},
};

function fetchData({ state, dispatch }) {
  return dispatch(loadSendInvitations(state.account.tenantId));
}

@injectIntl
@connectFetch()(fetchData)
@connect(state => ({
  sendInvitationsLoaded: state.invitation.sendInvitationsLoaded,
  tenantId: state.account.tenantId,
  sendInvitations: state.invitation.sendInvitations,
}), { cancelInvite, loadSendInvitations })

export default class SentInvitationList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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
  msg = formatMsg(this.props.intl);
  handleTableLoad = () => {
    this.props.loadSendInvitations(this.props.tenantId);
  }
  columns = [{
    title: '合作伙伴',
    dataIndex: 'invitee_name',
    key: 'invitee_name',
    width: 350,
    render: (o, record) => {
      if (record.invitee_tenant_id === -1) {
        return <Tooltip title="线下企业" placement="left"><Badge status="default" />{o}</Tooltip>;
      } else if (record.invitee_tenant_id > 0) {
        return <Tooltip title="线上租户" placement="left"><Badge status="processing" />{o}</Tooltip>;
      }
      return null;
    },
  }, {
    title: '统一社会信用代码',
    dataIndex: 'invitee_code',
    key: 'partner_unique_code',
    width: 200,
  }, {
    title: '业务关系',
    dataIndex: 'partnerships',
    key: 'partnerships',
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
          return (<Tag color="#00a854">已被接受</Tag>);
        case 2:
          return (<Tag color="#f04134">已被拒绝</Tag>);
        case 3:
          return (<Tag color="#bfbfbf">已撤回</Tag>);
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
        return (<RowAction onClick={() => this.handleRevoke(record)} icon="close-circle-o" label={this.msg('revoke')} />);
      }
      return null;
    },
  }]
  handleRevoke = (partner) => {
    this.props.cancelInvite(partner.id, partner.partnerId);
    message.info(this.msg('invitationRevoked'));
  }
  render() {
    const { sendInvitations } = this.props;
    return (
      <Table
        columns={this.columns}
        dataSource={addUniqueKeys(sendInvitations)}
        rowSelection={rowSelection}
        pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
      />
    );
  }
}
