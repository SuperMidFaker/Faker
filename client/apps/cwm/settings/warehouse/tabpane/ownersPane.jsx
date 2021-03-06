import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';
import { Button, Tag, Modal, message } from 'antd';
import { showWhseOwnersModal, loadwhseOwners, showOwnerControlModal, showSkuRuleModal, changeOwnerStatus } from 'common/reducers/cwmWarehouse';
import { showAllocRuleModal } from 'common/reducers/cwmAllocRule';
import { clearTransition } from 'common/reducers/cwmTransition';
import { loadWhse } from 'common/reducers/cwmContext';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import ImportDataPanel from 'client/components/ImportDataPanel';
import ExcelUploader from 'client/components/ExcelUploader';
import { createFilename } from 'client/util/dataTransform';
import { WHSE_OPERATION_MODES } from 'common/constants';
import WhseOwnersModal from '../modal/whseOwnersModal';
import OwnerControlModal from '../modal/ownerControlModal';
import AllocRuleModal from '../modal/allocationRuleModal';
import SkuRuleModal from '../modal/skuRuleModal';
import { formatMsg } from '../message.i18n';

const { confirm } = Modal;

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
  {
    showWhseOwnersModal,
    showAllocRuleModal,
    loadwhseOwners,
    showOwnerControlModal,
    showSkuRuleModal,
    changeOwnerStatus,
    loadWhse,
    clearTransition,
  }
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
    importPanelVisible: false,
  }
  componentWillMount() {
    this.props.loadwhseOwners(this.props.whseCode, this.props.whseTenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.whseCode !== this.props.whseCode ||
      nextProps.warehouse.whse_mode !== this.props.warehouse.whse_mode) {
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
      }
      return <Tag color="red">停用</Tag>;
    },
  }, {
    title: '启用分拨',
    dataIndex: 'portion_enabled',
    width: 80,
    render: (o) => {
      if (o) {
        return <Tag color="blue">已启用</Tag>;
      }
      return <Tag>未启用</Tag>;
    },
  }, {
    title: '默认收货模式',
    dataIndex: 'receiving_mode',
    width: 120,
    align: 'center',
    render: o => (o ? `${WHSE_OPERATION_MODES[o].text}收货` : ''),
  }, {
    title: '默认发货模式',
    dataIndex: 'shipping_mode',
    width: 120,
    align: 'center',
    render: o => (o ? `${WHSE_OPERATION_MODES[o].text}发货` : ''),
  }, {
    title: '配货规则',
    dataIndex: 'alloc_rule',
    width: 80,
    render: (arule, row) => <Button icon="setting" onClick={() => this.handleAllocRule(row)} />,
  }, {
    title: 'SKU规则',
    dataIndex: 'sku_rule',
    width: 80,
    render: (srule, row) => <Button icon="setting" onClick={() => this.handleSkuRule(row)} />,
  }, {
    title: '库存初始化',
    dataIndex: 'init',
    width: 100,
    align: 'center',
    render: (o, record) => <Button icon="upload" onClick={() => this.handleInitData(record)} />,
  }, {
    title: '数据备份',
    dataIndex: 'backup',
    width: 80,
    align: 'center',
    render: (o, record) => <Button icon="cloud-download-o" onClick={() => this.handleBackupData(record)} />,
  }, {
    title: '数据清空',
    dataIndex: 'clear',
    width: 80,
    align: 'center',
    render: (o, record) => <Button type="danger" icon="delete" onClick={() => this.handleEmptyData(record)} />,
  }, {
    title: '数据恢复',
    dataIndex: 'restore',
    width: 80,
    align: 'center',
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
        <RowAction onClick={this.handleOwnerControl} icon="tool" tooltip="控制属性" row={record} />
        {record.active === 0 ?
          <RowAction onClick={() => this.changeOwnerStatus(record.id, true)} icon="play-circle" tooltip="启用" row={record} /> :
          <RowAction onClick={() => this.changeOwnerStatus(record.id, false)} icon="pause-circle" tooltip="停用" row={record} />}
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
  handleAllocRule = (row) => {
    const rule = {
      id: row.id,
      alloc_rule: row.alloc_rule ? JSON.parse(row.alloc_rule) : [],
    };
    this.props.showAllocRuleModal({ visible: true, rule });
  }
  handleSkuRule = (row) => {
    const rule = {
      ownerAuthId: row.id,
      sku_rule: row.sku_rule ? JSON.parse(row.sku_rule) : { required_props: [] },
    };
    this.props.showSkuRuleModal({ visible: true, rule });
  }
  handleInitData = (record) => {
    this.setState({
      seletedOwner: {
        id: record.owner_partner_id,
        partner_tenant_id: record.owner_tenant_id,
        name: record.owner_name,
        portion_enabled: record.portion_enabled,
        customs_code: record.customs_code,
      },
      importPanelVisible: true,
    });
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
  handleStockUploaded = () => {
    this.setState({ importPanelVisible: false });
    message.success('库存初始化导入完成', 3);
  }
  render() {
    const {
      warehouse, whseCode, whseName, whseTenantId, whseOwners,
    } = this.props;
    return (
      <DataPane columns={this.columns} dataSource={whseOwners} rowKey="id">
        <DataPane.Toolbar>
          <Button
            disabled={warehouse.whse_mode === 'PRI'}
            type="primary"
            icon="plus-circle"
            onClick={() => this.props.showWhseOwnersModal()}
          >
            添加货主
          </Button>
        </DataPane.Toolbar>
        <WhseOwnersModal whseCode={whseCode} whseTenantId={whseTenantId} whseOwners={whseOwners} />
        <OwnerControlModal whseCode={whseCode} reload={this.handleOwnerLoad} />
        <AllocRuleModal reload={this.handleOwnerLoad} />
        <SkuRuleModal reload={this.handleOwnerLoad} />
        <ImportDataPanel
          visible={this.state.importPanelVisible}
          endpoint={`${API_ROOTS.default}v1/cwm/receiving/import/asn/stocks`}
          formData={{
            tenantName: this.props.tenantName,
            customsCode: this.props.customsCode,
            loginId: this.props.loginId,
            loginName: this.props.loginName,
            whseCode,
            whseName,
            owner: this.state.seletedOwner,
          }}
          onClose={() => { this.setState({ importPanelVisible: false }); }}
          onUploaded={this.handleStockUploaded}
          template={`${XLSX_CDN}/ASN库存导入模板201804.xlsx`}
        />
      </DataPane>
    );
  }
}
