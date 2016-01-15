import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {loadCorps, delCorp, switchStatus} from '../../../../universal/redux/reducers/corps';
import {Table, Button, AntIcon, Row, Col, message} from '../../../../reusable/ant-ui';
import NavLink from '../../../../reusable/components/nav-link';
import showWarningModal from '../../../../reusable/components/deletion-warning-modal';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import {ACCOUNT_STATUS, MAX_STANDARD_TENANT, DEFAULT_MODULES} from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'corps') ) {
    return dispatch(loadCorps(cookie, {tenantId: state.account.tenantId}));
  }
}
@connectFetch()(fetchData)
@connect(
  state => ({
    corplist: state.corps.corplist,
    needUpdate: state.corps.needUpdate,
    loading: state.corps.loading,
    tenantId: state.account.tenantId
  }),
  {loadCorps, delCorp, switchStatus}
)
export default class CorpList extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    corplist: PropTypes.object.isRequired,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    switchStatus: PropTypes.func.isRequired,
    delCorp: PropTypes.func.isRequired,
    loadCorps: PropTypes.func.isRequired
  }
  constructor() {
    super();
    this.state = {
      selectedRowKeys: []
    };
  }
  handleSelectionClear() {
    this.setState({selectedRowKeys: []});
  }
  handleNavigationTo(to, query) {
    this.props.history.pushState(null, to, query);
  }
  handleCorpDel(id) {
    showWarningModal({
      title: '请输入DELETE进行下一步操作',
      content: '点击确定会删除该机构及其下所有帐户信息',
      onOk: () => this.props.delCorp(id, this.props.tenantId),
      confirmString: 'DELETE'
    });
  }
  handleStatusSwitch(tenant, index) {
    this.props.switchStatus(index, tenant.key, tenant.status === ACCOUNT_STATUS.normal.name
      ? ACCOUNT_STATUS.blocked.name : ACCOUNT_STATUS.normal.name).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
  }
  handleEnabledAppEdit(/* tenant */) {
  }
  render() {
    const { corplist, loading, needUpdate } = this.props;
    const dataSource = new Table.DataSource({
      fetcher: (params) => this.props.loadCorps(null, params),
      resolve: (result) => result.data,
      needUpdate,
      getPagination: (result) => ({
        total: result.totalCount,
        // 删除完一页时返回上一页
        current: (result.current - 1) * result.pageSize <= result.totalCount &&
          result.current * result.pageSize > result.totalCount ?
          Math.ceil(result.totalCount / result.pageSize) : result.current,
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
          sortOrder: sorter.order
        };
        for (const key in filters) {
          if (filters[key]) {
            params[key] = filters[key];
          }
        }
        return params;
      }
    });
    // 通过 rowSelection 对象表明需要行选择
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({selectedRowKeys});
      }
    };
    const columns = [{
      title: '部门/分支机构',
      dataIndex: 'name'
    }, {
      title: '负责人',
      dataIndex: 'contact'
    }, {
      title: '手机号',
      dataIndex: 'phone'
    }, {
      title: '邮箱',
      dataIndex: 'email'
    }, {
      title: '已开通应用',
      render: (o, record) => {
        const modComp = [];
        (record.apps || []).forEach((mod, idx) => {
          modComp.push(<NavLink key={`${DEFAULT_MODULES[mod].url}`} to={DEFAULT_MODULES[mod].url}>{DEFAULT_MODULES[mod].text}</NavLink>);
          modComp.push(<span className="ant-divider" key={`divider${idx}`}></span>);
        });
        return (
          <span>
            {modComp}
            <Button shape="circle" type="primary" title="编辑" onClick={() => this.handleEnabledAppEdit(record)} size="small"><AntIcon type="edit" /></Button>
          </span>);
      }
    }, {
      title: '状态',
      render: (o, record) => {
        let className = '';
        if (record.status === ACCOUNT_STATUS.normal) {
          className = 'text-disabled';
        }
        // todo make the row disabled as gray background and text color
        return <span className={className}>{ACCOUNT_STATUS[record.status].text}</span>;
      }
    }, {
      title: '操作',
      width: 150,
      render: (text, record, index) => {
        if (record.status === ACCOUNT_STATUS.normal.name) {
          return (
            <span>
              <NavLink to={`/corp/organization/edit/${record.key}`}>修改</NavLink>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>停用</a>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.blocked.name) {
          return (
            <span>
              <a role="button" onClick={() => this.handleCorpDel(record.key)}>删除</a>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>启用</a>
            </span>);
        } else {
          return <span />;
        }
      }
    }];
    return (
      <div className="page-body">
        <div className="panel-header">
          <div className="pull-right action-btns">
            <Button disabled={this.props.corplist.totalCount >= MAX_STANDARD_TENANT} type="primary"
              onClick={() => this.handleNavigationTo('/corp/organization/new')}>
              <span>新增</span>
            </Button>
          </div>
          <span>限额使用 </span>
          <span style={{fontSize: 20, fontWeight:700, color:'#51C23A'}}>{this.props.corplist.totalCount}</span>
          <span style={{fontSize: 20, fontWeight:400, color:'#333'}}>/</span>
          <span style={{fontSize: 20, fontWeight:700, color:'#333'}}>10</span>
          <a role="button">如何扩容?</a>
        </div>
        <Table rowSelection={rowSelection} columns={columns} loading={loading} remoteData={corplist} dataSource={dataSource}/>
        <div className={'bottom-fixed-row' + (this.state.selectedRowKeys.length === 0 ? ' hide' : '')}>
          <Row>
            <Col span="2" offset="20">
              <Button size="large" onClick={() => this.handleSelectionClear()}>清除选择</Button>
            </Col>
          </Row>
        </div>
      </div>);
  }
}
