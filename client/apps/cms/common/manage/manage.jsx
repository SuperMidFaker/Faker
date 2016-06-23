import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setNavTitle } from 'common/reducers/navbar';
import { Table, Button, message } from 'ant-ui';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import NavLink from '../../../../components/nav-link';
import { loadCompRelations, switchStatus } from 'common/reducers/cms';
import { ACCOUNT_STATUS, RELATION_TYPES } from 'common/constants';

const rowSelection = {
  onSelect() {}
};
function fetchData({ state, dispatch, cookie }) {
  if (!state.cms.loaded) {
    return dispatch(loadCompRelations(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.cms.list.pageSize,
      currentPage: state.cms.list.currentPage,
      searchText: state.cms.list.searchText,
    }));
  }
}
function goBack(router) {
  router.goBack();
}

@connectNav((props, dispatch, router, lifecycle) => {
  if (lifecycle !== 'componentDidMount') {
    return;
  }
  dispatch(setNavTitle({
    depth: 3,
    text: '关联单位',
    moduleName: 'cms',
    withModuleLayout: false,
    goBackFn: () => goBack(router),
  }));
})

@connectFetch()(fetchData)

@connect(
  state => ({
    code: state.account.code,
    loading: state.cms.loading,
    list: state.cms.list
  }),
  { loadCompRelations, switchStatus })
export default class Manage extends Component {
  static propTypes = {
    loadCompRelations: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleStatusSwitch(record, index) {
    this.props.switchStatus(index, record.comp_code, record.status === ACCOUNT_STATUS.normal.id
      ? ACCOUNT_STATUS.blocked.id : ACCOUNT_STATUS.normal.id).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  renderColumnText(status, text) {
    let style = {};
    if (status === ACCOUNT_STATUS.blocked.id) {
      style = {color: '#CCC'};
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { list } = this.props;
    const columns = [
      {
        title: '社会信用代码',
        dataIndex: 'comp_code',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '企业名称',
        dataIndex: 'comp_name',
        render: (text, record) => this.renderColumnText(record.status, text)
      }, {
        title: '关联单位类型',
        dataIndex: 'relation_type',
        render: (text, record) => {
          for (let i = 0; i < RELATION_TYPES.length; i ++) {
            if (RELATION_TYPES[i].key == text) {
              return this.renderColumnText(record.status, RELATION_TYPES[i].value);
            }
          }
        }
      }, {
        title: '状态',
        width: 50,
        render: (o, record) => {
          let style = { color: '#51C23A' };
          let text = '正常';
          if (record.status === ACCOUNT_STATUS.blocked.id) {
            style = { color: '#CCC' };
            text = '停用';
          }
          return <span style={style}>{text}</span>;
        }
      }, {
        title: '操作',
        dataIndex: 'status',
        width: 150,
        render: (text, record, index) => {
          if (record.status === ACCOUNT_STATUS.normal.id) {
            return (
              <span>
                <NavLink to={`/import/manage/edit/${record.comp_code}`}>
                修改
                </NavLink>
                <span className="ant-divider"></span>
                <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
                停用
                </a>
              </span>);
          } else if (record.status === ACCOUNT_STATUS.blocked.id) {
            return (
              <span>
                <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
                启用
                </a>
              </span>);
          } else {
            return <span />;
          }
        }
      },
    ];
    const dataSource = new Table.DataSource({
      fetcher: params => {return this.props.loadCompRelations(null, params);},
      resolve: (result) => {return result.rows;},
      getPagination: (result, resolve) => {
        const pagination = {
          total: result.totalCount,
          // 删除完一页时返回上一页
          current: resolve(result.totalCount, result.currentPage, result.pageSize),
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
          sortField: sorter.field,
          sortOrder: sorter.order
        };
        return params;
      },
      remotes: list
    });
    return (
      <div className="main-content">
        <div className="page-body" style={{padding: 16}}>
          <Button size="large" type="primary" style={{marginBottom: 8}} onClick={() => this.handleNavigationTo('/import/manage/create')}>新建</Button>
          <Table columns={columns} dataSource={dataSource} rowSelection={rowSelection}/>
        </div>
      </div>
    );
  }
}
