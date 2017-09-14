import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Table, Input, Tag, Tooltip } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from 'client/components/rowUpdater';
import SKUPopover from '../../../common/popover/skuPopover';
import ReceivingModal from '../modal/receivingModal';
import BatchReceivingModal from '../modal/batchReceivingModal';
import { createFilename } from 'client/util/dataTransform';
import ExcelUploader from 'client/components/ExcelUploader';
import { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive } from 'common/reducers/cwmReceive';
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
  { openReceiveModal, loadInboundProductDetails, showBatchReceivingModal, expressReceive }
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
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
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
    width: 200,
    fixed: 'left',
    render: o => (<SKUPopover ownerPartnerId={this.props.inboundHead.owner_partner_id} sku={o} />),
  }, {
    title: '品名',
    dataIndex: 'name',
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
    width: 160,
  }, {
    title: '集装箱号',
    dataIndex: 'container_no',
    width: 160,
  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 160,
  }, {
    title: '预期数量',
    width: 100,
    dataIndex: 'expect_qty',
    className: 'cell-align-right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '收货数量',
    width: 100,
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
/*  }, {
    title: '收货库位',
    dataIndex: 'location',
    width: 300,
    render: (o, record) => {
      const Options = this.props.locations.map(location => (<Option key={location.id} value={location.location}>{location.location}</Option>));
      if (record.location.length <= 1) {
        return (
          <Select size="small" className="readonly" value={o[0]} style={{ width: 280 }} disabled>
            {Options}
          </Select>);
      } else {
        return (
          <Select size="small" className="readonly" mode="tags" value={o} style={{ width: 280 }} disabled>
            {Options}
          </Select>);
      }
    }, */
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
    this.handleReload();
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
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            {inboundHead.rec_mode === 'manual' &&
            <Button onClick={this.handleBatchProductReceive}>
              批量收货确认
            </Button>
            }
            <div className="pull-right">
              <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
            </div>
          </div>
          <div className="toolbar-right">
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
            </Tooltip>
            }
            {/* inboundHead.rec_mode === 'manual' && inboundHead.status === CWM_INBOUND_STATUS.CREATED.value &&
            <Button icon="check" onClick={this.handleExpressReceived}>
              快捷收货
            </Button>
            */}
          </div>
        </div>
        <Table size="middle" columns={this.columns} rowSelection={rowSelection} dataSource={dataSource} rowKey="id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
          loading={this.state.loading}
        />
        <ReceivingModal />
        <BatchReceivingModal inboundNo={this.props.inboundNo} data={this.state.selectedRows} />
      </div>
    );
  }
}
