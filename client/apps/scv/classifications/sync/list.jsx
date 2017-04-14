import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadSyncList, loadClassificatonBrokers } from 'common/reducers/scvClassification';
import connectNav from 'client/common/decorators/connect-nav';
import Table from 'client/components/remoteAntTable';
import EditableCell from 'client/components/EditableCell';
import ScvClassificationWrapper from '../wrapper';
import SyncShareEditCell from './syncShareEditCell';
import { SYNC_AUDIT_METHODS, PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const Content = Layout.Content;
function fetchData({ state, dispatch }) {
  const proms = [
    dispatch(loadClassificatonBrokers(
      state.account.tenantId, PARTNER_ROLES.SUP,
      PARTNER_BUSINESSE_TYPES.clearance)),
    dispatch(loadSyncList({
      tenantId: state.account.tenantId,
      pageSize: state.scvClassification.synclist.pageSize,
      current: state.scvClassification.synclist.current,
    }))];
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    synclist: state.scvClassification.synclist,
    brokers: state.scvClassification.shareBrokers,
  })
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ScvClassifySyncList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('classifyBroker'),
    dataIndex: 'broker_name',
    width: 200,
  }, {
    title: this.msg('classifyAudit'),
    width: 160,
    dataIndex: 'audit_way',
    render: (aw, row) => (
      <EditableCell value={aw} options={SYNC_AUDIT_METHODS} type="select"
        onSave={value => this.handleAuditChange(row.id, value)}
      />),
  }, {
    title: this.msg('classifyShare'),
    width: 300,
    render: (_, row) => <SyncShareEditCell checkedBrokers={row.shares} shareBrokers={this.props.brokers}
      onSave={value => this.handleShareChange(row.id, value)}
    />,
  }]
  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadSyncList(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination) => {
      const params = {
        tenantId: this.props.tenantId,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.synclist,
  })
  render() {
    const { loading, synclist } = this.props;
    this.dataSource.remotes = synclist;
    return (
      <ScvClassificationWrapper menuKey="sync">
        <Content className="nav-content">
          <div className="panel-body table-panel">
            <Table columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="id" scroll={{ x: 1200 }} />
          </div>
        </Content>
      </ScvClassificationWrapper>
    );
  }
}
