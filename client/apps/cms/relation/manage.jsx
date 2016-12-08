import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import NavLink from 'client/components/nav-link';
import { loadCompRelations, switchStatus } from 'common/reducers/cmsCompRelation';
import { RELATION_TYPES, I_E_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import containerMessages from 'client/apps/message.i18n';
const formatMsg = format(messages);
const formatContainerMsg = format(containerMessages);

const rowSelection = {
  onSelect() {},
};

function fetchData({ state, dispatch, cookie }) {
  if (!state.cmsCompRelation.loaded) {
    return dispatch(loadCompRelations(cookie, {
      tenantId: state.account.tenantId,
      pageSize: state.cmsCompRelation.list.pageSize,
      currentPage: state.cmsCompRelation.list.currentPage,
      searchText: state.cmsCompRelation.list.searchText,
    }));
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    code: state.account.code,
    loading: state.cmsCompRelation.loading,
    list: state.cmsCompRelation.list,
  }),
  { loadCompRelations, switchStatus })
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'relation' })
export default class Manage extends Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    intl: intlShape.isRequired,
    loadCompRelations: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleStatusSwitch(record, index) {
    this.props.switchStatus(index, record.id, record.status === 1 ? 0 : 1).then((result) => {
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
    if (status === 0) {
      style = { color: '#CCC' };
    }
    return <span style={style}>{text}</span>;
  }
  render() {
    const { list, intl, tenantId } = this.props;
    const msg = descriptor => formatMsg(this.props.intl, descriptor);
    const columns = [
      {
        title: msg('comp_code'),
        dataIndex: 'comp_code',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('comp_name'),
        dataIndex: 'comp_name',
        render: (text, record) => this.renderColumnText(record.status, text),
      }, {
        title: msg('relation_type'),
        dataIndex: 'relation_type',
        render: (text, record) => {
          for (let i = 0; i < RELATION_TYPES.length; i++) {
            if (RELATION_TYPES[i].key === text) {
              return this.renderColumnText(record.status, RELATION_TYPES[i].value);
            }
          }
        },
      }, {
        title: msg('i_e_type'),
        dataIndex: 'i_e_type',
        render: (text, record) => {
          for (let i = 0; i < I_E_TYPES.length; i++) {
            if (I_E_TYPES[i].key === text) {
              return this.renderColumnText(record.status, I_E_TYPES[i].value);
            }
          }
        },
      }, {
        title: formatContainerMsg(intl, 'statusColumn'),
        width: 50,
        render: (o, record) => {
          let style = { color: '#51C23A' };
          let text = formatContainerMsg(intl, 'accountNormal');
          if (record.status === 0) {
            style = { color: '#CCC' };
            text = formatContainerMsg(intl, 'accountDisabled');
          }
          return <span style={style}>{text}</span>;
        },
      }, {
        title: formatContainerMsg(intl, 'opColumn'),
        width: 150,
        render: (text, record, index) => {
          if (record.status === 1) {
            return (
              <PrivilegeCover module="clearance" feature="relation" action="edit">
                <span>
                  <NavLink to={`/clearance/relation/edit/${record.id}`}>
                    {formatContainerMsg(intl, 'fixOp')}
                  </NavLink>
                  <span className="ant-divider" />
                  <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
                    {formatContainerMsg(intl, 'disableOp')}
                  </a>
                </span>
              </PrivilegeCover>
            );
          } else if (record.status === 0) {
            return (
              <span>
                <PrivilegeCover module="clearance" feature="relation" action="edit">
                  <a role="button" onClick={() => this.handleStatusSwitch(record, index)}>
                    {formatContainerMsg(intl, 'enableOp')}
                  </a>
                </PrivilegeCover>
              </span>);
          } else {
            return <span />;
          }
        },
      },
    ];
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadCompRelations(null, params),
      resolve: result => result.rows,
      getPagination: (result, resolve) => {
        const pagination = {
          tenantId,
          total: result.totalCount,
          // 删除完一页时返回上一页
          current: resolve(result.totalCount, result.currentPage, result.pageSize),
          showSizeChanger: true,
          showQuickJumper: false,
          pageSize: result.pageSize,
        };
        return pagination;
      },
      getParams: (pagination, filters, sorter) => {
        const params = {
          tenantId,
          pageSize: pagination.pageSize,
          currentPage: pagination.current,
          sortField: sorter.field,
          sortOrder: sorter.order,
        };
        return params;
      },
      remotes: list,
    });
    return (
      <div>
        <header className="top-bar">
          <span />
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <PrivilegeCover module="clearance" feature="relation" action="create">
                <Button type="primary" style={{ marginBottom: 8 }} onClick={
                  () => this.handleNavigationTo('/clearance/relation/create')
                }
                >
                  {msg('new')}
                </Button>
              </PrivilegeCover>
            </div>
            <div className="panel-body table-panel">
              <Table columns={columns} dataSource={dataSource} rowSelection={rowSelection} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
