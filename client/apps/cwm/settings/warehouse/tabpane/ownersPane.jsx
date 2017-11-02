import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Tag, Modal } from 'antd';
import { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, changeOwnerStatus } from 'common/reducers/cwmWarehouse';
import { clearTransition } from 'common/reducers/cwmTransition';
import { loadWhse } from 'common/reducers/cwmContext';
import RowUpdater from 'client/components/rowUpdater';
import DataPane from 'client/components/DataPane';
import ImportDataPanel from 'client/components/ImportDataPanel';
import WhseOwnersModal from '../modal/whseOwnersModal';
import OwnerControlModal from '../modal/ownerControlModal';
import { createFilename } from 'client/util/dataTransform';
import ExcelUploader from 'client/components/ExcelUploader';
import { WHSE_OPERATION_MODES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const confirm = Modal.confirm;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantName: state.account.tenantName,
    customsCode: state.account.customsCode,
    whseOwners: state.cwmWarehouse.whseOwners,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, changeOwnerStatus, loadWhse, clearTransition }
)
export default class OwnersPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    whseName: PropTypes.string.isRequired,
    whseTenantId: PropTypes.number.isRequired,
    whseOwners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      owner_code: PropTypes.string,
      owner_name: PropTypes.string.isRequired,
    })),
  }
  state = {
    selectedRowKeys: [],
    importPanelVisible: false,
    selectedOwner: {},
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode, this.props.whseTenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode || nextProps.warehouse.whse_mode !== this.props.warehouse.whse_mode) {
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
    width: 200,
  }, {
    title: '状态',
    dataIndex: 'active',
    width: 80,
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
    width: 80,
    render: (o) => {
      if (o) {
        return <Tag color="blue">已启用</Tag>;
      } else {
        return <Tag>未启用</Tag>;
      }
    },
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
    title: '库存初始化',
    dataIndex: 'init',
    width: 100,
    className: 'cell-align-center',
    render: (o, record) => <Button icon="upload" onClick={() => this.handleInitData(record)} />,
  }, {
    title: '数据备份',
    dataIndex: 'backup',
    width: 80,
    className: 'cell-align-center',
    render: (o, record) => <Button icon="cloud-download-o" onClick={() => this.handleBackupData(record)} />,
  }, {
    title: '数据清空',
    dataIndex: 'clear',
    width: 80,
    className: 'cell-align-center',
    render: (o, record) => <Button type="danger" icon="delete" onClick={() => this.handleEmptyData(record)} />,
  }, {
    title: '数据恢复',
    dataIndex: 'restore',
    width: 80,
    className: 'cell-align-center',
    render: () => (
      <ExcelUploader endpoint={`${API_ROOTS.default}v1/cwm/stock/restore`}>
        <Button icon="cloud-upload-o" />
      </ExcelUploader>
    ),
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
    title: '操作',
    width: 150,
    fixed: 'right',
    render: record => (
      <span>
        <RowUpdater onHit={this.handleOwnerControl} label="控制属性" row={record} />
        <span className="ant-divider" />
        {record.active === 0 ? <RowUpdater onHit={() => this.changeOwnerStatus(record.id, true)} label="启用" row={record} /> :
        <RowUpdater onHit={() => this.changeOwnerStatus(record.id, false)} label="停用" row={record} />}
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
      this.props.loadWhse(this.props.whseCode);
    }
  }
  handleInitData = (record) => {
    this.setState({
      seletedOwner: { id: record.owner_partner_id,
        partner_tenant_id: record.owner_tenant_id,
        name: record.owner_name,
        portion_enabled: record.portion_enabled,
        customs_code: record.customs_code,
      },
      importPanelVisible: true });
  }
  handleBackupData = (record) => {
    const { whseCode } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/stock/backup/${createFilename('backup')}.xlsx?whseCode=${whseCode}&ownerPartnerId=${record.owner_partner_id}`);
  };
  handleEmptyData = (record) => {
    const { whseCode } = this.props;
    const self = this;
    confirm({
      title: '确定要清空数据吗?',
      content: `一旦你确定清空，所有与「${record.owner_name}」有关的入库、库存、出库数据将会被永久删除。这是一个不可恢复的操作，请谨慎对待！`,
      okText: '是',
      okType: 'danger',
      cancelText: '否',
      onOk() {
        self.props.clearTransition(whseCode, record.owner_partner_id);
      },
    });
  };
  render() {
    const { warehouse, whseCode, whseName, whseTenantId, whseOwners } = this.props;
    return (
      <DataPane columns={this.columns} dataSource={whseOwners} rowKey="id">
        <DataPane.Toolbar>
          <Button disabled={warehouse.whse_mode === 'PRI'} type="primary" size="large"
            icon="plus-circle" onClick={() => this.props.showWhseOwnersModal()}
          >
            添加货主
          </Button>
        </DataPane.Toolbar>
        <WhseOwnersModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
        <OwnerControlModal whseCode={whseCode} reload={this.handleOwnerLoad} />
        <ImportDataPanel
          visible={this.state.importPanelVisible}
          endpoint={`${API_ROOTS.default}v1/cwm/receiving/import/asn/stocks`}
          formData={{
            data: JSON.stringify({
              tenantName: this.props.tenantName,
              customsCode: this.props.customsCode,
              loginId: this.props.loginId,
              loginName: this.props.loginName,
              whseCode,
              whseName,
              owner: this.state.seletedOwner,
            }),
          }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.handleReload}
          template={`${XLSX_CDN}/ASN库存导入模板_20170901.xlsx`}
        />
      </DataPane>
    );
  }
}
