import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Modal, Button, Tag, Dropdown, Icon, Menu } from 'antd';
import moment from 'moment';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import { createFilename } from 'client/util/dataTransform';
import EditableCell from 'client/components/EditableCell';
import ImportDataPanel from 'client/components/ImportDataPanel';
import { openReceiveModal, viewSuBarcodeScanModal, updateInbProductVol, loadInboundProductDetails, showBatchReceivingModal, expressReceive, markReloadInbound } from 'common/reducers/cwmReceive';
import { CWM_INBOUND_STATUS, CWM_DAMAGE_LEVEL, SKU_REQUIRED_PROPS } from 'common/constants';
import SKUPopover from '../../../common/popover/skuPopover';
import ReceivingModal from '../modal/receivingModal';
import BatchReceivingModal from '../modal/batchReceivingModal';
import SuBarcodeScanModal from '../modal/suBarcodeScanModal';
import { formatMsg } from '../../message.i18n';

function calcProductSortScore(inboundPrd) {
  if (inboundPrd.received_qty > 0) {
    if (inboundPrd.received_qty !== inboundPrd.expect_qty) {
      return 3;
    }
    return 1;
  }
  return 2;
}

const SKU_PROPS_MAP = {};
SKU_REQUIRED_PROPS.forEach((amf) => { SKU_PROPS_MAP[amf.value] = amf.label; });

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    locations: state.cwmWarehouse.locations,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
    reload: state.cwmReceive.inboundReload,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  {
    openReceiveModal,
    viewSuBarcodeScanModal,
    updateInbProductVol,
    loadInboundProductDetails,
    showBatchReceivingModal,
    expressReceive,
    markReloadInbound,
  }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class ReceiveDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.shape({
      owner_partner_id: PropTypes.number,
      rec_mode: PropTypes.oneOf(['scan', 'manual']),
    }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    searchValue: '',
    loading: false,
    importPanelVisible: false,
  }
  componentWillMount() {
    this.handleReload();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleReload();
    }
  }
  msg =formatMsg(this.props.intl)
  handleReload = () => {
    this.setState({ loading: true });
    this.props.loadInboundProductDetails(this.props.inboundNo).then(() => {
      this.setState({ loading: false });
    });
    this.setState({
      selectedRowKeys: [],
    });
  }

  handleBatchProductReceive = () => {
    this.props.showBatchReceivingModal();
  }
  handleExpressReceived = () => {
    const self = this;
    Modal.confirm({
      title: '是否确认收货完成?',
      content: '默认按预期数量收货，确认收货后可以取消收货退回',
      onOk() {
        return self.props.expressReceive(
          self.props.inboundNo,
          self.props.loginId, self.props.username, new Date()
        );
      },
      onCancel() {},
      okText: '确认收货',
    });
  }
  handleManualReceive = (record) => {
    this.props.openReceiveModal({
      editable: true,
      inboundNo: this.props.inboundNo,
      inboundProduct: record,
    });
  }
  handleReceiveDetails = (record) => {
    this.props.openReceiveModal({
      editable: false,
      inboundNo: this.props.inboundNo,
      inboundProduct: record,
    });
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleUploadPutaway = () => {
    this.setState({ importPanelVisible: false });
    this.props.markReloadInbound();
  }
  handlePrdtVolChange = (inbPrdId, vol) => {
    this.props.updateInbProductVol(inbPrdId, vol);
  }
  handleSuBarcodeScanReceive = () => {
    this.props.viewSuBarcodeScanModal({
      visible: true,
      inboundNo: this.props.inboundNo,
    });
  }
  handleMoreMenuClick = (e) => {
    if (e.key === 'import') {
      this.setState({
        importPanelVisible: true,
      });
    } else {
      window.open(`${API_ROOTS.default}v1/cwm/export/receiving/details/${createFilename('receiving')}.xlsx?inboundNo=${this.props.inboundNo}`);
    }
  }
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 50,
    fixed: 'left',
    align: 'center',
  }, {
    title: '货品',
    dataIndex: 'product_sku',
    width: 220,
    fixed: 'left',
    render: o => (<SKUPopover ownerPartnerId={this.props.inboundHead.owner_partner_id} sku={o} />),
  }, {
    title: '品名',
    width: 150,
    dataIndex: 'name',
  }, {
    title: '类别',
    width: 100,
    dataIndex: 'category',
  }, {
    title: '预期数量',
    width: 100,
    dataIndex: 'expect_qty',
    align: 'right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '收货数量',
    width: 100,
    dataIndex: 'received_qty',
    width: 120,
    align: 'right',
    render: (o, record) => {
      if (record.received_qty === record.expect_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.received_qty < record.expect_qty) {
        return (<span className="text-warning">{o}</span>);
      } else if (record.received_qty > record.expect_qty) {
        return (<span className="text-error">{o}</span>);
      }
      return null;
    },
  }, {
    title: '立方数',
    width: 130,
    dataIndex: 'received_vol',
    render: (vol, record) =>
      (<EditableCell
        size="small"
        editable={record.received_qty > 0}
        value={vol}
        onSave={value => this.handlePrdtVolChange(record.id, Number(value))}
        style={{ width: '100%' }}
      />),
  }, {
    title: '包装情况',
    dataIndex: 'damage_level',
    width: 120,
    align: 'center',
    render: dl => (dl || dl === 0) && <Tag color={CWM_DAMAGE_LEVEL[dl].color}>
      {CWM_DAMAGE_LEVEL[dl].text}</Tag>,
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
    width: 150,
  }, {
    title: '集装箱号',
    dataIndex: 'container_no',
    width: 100,
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 100,
  }, {
    title: '收货人员',
    width: 150,
    dataIndex: 'received_by',
    render: o => (o ? o.join(',') : ''),
  }, {
    title: '收货时间',
    width: 100,
    dataIndex: 'received_date',
    render: col => col && moment(col).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    width: 100,
    fixed: 'right',
    render: (o, record) => {
      if (this.props.inboundHead.rec_mode === 'scan' ||
        record.sku_incomplete ||
        this.props.inboundHead.status === CWM_INBOUND_STATUS.COMPLETED.value ||
        record.received_qty >= record.expect_qty) {
        return (<RowAction onClick={this.handleReceiveDetails} icon="eye-o" label="收货记录" row={record} />);
      }
      return (<RowAction onClick={this.handleManualReceive} icon="check-circle-o" label="收货确认" row={record} />);
    },
  }]
  render() {
    const { inboundHead, inboundProducts } = this.props;
    const dataSource = inboundProducts.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      }
      return true;
    }).sort((ia, ib) => {
      const iaScore = calcProductSortScore(ia);
      const ibScore = calcProductSortScore(ib);
      if (iaScore === ibScore) {
        return ia.asn_seq_no - ib.asn_seq_no;
      }
      return -(iaScore - ibScore);
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
      selections: [{
        key: 'all-data',
        text: '选择全部项',
        onSelect: () => {
          const fDataSource = dataSource.filter(item => !(item.trace_id.length >= 1));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,
            selectedRows: fDataSource,
          });
        },
      }, {
        key: 'opposite-data',
        text: '反选全部项',
        onSelect: () => {
          const fDataSource = dataSource.filter(item => !(item.trace_id.length >= 1) &&
            !this.state.selectedRowKeys.find(item1 => item1 === item.id));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,
            selectedRows: fDataSource,
          });
        },
      }],
      getCheckboxProps: record => ({
        disabled: record.trace_id.length >= 1 || record.sku_incomplete,
      }),
    };
    let alertMsg;
    const unRecvablePrds = [];
    inboundProducts.forEach((inbP) => {
      if (inbP.sku_incomplete && unRecvablePrds.indexOf(inbP.product_no) === -1) {
        unRecvablePrds.push(inbP.product_no);
      }
    });
    if (unRecvablePrds.length > 0) {
      let prdnos = `${unRecvablePrds.join(',')}`;
      if (prdnos.length > 130) {
        prdnos = `${prdnos.slice(0, 130)}...`;
      }
      const props = inboundHead.sku_rule.required_props.map(rp => SKU_PROPS_MAP[rp]).join('/');
      alertMsg = <div>以下货号属性({props})需要补充完整:<br />{prdnos}</div>;
    }
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        <Menu.Item key="export"><Icon type="download" /> 导出</Menu.Item>
        <Menu.Item key="import"><Icon type="upload" /> 导入</Menu.Item>
      </Menu>
    );
    return (
      <DataPane
        columns={this.columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={dataSource}
        rowKey="id"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder="货号/SKU" onSearch={this.handleSearch} />
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            {inboundHead.rec_mode === 'manual' &&
            <Button onClick={this.handleBatchProductReceive}>
            批量收货确认
            </Button>}
          </DataPane.BulkActions>
          <DataPane.Actions>
            {inboundHead.rec_mode === 'manual' && inboundHead.su_setting.enabled &&
                unRecvablePrds.length === 0 &&
                <Button onClick={this.handleSuBarcodeScanReceive}>
            条码收货确认
                </Button>}
            {inboundHead.rec_mode === 'manual' && inboundHead.status === CWM_INBOUND_STATUS.CREATED.value &&
              <Dropdown overlay={moreMenu}>
                <Button>收货导入</Button>
              </Dropdown>}
            <ImportDataPanel
              adaptors={null}
              title="收货确认导入"
              visible={this.state.importPanelVisible}
              endpoint={`${API_ROOTS.default}v1/cwm/receiving/details/import`}
              formData={{
              loginId: this.props.loginId,
              loginName: this.props.username,
              inboundNo: this.props.inboundNo,
              whseCode: this.props.defaultWhse.code,
            }}
              onClose={() => { this.setState({ importPanelVisible: false }); }}
              onUploaded={this.handleUploadPutaway}
            />
          </DataPane.Actions>
          {alertMsg && <Alert message={alertMsg} type="warning" showIcon />}
        </DataPane.Toolbar>
        <ReceivingModal />
        <BatchReceivingModal inboundNo={this.props.inboundNo} data={this.state.selectedRows} />
        <SuBarcodeScanModal />
      </DataPane>
    );
  }
}
