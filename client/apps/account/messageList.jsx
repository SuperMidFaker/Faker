import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Radio } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { MESSAGE_STATUS } from 'common/constants';
import { loadMessages, markMessages } from 'common/reducers/corps';
import './acc.less';
const formatMsg = format(messages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({state, dispatch, cookie}) {
  return dispatch(loadMessages(cookie, {
    loginId: state.account.loginId,
    pageSize: state.corps.messages.pageSize,
    currentPage: state.corps.messages.currentPage,
    status: state.corps.messages.status
  }));
}

@connectFetch()(fetchData)

@injectIntl
@connect(
  state => ({
    messages: state.corps.messages,
    loginId: state.account.loginId
  }),
  { loadMessages, markMessages }
)
export default class MessageList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadMessages: PropTypes.func.isRequired,
    markMessages: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleNavigationTo = (to, query) => {
    this.context.router.push({ pathname: to, query });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === MESSAGE_STATUS.read.key) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  onStatusChange = (e) => {
    this.props.messages.status = e.target.value;
    this.handleLoadMessages(this.props.messages.status);
  }
  haveReadAllMessages = () => {
    this.props.markMessages({loginId: this.props.loginId, status: 1});
    this.handleLoadMessages(0);
  }
  clearAllMessages = () => {
    this.props.markMessages({loginId: this.props.loginId, status: 2});
    this.handleLoadMessages(1);
  }
  handleLoadMessages = (status) => {
    this.props.loadMessages(null, {
      loginId: this.props.loginId,
      pageSize: this.props.messages.pageSize,
      currentPage: this.props.messages.currentPage,
      status: status
    });
  }
  renderMyButton() {
    if (this.props.messages.status === MESSAGE_STATUS.notRead.key) {
      return (<Button style={{float:'right'}} onClick={this.haveReadAllMessages}>{formatMsg(this.props.intl, 'markAll')}</Button>);
    } else {
      return (<Button style={{float:'right'}} onClick={this.clearAllMessages}>{formatMsg(this.props.intl, 'clearAll')}</Button>);
    }
  }
  getDateDiff(ref_date) {
    const time = new Date(ref_date).getTime();
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
      result = parseInt(monthC, 10) + ' 月前';
    } else if (weekC >= 1) {
      result = parseInt(weekC, 10) + ' 周前';
    } else if (dayC >= 1) {
      result = parseInt(dayC, 10) + ' 天前';
    } else if (hourC >= 1) {
      result = parseInt(hourC, 10) + ' 小时前';
    } else if (minC> 1) {
      result = parseInt(minC, 10) + ' 分钟前';
    } else {
      result = '刚刚';
    }
    return result;
  }
  render() {
    const { intl } = this.props;
    const msg = (descriptor) => formatMsg(intl, descriptor);
    const columns = [
      {
        title: msg('content'),
        dataIndex: 'content',
        width: '70%',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: msg('from_name'),
        dataIndex: 'from_name',
        width: '14%',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: msg('time'),
        dataIndex: 'time',
        width: '14%',
        render: (text, record) => {
          return this.renderColumnText(record.status, this.getDateDiff(text));
        }
      }
    ];
    const dataSource = new Table.DataSource({
      fetcher: params => {return this.props.loadMessages(null, params);},
      resolve: (result) => {return result.data;},
      getPagination: (result, resolve) => {
        const pagination = {
          total: result.totalCount,
          // 删除完一页时返回上一页
          current: resolve(result.totalCount, result.currentPage, result.pageSize),
          status: this.props.messages.status,
          loginId: this.props.loginId,
          showSizeChanger: true,
          showQuickJumper: false,
          pageSize: result.pageSize
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
          sortOrder: sorter.order
        };
        return params;
      },
      remotes: this.props.messages
    });
    return (
      <div className="acc-panel">
        <div className="panel-heading">
          <h3>{msg('messageCenter')}</h3>
        </div>
        <div className="panel-body" style={{padding:20}}>
          <div>
            <RadioGroup defaultValue={this.props.messages.status} size="large" onChange={this.onStatusChange}>
              <RadioButton value={MESSAGE_STATUS.notRead.key}>{MESSAGE_STATUS.notRead.value}</RadioButton>
              <RadioButton value={MESSAGE_STATUS.read.key}>{MESSAGE_STATUS.read.value}</RadioButton>
            </RadioGroup>
            {this.renderMyButton()}
          </div>
          <Table columns={columns} dataSource={dataSource} style={{marginTop:20}}/>
        </div>
      </div>
    );
  }
}
