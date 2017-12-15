import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadSyncList, updateAudit, renewSharees, openAddSlaveModal } from 'common/reducers/scvClassification';
import connectNav from 'client/common/decorators/connect-nav';
import Table from 'client/components/remoteAntTable';
import EditableCell from 'client/components/EditableCell';
import SyncShareEditCell from './syncShareEditCell';
import { SYNC_AUDIT_METHODS } from 'common/constants';
import { formatMsg } from '../message.i18n';
import TrimSpan from 'client/components/trimSpan';
import AddSlaveModal from '../modals/addSlaveModal';

function fetchData({ state, dispatch }) {
  const proms = [
    dispatch(loadSyncList({
      tenantId: state.account.tenantId,
    }))];
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    reload: state.scvClassification.reload,
    tenantId: state.account.tenantId,
    synclist: state.scvClassification.synclist,
  }),
  {
    updateAudit, renewSharees, openAddSlaveModal, loadSyncList,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class SlaveSyncPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('classifySourceRepo'),
    dataIndex: 'broker_name',
    width: 80,
    render: o => <TrimSpan text={o} maxLen={12} />,
  }, {
    title: this.msg('classifyAudit'),
    width: 80,
    dataIndex: 'audit_way',
    render: (aw, row) => (
      <EditableCell value={aw} options={SYNC_AUDIT_METHODS} type="select"
        onSave={value => this.handleAuditChange(row.id, value)}
      />),
  }, {
    title: this.msg('classifyShareScope'),
    width: 150,
    render: (_, row) => (<SyncShareEditCell checkedBrokers={row.shares} shareBrokers={this.props.synclist.map(brk => ({
      tenant_id: brk.broker_tenant_id,
      name: brk.broker_name,
    }))}
      onSave={this.handleShareChange} contribute={row.broker_tenant_id} tenantId={this.props.tenantId}
    />),
  }]
  handleAuditChange = (syncId, audit) => {
    this.props.updateAudit(syncId, audit);
  }
  handleShareChange = (masterTenantId, contributeTenantId, shareeTenants) => {
    this.props.renewSharees(masterTenantId, contributeTenantId, shareeTenants);
  }
  handleAddSlave = () => {
    this.props.openAddSlaveModal();
  }
  handleSlavesReload = () => {
    this.props.loadSyncList({
      tenantId: this.props.tenantId,
    });
  }
  render() {
    const { loading, synclist } = this.props;
    return (
      <div>
        <div className="toolbar">
          <Button icon="plus" onClick={this.handleAddSlave}>
            {this.msg('addSlave')}
          </Button>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table columns={this.columns} dataSource={synclist} loading={loading} rowKey="id" scroll={{ x: 1200 }} />
        </div>
        <AddSlaveModal reload={this.handleSlavesReload} />
      </div>
    );
  }
}
