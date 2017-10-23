import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Input, Tag, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from 'client/components/rowUpdater';
import DataPane from 'client/components/DataPane';
import SKUPopover from '../../../common/popover/skuPopover';
import ReceivingModal from '../modal/receivingModal';
import BatchReceivingModal from '../modal/batchReceivingModal';
import { createFilename } from 'client/util/dataTransform';
import ExcelUploader from 'client/components/ExcelUploader';
import { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive, markReloadInbound } from 'common/reducers/cwmReceive';
import { CWM_INBOUND_STATUS, CWM_DAMAGE_LEVEL } from 'common/constants';
import moment from 'moment';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    locations: state.cwmWarehouse.locations,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundProducts: state.cwmReceive.inboundProducts,
    reload: state.cwmReceive.inboundReload,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive, markReloadInbound }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class ReceiveDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    confirmDisabled: true,
    searchValue: '',
    loading: false,
  }
  componentWillMount() {
    this.handleReload();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleReload();
    }
  }
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
        return self.props.expressReceive(self.props.inboundNo, self.props.loginId, self.props.username, new Date());
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
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
    width: 50,
    fixed: 'left',
    className: 'cell-align-center',
  }, {
    title: '货品',
    dataIndex: 'product_sku',
    width: 150,
    fixed: 'left',
    render: o => (<SKUPopover ownerPartnerId={this.props.inboundHead.owner_partner_id} sku={o} />),
  }, {
    title: '品名',
    width: 150,
    dataIndex: 'name',
  }, {
    title: '客户订单号',
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
    title: '预期数量',
    width: 100,
    dataIndex: 'expect_qty',
    className: 'cell-align-right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '收货数量',
    dataIndex: 'received_qty',
    className: 'cell-align-right',
    render: (o, record) => {
      if (record.received_qty === record.expect_qty) {
        return (<span className="text-success">{o}</span>);
      } else if (record.received_qty < record.expect_qty) {
        return (<span className="text-warning">{o}</span>);
      } else if (record.received_qty > record.expect_qty) {
        return (<span className="text-error">{o}</span>);
      }
    },
  }, {
    title: '包装情况',
    dataIndex: 'damage_level',
    width: 120,
    className: 'cell-align-center',
    render: dl => (dl || dl === 0) && <Tag color={CWM_DAMAGE_LEVEL[dl].color}>{CWM_DAMAGE_LEVEL[dl].text}</Tag>,
  }, {
    title: '收货人员',
    width: 150,
    dataIndex: 'received_by',
    render: o => o ? o.join(',') : '',
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
        this.props.inboundHead.status === CWM_INBOUND_STATUS.COMPLETED.value ||
        record.received_qty >= record.expect_qty) {
        return (<RowUpdater onHit={this.handleReceiveDetails} label="收货记录" row={record} />);
      } else {
        return (<RowUpdater onHit={this.handleManualReceive} label="收货确认" row={record} />);
      }
    },
  }]
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleDownloadReceiving = () => {
    const { inboundNo } = this.props;
    window.open(`${API_ROOTS.default}v1/cwm/export/receiving/details/${createFilename('receiving')}.xlsx?inboundNo=${inboundNo}`);
  }
  handleUploadPutaway = () => {
    this.props.markReloadInbound();
  }
  render() {
    const { inboundHead, inboundProducts } = this.props;
    const dataSource = inboundProducts.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      } else {
        return true;
      }
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
          const fDataSource = dataSource.filter(item => !(item.trace_id.length >= 1) && !this.state.selectedRowKeys.find(item1 => item1 === item.id));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,
            selectedRows: fDataSource,
          });
        },
      }],
      getCheckboxProps: record => ({
        disabled: record.trace_id.length >= 1,
      }),
    };
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowSelection={rowSelection} indentSize={0}
        dataSource={dataSource} rowKey="id" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Search size="large" placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            {inboundHead.rec_mode === 'manual' &&
            <Button onClick={this.handleBatchProductReceive}>
            批量收货确认
          </Button>
          }
          </DataPane.BulkActions>
          <DataPane.Actions>
            {inboundHead.rec_mode === 'manual' && inboundHead.status === CWM_INBOUND_STATUS.CREATED.value &&
            <Tooltip title="导出收货明细" placement="bottom"><Button icon="download" onClick={this.handleDownloadReceiving}>导出</Button></Tooltip>
            }
            {inboundHead.rec_mode === 'manual' && inboundHead.status === CWM_INBOUND_STATUS.CREATED.value &&
            <Tooltip title="导入收货确认" placement="bottom">
              <ExcelUploader endpoint={`${API_ROOTS.default}v1/cwm/receiving/details/import`}
                formData={{
                  data: JSON.stringify({
                    loginId: this.props.loginId,
                    loginName: this.props.username,
                    receiveDate: new Date(),
                    inboundNo: this.props.inboundNo,
                    whseCode: this.props.defaultWhse.code,
                  }),
                }} onUploaded={this.handleUploadPutaway}
              >
                <Button icon="upload">导入</Button>
              </ExcelUploader>
            </Tooltip>}
          </DataPane.Actions>
        </DataPane.Toolbar>
        <ReceivingModal />
        <BatchReceivingModal inboundNo={this.props.inboundNo} data={this.state.selectedRows} />
      </DataPane>
    );
  }
}
