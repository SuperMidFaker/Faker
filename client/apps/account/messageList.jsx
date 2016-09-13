import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';
import { Button, Radio } from 'antd';
import Table from 'client/components/remoteAntTable';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { MESSAGE_STATUS } from 'common/constants';
import { loadMessages, markMessages, markMessage } from 'common/reducers/corps';
import './acc.less';
const formatMsg = format(messages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch, cookie }) {
  return dispatch(loadMessages(cookie, {
    loginId: state.account.loginId,
    pageSize: state.corps.messages.pageSize,
    currentPage: state.corps.messages.currentPage,
    status: state.corps.messages.status,
  }));
}

@connectFetch()(fetchData)

@injectIntl
@connect(
  state => ({
    messages: state.corps.messages,
    loginId: state.account.loginId,
  }),
  { loadMessages, markMessages, markMessage }
)
@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 1,
  }));
})

export default class MessageList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadMessages: PropTypes.func.isRequired,
    markMessages: PropTypes.func.isRequired,
    markMessage: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  getDateDiff(refDate) {
    const time = new Date(refDate).getTime();
    const date = new Date();
    const curTime = date.getTime();
    const diffValue = curTime - time;
    const monthC = diffValue / (30 * 24 * 60 * 60 * 1000);
    const weekC = diffValue / (7 * 24 * 60 * 60 * 1000);
    const dayC = diffValue / (24 * 60 * 60 * 1000);
    const hourC = diffValue / (60 * 60 * 1000);
    const minC = diffValue / (60 * 1000);
    let result = '';
    if (monthC >= 1) {
      result = `${monthC.toFixed(0)} 月前`;
    } else if (weekC >= 1) {
      result = `${weekC.toFixed(0)} 周前`;
    } else if (dayC >= 1) {
      result = `${dayC.toFixed(0)} 天前`;
    } else if (hourC >= 1) {
      result = `${hourC.toFixed(0)} 小时前`;
    } else if (minC > 1) {
      result = `${minC.toFixed(0)} 分钟前`;
    } else {
      result = '刚刚';
    }
    return result;
  }
  handleStatusChange = (e) => {
    this.props.messages.status = e.target.value;
    this.handleLoadMessages(this.props.messages.status);
  }
  haveReadAllMessages = () => {
    this.props.markMessages({ loginId: this.props.loginId, status: 1 });
    this.handleLoadMessages(0);
  }
  clearAllMessages = () => {
    this.props.markMessages({ loginId: this.props.loginId, status: 2 });
    this.handleLoadMessages(1);
  }
  readMessage = (record) => {
    this.props.markMessage({
      id: record.id,
      status: 1,
    });
    this.handleNavigationTo(record.url);
  }
  handleLoadMessages = (status) => {
    this.props.loadMessages(null, {
      loginId: this.props.loginId,
      pageSize: this.props.messages.pageSize,
      currentPage: this.props.messages.currentPage,
      status,
    });
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  renderColumnText(status, text, record) {
    let style = {};
    if (status === MESSAGE_STATUS.read.key) {
      style = { color: '#CCC' };
    }
    return <a onClick={() => this.readMessage(record)} style={style}>{text}</a>;
  }
  renderMyButton() {
    if (this.props.messages.status === MESSAGE_STATUS.notRead.key) {
      return (<Button style={{ float: 'right' }} onClick={this.haveReadAllMessages}>{formatMsg(this.props.intl, 'markAll')}</Button>);
    } else {
      return (<Button style={{ float: 'right' }} onClick={this.clearAllMessages}>{formatMsg(this.props.intl, 'clearAll')}</Button>);
    }
  }
  render() {
    const { intl } = this.props;
    const msg = descriptor => formatMsg(intl, descriptor);
    const columns = [
      {
        title: msg('content'),
        dataIndex: 'content',
        width: '70%',
        render: (text, record) => this.renderColumnText(record.status, text, record),
      }, {
        title: msg('from_name'),
        dataIndex: 'from_name',
        width: '14%',
        render: (text, record) => this.renderColumnText(record.status, text, record),
      }, {
        title: msg('time'),
        dataIndex: 'time',
        width: '14%',
        render: (text, record) => {
          return this.renderColumnText(record.status, this.getDateDiff(text), record);
        },
      },
    ];
    const dataSource = new Table.DataSource({
      fetcher: (params) => { return this.props.loadMessages(null, params); },
      resolve: (result) => { return result.data; },
      getPagination: (result, resolve) => {
        const pagination = {
          total: result.totalCount,
          // 删除完一页时返回上一页
          current: resolve(result.totalCount, result.currentPage, result.pageSize),
          status: this.props.messages.status,
          loginId: this.props.loginId,
          showSizeChanger: true,
          showQuickJumper: false,
          pageSize: result.pageSize,
        };
        return pagination;
      },
      getParams: (pagination, filters, sorter) => {
        const params = {
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          status: this.props.messages.status,
          loginId: this.props.loginId,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        return params;
      },
      remotes: this.props.messages,
    });
    return (
      <div className="acc-panel">
        <div className="panel-heading">
          <h3>{msg('messageCenter')}</h3>
          <Button size="large" onClick={() => { this.context.router.goBack(); }} style={{ float: 'right' }} icon="left">{msg('goBack')}</Button>
        </div>
        <div className="panel-body" style={{ padding: 20 }}>
          <div>
            <RadioGroup defaultValue={this.props.messages.status} size="large" onChange={this.handleStatusChange}>
              <RadioButton value={MESSAGE_STATUS.notRead.key}>{MESSAGE_STATUS.notRead.value}</RadioButton>
              <RadioButton value={MESSAGE_STATUS.read.key}>{MESSAGE_STATUS.read.value}</RadioButton>
            </RadioGroup>
            {this.renderMyButton()}
          </div>
          <Table columns={columns} dataSource={dataSource} style={{ marginTop: 20 }} />
        </div>
      </div>
    );
  }
}
