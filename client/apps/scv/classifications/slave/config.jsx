import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Button } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadSyncList, loadRepoSlaves, updateAudit, renewSharees, openAddSlaveModal } from 'common/reducers/scvClassification';
import connectNav from 'client/common/decorators/connect-nav';
import Table from 'client/components/remoteAntTable';
import EditableCell from 'client/components/EditableCell';
import SyncShareEditCell from './syncShareEditCell';
import ScvClassificationWrapper from '../wrapper';
import AddSlaveModal from './addSlaveModal';
import { SYNC_AUDIT_METHODS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const Content = Layout.Content;
function fetchData({ state, dispatch }) {
  const proms = [
    dispatch(loadRepoSlaves(state.account.tenantId)),
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
    reload: state.scvClassification.reload,
    tenantId: state.account.tenantId,
    pageSize: state.scvClassification.synclist.pageSize,
    current: state.scvClassification.synclist.current,
    synclist: state.scvClassification.synclist,
    brokers: state.scvClassification.slaves,
  }),
  { updateAudit, renewSharees, openAddSlaveModal, loadSyncList, loadRepoSlaves }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ScvClassificationSlaveConfig extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('classifySourceRepo'),
    dataIndex: 'broker_name',
    width: 200,
  }, {
    title: this.msg('classifyAudit'),
    width: 200,
    dataIndex: 'audit_way',
    render: (aw, row) => (
      <EditableCell value={aw} options={SYNC_AUDIT_METHODS} type="select"
        onSave={value => this.handleAuditChange(row.id, value)}
      />),
  }, {
    title: this.msg('classifyShareScope'),
    width: 300,
    render: (_, row) => (<SyncShareEditCell checkedBrokers={row.shares} shareBrokers={this.props.brokers.map(brk => ({
      tenant_id: brk.slave_tenant_id,
      name: brk.slave_name,
    }))}
      onSave={this.handleShareChange} contribute={row.broker_tenant_id}
    />),
  }]
  handleAuditChange = (syncId, audit) => {
    this.props.updateAudit(syncId, audit);
  }
  handleShareChange = (masterTenantId, contributeTenantId, shareeTenants) => {
    this.props.renewSharees(masterTenantId, contributeTenantId, shareeTenants);
  }
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
  handleAddSlave = () => {
    this.props.openAddSlaveModal();
  }
  handleSlavesReload = () => {
    this.props.loadRepoSlaves(this.props.tenantId).then(() => {
      this.props.loadSyncList({
        tenantId: this.props.tenantId,
        pageSize: this.props.pageSize,
        current: this.props.current,
      });
    });
  }
  render() {
    const { loading, synclist } = this.props;
    this.dataSource.remotes = synclist;
    return (
      <ScvClassificationWrapper menuKey="slave">
        <Content className="nav-content">
          <div className="toolbar">
            <Button type="primary" size="large" icon="plus" onClick={this.handleAddSlave}>
              {this.msg('addSlave')}
            </Button>
          </div>
          <div className="panel-body table-panel">
            <Table columns={this.columns} dataSource={this.dataSource} loading={loading} rowKey="id" scroll={{ x: 1200 }} />
          </div>
          <AddSlaveModal reload={this.handleSlavesReload} />
        </Content>
      </ScvClassificationWrapper>
    );
  }
}
