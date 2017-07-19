import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Layout, Table } from 'antd';
import { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, freezeLocation, activeLocation } from 'common/reducers/cwmWarehouse';
import { loadWhse } from 'common/reducers/cwmContext';
import RowUpdater from 'client/components/rowUpdater';
import WhseOwnersModal from '../modal/whseOwnersModal';
import OwnerControlModal from '../modal/ownerControlModal';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, freezeLocation, activeLocation, loadWhse }
)
export default class OwnersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.array,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadwhseOwners(nextProps.whseCode);
    }
  }
  columns = [{
    title: '货主代码',
    dataIndex: 'owner_code',
    width: 150,
  }, {
    title: '货主名称',
    dataIndex: 'owner_name',
    width: 250,
  }, {
    title: '状态',
    dataIndex: 'active',
    render: (o) => {
      if (o) {
        return '启用';
      } else {
        return '停用';
      }
    },
  }, {
    title: '结算方',
    dataIndex: 'billing_party',
  }, {
    title: '操作',
    width: 150,
    render: record => (
      <span>
        <RowUpdater onHit={this.handleOwnerControl} label="控制属性" row={record} />
        <span className="ant-divider" />
        {record.active === 0 ? <RowUpdater onHit={() => this.activeLocation(record.id)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.freezeLocation(record.id)} label="停用" row={record} />}
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  handleOwnerControl = () => {
    this.props.showOwnerControlModal();
  }
  freezeLocation = (id) => {
    this.props.freezeLocation(id).then((result) => {
      if (!result.error) {
        this.props.loadwhseOwners(this.props.whseCode);
        if (this.props.whseCode === this.props.defaultWhse.code) {
          this.props.loadWhse(this.props.whseCode);
        }
      }
    });
  }
  activeLocation = (id) => {
    this.props.activeLocation(id).then((result) => {
      if (!result.error) {
        this.props.loadwhseOwners(this.props.whseCode);
        if (this.props.whseCode === this.props.defaultWhse.code) {
          this.props.loadWhse(this.props.whseCode);
        }
      }
    });
  }
  render() {
    const { whseCode, whseTenantId, whseOwners } = this.props;
    return (
      <Content>
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.showWhseOwnersModal()}>添加货主</Button>
        </div>
        <Table columns={this.columns} dataSource={whseOwners} />
        <WhseOwnersModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
        <OwnerControlModal whseCode={whseCode} />
      </Content>
    );
  }
}
