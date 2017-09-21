import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Dropdown, Icon, Menu, Table, Tag, Modal } from 'antd';
import { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, changeOwnerStatus } from 'common/reducers/cwmWarehouse';
import { loadWhse } from 'common/reducers/cwmContext';
import RowUpdater from 'client/components/rowUpdater';
import WhseOwnersModal from '../modal/whseOwnersModal';
import OwnerControlModal from '../modal/ownerControlModal';
import { WHSE_OPERATION_MODES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const confirm = Modal.confirm;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, changeOwnerStatus, loadWhse }
)
export default class OwnersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      owner_code: PropTypes.string,
      owner_name: PropTypes.string.isRequired,
    })),
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode, this.props.whseTenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode) {
      this.props.loadwhseOwners(nextProps.whseCode, nextProps.whseTenantId);
    }
  }
  columns = [{
    title: '代码',
    dataIndex: 'owner_code',
    width: 100,
  }, {
    title: '货主名称',
    dataIndex: 'owner_name',
    width: 250,
  }, {
    title: '状态',
    dataIndex: 'active',
    render: (o) => {
      if (o) {
        return <Tag color="green">正常</Tag>;
      } else {
        return <Tag color="red">停用</Tag>;
      }
    },
  }, {
    title: '启用分拨',
    dataIndex: 'portion_enabled',
    render: (o) => {
      if (o) {
        return <Tag color="blue">已启用</Tag>;
      } else {
        return <Tag>未启用</Tag>;
      }
    },
  }, {
    title: '最后修改时间',
    dataIndex: 'last_updated_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '创建时间',
    dataIndex: 'created_date',
    width: 120,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: '库存备份',
    dataIndex: 'backup',
    width: 80,
    className: 'cell-align-center',
    render: () => <Button icon="download" />,
  }, {
    title: '库存导入',
    dataIndex: 'restore',
    width: 80,
    className: 'cell-align-center',
    render: () => <Button icon="upload" />,
  }, {
    title: '默认收货模式',
    dataIndex: 'receiving_mode',
    width: 120,
    className: 'cell-align-center',
    render: o => o ? `${WHSE_OPERATION_MODES[o].text}收货` : '',
  }, {
    title: '默认发货模式',
    dataIndex: 'shipping_mode',
    width: 120,
    className: 'cell-align-center',
    render: o => o ? `${WHSE_OPERATION_MODES[o].text}发货` : '',
  }, {
    title: '操作',
    width: 150,
    render: record => (
      <span>
        <RowUpdater onHit={this.handleOwnerControl} label="控制属性" row={record} />
        <span className="ant-divider" />
        {record.active === 0 ? <RowUpdater onHit={() => this.changeOwnerStatus(record.id, true)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeOwnerStatus(record.id, false)} label="停用" row={record} />}
        <span className="ant-divider" />
        <Dropdown overlay={(
          <Menu>
            <Menu.Item key="empty">
              <a role="presentation" onClick={() => this.handleEmptyData(record)}><Icon type="delete" /> 清空数据</a>
            </Menu.Item>
          </Menu>)}
        >
          <a><Icon type="down" /></a>
        </Dropdown>
      </span>
    ),
  }]
  msg = formatMsg(this.props.intl)
  handleOwnerControl = (ownerAuth) => {
    this.props.showOwnerControlModal(ownerAuth);
  }
  changeOwnerStatus = (id, status) => {
    this.props.changeOwnerStatus(id, status).then((result) => {
      if (!result.error) {
        this.handleOwnerLoad();
      }
    });
  }
  handleOwnerLoad = () => {
    this.props.loadwhseOwners(this.props.whseCode, this.props.whseTenantId);
    if (this.props.whseCode === this.props.defaultWhse.code) {
      this.props.loadWhse(this.props.whseCode, this.props.tenantId);
    }
  }
  handleEmptyData = (record) => {
    confirm({
      title: '确定要清空数据吗?',
      content: `一旦你确定清空，所有与「${record.owner_name}」有关的入库、库存、出库数据将会被永久删除。这是一个不可恢复的操作，请谨慎对待！`,
      okText: '是',
      okType: 'danger',
      cancelText: '否',
      onOk() {
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  render() {
    const { whseCode, whseTenantId, whseOwners } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Button type="primary" ghost icon="plus-circle" onClick={() => this.props.showWhseOwnersModal()}>添加货主</Button>
        </div>
        <Table columns={this.columns} dataSource={whseOwners} rowKey="id" />
        <WhseOwnersModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
        <OwnerControlModal whseCode={whseCode} reload={this.handleOwnerLoad} />
      </div>
    );
  }
}
