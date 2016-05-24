import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { loadSents, cancel } from 'common/reducers/invitation';
import connectFetch from 'client/common/connect-fetch';
import connectNav from 'client/common/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { INVITATION_STATUS, PARTNERSHIP_TYPE_INFO } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
import containerMessages from 'client/containers/message.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
const formatContainerMsg = format(containerMessages);

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadSents(cookie, {
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
    text: formatContainerMsg(props.intl, 'sentInvitations'),
    moduleName: 'corp',
    withModuleLayout: false,
    goBackFn: null
  }));
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    sentlist: state.invitation.sents
  }),
  { loadSents, cancel })
export default class SentView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    sentlist: PropTypes.object.isRequired,
    cancel: PropTypes.func.isRequired,
    loadSents: PropTypes.func.isRequired
  }
  state = {
    selectedRowKeys: []
  }
  dataSource = new Table.DataSource({
    fetcher: (params) => this.props.loadSents(null, params),
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
    remotes: this.props.sentlist
  })

  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleExpire(invKey, index) {
    this.props.cancel(invKey, index).then(result => {
      if (result.error) {
        message.error(this.msg('cancelInvitationFail'), 10);
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
    title: this.msg('inviteThemToBe'),
    dataIndex: 'types',
    width: 150,
    render: (o, record) => {
      let text;
      if (record.types.length === 1
          && record.types[0].name === PARTNERSHIP_TYPE_INFO.customer) {
        text = formatGlobalMsg(this.props.intl, record.types[0].name);
      } else {
        text = `${record.types.map(t => formatGlobalMsg(this.props.intl, t.code)).join('/')}
          ${this.msg('provider')}`;
      }
      return text;
    }
  }, {
    title: this.msg('sentDate'),
    dataIndex: 'created_date',
    width: 100,
    render: (o, record) => moment(record.createdDate).format('YYYY-MM-DD')
  }, {
    title: formatContainerMsg(this.props.intl, 'statusColumn'),
    dataIndex: 'status',
    width: 100,
    render: (o, record) => {
      let text = this.msg('invitationDue');
      if (record.status === INVITATION_STATUS.ACCEPTED) {
        text = this.msg('invitationAccepted');
      } else if (record.status === INVITATION_STATUS.REJECTED) {
        text = this.msg('invitationRejected');
      } else if (record.status === INVITATION_STATUS.CANCELED) {
        text = this.msg('invitationCannceleed');
      }
      return text;
    }
  }, {
    title: formatContainerMsg(this.props.intl, 'opColumn'),
    width: 150,
    render: (text, record, index) => {
      if (record.status === INVITATION_STATUS.NEW_SENT) {
        return (
          <span>
            <a role="button" onClick={() => this.handleExpire(record.key, index)}>
            {formatGlobalMsg(this.props.intl, 'cancel')}
            </a>
          </span>
        );
      } else {
        return <span />;
      }
    }
  }]
  handleSelectionClear = () => {
    this.setState({selectedRowKeys: []});
  }
  render() {
    const { sentlist } = this.props;
    this.dataSource.remotes = sentlist;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    return (
      <div className="main-content">
        <div className="page-body fixed">
          <div className="panel-header" />
          <div className="panel-body body-responsive">
            <Table rowSelection={rowSelection} columns={this.columns} loading={sentlist.loading}
              dataSource={this.dataSource} useFixedHeader
            />
          </div>
          <div className={`bottom-fixed-row ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <Button size="large" onClick={this.handleSelectionClear} className="pull-right">
            {formatContainerMsg(this.props.intl, 'clearSelection')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
