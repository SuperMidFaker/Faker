import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import {loadCorps} from '../../../../universal/redux/reducers/corps';
import {Table, Button, AntIcon} from '../../../../reusable/ant-ui';
import { isLoaded } from '../../../../reusable/common/redux-actions';
import connectFetch from '../../../../reusable/decorators/connect-fetch';
import { ACCOUNT_STATUS, ADMIN } from '../../../../universal/constants';

function fetchData({state, dispatch, cookie}) {
  if (!isLoaded(state, 'corps') ) {
    return dispatch(loadCorps(cookie));
  }
}
@connectFetch()(fetchData)
@connect(
  state => ({
    corplist: state.corps.corplist,
    needUpdate: state.corps.needUpdate,
    loading: state.corps.loading,
  }),
  {loadCorps}
)
export default class CorpList extends React.Component {
  static propTypes = {
    corplist: PropTypes.object.isRequired,
    needUpdate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    loadCorps: PropTypes.func.isRequired
  }
  handleCorpReg() {
  }
  handleCorpDel(key) {
  }
  handleStatusSwitch(key) {
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
        current: result.totalCount !== 0 &&
          result.current > Math.ceil(result.totalCount / result.pageSize) ?
          Math.ceil(result.totalCount / result.pageSize) : result.current,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize
      }),
      getParams: (pagination, filters, sorter) => {
        const params = {
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
      onSelect: (/* record, selected, selectedRows */) => {
      },
      onSelectAll: (/* selected, selectedRows */) => {
      }
    };
    const columns = [{
      title: '部门/分支机构',
      dataIndex: 'name'
    }, {
      title: '负责人',
      dataIndex: 'phone'
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
        record.apps.forEach((mod, idx) => {
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
      dataIndex: 'status',
      render: (o, record) => {
        let className = '';
        if (record.status === ACCOUNT_STATUS.normal) {
          className = 'text-disabled';
        }
        return <span className={className}>{ACCOUNT_STATUS[record.status]}</span>;
      }
    }, {
      title: '操作',
      dataIndex: '',
      width: 150,
      render: (text, record, index) => {
        if (record.status === ACCOUNT_STATUS.normal) {
          return (
            <span>
              <NavLink to={`/corp/organization/edit/${record.key}`}>修改</NavLink>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleStatusSwitch(record.key)}>停用</a>
              <span className="ant-divider"></span>
              <a href="#" className="ant-dropdown-link">更多<AntIcon type="down" /></a>
            </span>);
        } else if (record.status === ACCOUNT_STATUS.blocked) {
          return (
            <span>
              <a role="button" onClick={() => this.handleStatusSwitch(record.key)}>停用</a>
              <span className="ant-divider"></span>
              <a role="button" onClick={() => this.handleCorpDel(record.key)}>删除</a>
            <span>);
        }
      }
    }];
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>组织机构</h2>
        </div>
        <div className="page-body">
          <Button type="primary" onClick={() => this.handleCorpReg()}><AntIcon type="plus" /><span>新增</span></Button>
          <div className="page-body">
            <Table rowSelection={rowSelection} columns={columns} loading={loading} remoteData={corplist} dataSource={dataSource}/>
          </div>
        </div>
      </div>
    );
  }
}
