import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Input, message, Modal, Checkbox } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { loadReceiveds, change } from
'common/reducers/invitation';
import connectFetch from 'client/common/connect-fetch';
import connectNav from 'client/common/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { PARTNERSHIP_TYPE_INFO } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
import containerMessages from 'client/containers/message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadReceiveds(cookie, {
    tenantId: state.account.tenantId,
    pageSize: state.invitation.receiveds.pageSize,
    currentPage: state.invitation.receiveds.current
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 2,
    text: formatContainerMsg(props.intl, 'recvInvitations'),
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    receivedlist: state.invitation.receiveds
  }),
  { change, loadReceiveds })
export default class ReceivedView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    receivedlist: PropTypes.object.isRequired,
    change: PropTypes.func.isRequired,
    loadReceiveds: PropTypes.func.isRequired
  }
  state = {
    visibleModal: false,
    invitation: {},
    index: -1,
    checkedProviderTypes: [],
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: (params) => this.props.loadReceiveds(null, params),
    resolve: (result) => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
        sortField: sorter.field,
        sortOrder: sorter.order,
        filters: []
      };
      for (const key in filters) {
        if (filters[key] && filters[key].length > 0) {
          params.filters.push({
            name: key,
            value: filters[key][0]
          });
        }
      }
      params.filters = JSON.stringify(params.filters);
      return params;
    },
    remotes: this.props.receivedlist
  })

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleAccept(invitation, index) {
    if (invitation.types.length === 1
        && invitation.types[0].code === PARTNERSHIP_TYPE_INFO.customer) {
      // 显示设置合作方的关系类型选择框
      this.setState({
        visibleModal: true,
        invitation,
        index
      });
    } else {
      // 合作方成为'客户'
      this.props.change(invitation.key, 'accept', index, [ PARTNERSHIP_TYPE_INFO.customer ])
        .then(result => {
          if (result.error) {
            message.error(this.msg('acceptFailed'), 10);
          }
        });
    }
  }
  handleReject(invKey, index) {
    this.props.change(invKey, 'reject', index).then(result => {
      if (result.error) {
        message.error(this.msg('rejectFailed'), 10);
      }
    });
  }
  columns = [{
    title: this.msg('partnerName'),
    dataIndex: 'name',
    width: 200
  }, {
    title: this.msg('partnerCode'),
    dataIndex: 'code',
    width: 150
  }, {
    title: this.msg('inviteYouToBe'),
    dataIndex: 'types',
    width: 150,
    render: (o, record) => {
      let text;
      if (record.types.length === 1 && record.types[0].name === PARTNERSHIP_TYPE_INFO.customer) {
        text = formatGlobalMsg(this.props.intl, PARTNERSHIP_TYPE_INFO.customer);
      } else {
        text = `${record.types.map(t => formatGlobalMsg(this.props.intl, t.code)).join('/')}
          ${this.msg('provider')}`;
      }
      return text;
    }
  }, {
    title: this.msg('recvDate'),
    dataIndex: 'created_date',
    width: 100,
    render: (o, record) => moment(record.createdDate).format('YYYY-MM-DD')
  }, {
    title: formatContainerMsg(this.props.intl, 'statusColumn'),
    dataIndex: 'status',
    width: 100,
    render: (o, record) => {
      let text = this.msg('newInvitation');
      if (record.status === 1) {
        text = this.msg('invitationAccepted');
      } else if (record.status === 2) {
        text = this.msg('invitationRejected');
      }
      return text;
    }
  }, {
    title: formatContainerMsg(this.props.intl, 'opColumn'),
    width: 150,
    render: (text, record, index) => {
      if (record.status === 0) {
        return (
          <span>
            <a role="button" onClick={() => this.handleAccept(record, index)}>
            {this.msg('accept')}
            </a>
            <span className="ant-divider"></span>
            <a role="button" onClick={() => this.handleReject(record.key, index)}>
            {this.msg('reject')}
            </a>
          </span>
        );
      } else {
        return <span />;
      }
    }
  }]
  handleSelectionClear = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleAcceptCancel = () => {
    this.setState({ visibleModal: false });
  }
  handleProviderTypeChange = (checked) => {
    this.setState({
      checkedProviderTypes: checked
    });
  }
  handleProviderAccept = () => {
    if (this.state.checkedProviderTypes.length === 0) {
      return message.error(this.msg('selectProviderType'), 10);
    }
    this.props.change(this.state.invitation.key, 'accept', this.state.index,
                      this.state.checkedProviderTypes)
      .then(result => {
        if (result.error) {
          message.error(this.msg('acceptFailed'), 10);
        }
        this.setState({ visibleModal: false });
      });
  }
  render() {
    const { receivedlist } = this.props;
    this.dataSource.remotes = receivedlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    return (
      <div className="main-content">
        <div className="page-body fixed">
          <div className="panel-header">
            <div className="tools">
              <Button type="primary">{this.msg('accept')}</Button>
              <Button>{this.msg('reject')}</Button>
            </div>
            <div className="left-tools">
              <Input placeholder={this.msg('invitationCodePlaceholder')} />
              <Button>{this.msg('retrieve')}</Button>
            </div>
          </div>
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={receivedlist.loading}
              dataSource={this.dataSource} useFixedHeader
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(this.props.intl, 'clearSelection')}
            </Button>
          </div>
        </div>
        <Modal onOk={this.handleProviderAccept} onCancel={this.handleAcceptCancel}
          title={this.msg('setProviderType')} visible={this.state.visibleModal} closable={false}
        >
          <Checkbox.Group options={receivedlist.providerTypes}
            onChange={this.handleProviderTypeChange} value={ this.state.checkedProviderTypes }
          />
        </Modal>
      </div>
    );
  }
}
