import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Tag, Button, Modal, message, Dropdown, Icon, Menu } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SearchBox from 'client/components/SearchBox';
import ImportDataPanel from 'client/components/ImportDataPanel';
import { createFilename } from 'client/util/dataTransform';
import { loadInboundPutaways, showPuttingAwayModal, undoReceives, expressPutaways, viewSuBarPutawayModal } from 'common/reducers/cwmReceive';
import SKUPopover from '../../../common/popover/skuPopover';
import TraceIdPopover from '../../../common/popover/traceIdPopover';
import PuttingAwayModal from '../modal/puttingAwayModal';
import SuBarPutawayModal from '../modal/suBarPutawayModal';
import { formatMsg } from '../../message.i18n';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundPutaways: state.cwmReceive.inboundPutaways.list,
    loading: state.cwmReceive.inboundPutaways.loading,
    reload: state.cwmReceive.inboundReload,
    submitting: state.cwmReceive.submitting,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  {
    loadInboundPutaways, showPuttingAwayModal, undoReceives, expressPutaways, viewSuBarPutawayModal,
  }
)
export default class PutawayDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.shape({ owner_partner_id: PropTypes.number }).isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    searchValue: '',
    importPanelVisible: false,
  }
  componentWillMount() {
    this.handleLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleLoad();
      this.setState({ selectedRowKeys: [], selectedRows: [] });
    }
  }
  msg =formatMsg(this.props.intl)
  handleLoad = () => {
    this.props.loadInboundPutaways(this.props.inboundNo);
  }
  columns = [{
    title: '序号',
    dataIndex: 'seqno',
    width: 50,
    fixed: 'left',
  }, {
    title: '容器编号',
    dataIndex: 'convey_no',
    width: 150,
    fixed: 'left',
  }, {
    title: '追踪ID',
    dataIndex: 'trace_id',
    width: 180,
    render: o => o && <TraceIdPopover traceId={o} />,
  }, {
    title: '货品',
    dataIndex: 'product_sku',
    width: 220,
    render: o => (<SKUPopover ownerPartnerId={this.props.inboundHead.owner_partner_id} sku={o} />),
  }, {
    title: '收货数量',
    width: 100,
    dataIndex: 'inbound_qty',
    align: 'right',
    render: o => (<span className="text-emphasis">{o}</span>),
  }, {
    title: '收货库位',
    dataIndex: 'receive_location',
    width: 120,
    render: o => (o && <Tag>{o}</Tag>),
  }, {
    title: '上架库位',
    dataIndex: 'putaway_location',
    width: 120,
    render: o => (o && <Tag color="green">{o}</Tag>),
    /*  }, {
    title: '目标库位',
    dataIndex: 'target_location',
    width: 120, */
  }, {
    title: '中文品名',
    dataIndex: 'name',
  }, {
    title: '上架人员',
    width: 100,
    dataIndex: 'put_by',
  }, {
    title: '上架时间',
    width: 100,
    dataIndex: 'put_date',
    render: allocateDt => allocateDt && moment(allocateDt).format('MM.DD HH:mm'),
  }, {
    title: '操作',
    dataIndex: '_OPS_',
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (!record.result) { // 上架明细的状态 0 未上架 1 已上架
        return (<span>
          <RowAction onClick={this.handlePutAway} icon="check-circle-o" label="上架确认" row={record} />
          <RowAction onClick={this.handleUndoReceive} icon="close-circle-o" tooltip="取消收货" row={record} />
        </span>);
      }
      return null;
    },
  }]
  handleExpressPutAway = () => {
    const { props } = this;
    Modal.confirm({
      title: '是否确认上架完成?',
      content: '默认将收货库位设为最终储存库位，确认上架后不能操作取消收货',
      onOk() {
        return props.expressPutaways(props.loginId, props.loginName, props.inboundNo);
      },
      onCancel() {},
      okText: '确认上架',
    });
  }
  handlePutAway = (row) => {
    let details = [row];
    if (row.children && row.children.length > 0) {
      details = details.concat(row.children);
    }
    this.props.showPuttingAwayModal(details);
  }
  handleSuBarcodePutaway = () => {
    this.props.viewSuBarPutawayModal({
      visible: true,
      inboundNo: this.props.inboundNo,
    });
  }
  handleBatchPutAways = () => {
    this.props.showPuttingAwayModal(this.state.selectedRows);
  }
  handleUndoReceive = (row) => {
    this.props.undoReceives(
      this.props.inboundNo,
      this.props.loginId, [row.trace_id]
    ).then((result) => {
      if (!result.error) {
        message.success('操作成功');
      } else {
        message.error('操作失败');
      }
    });
  }
  handleBatchUndoReceives = () => {
    this.props.undoReceives(
      this.props.inboundNo, this.props.loginId,
      this.state.selectedRows.map(sr => sr.trace_id)
    ).then((result) => {
      if (!result.error) {
        message.success('操作成功');
      } else {
        message.error('操作失败');
      }
    });
  }
  handleSearch = (value) => {
    this.setState({ searchValue: value });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleMoreMenuClick = (e) => {
    if (e.key === 'import') {
      this.setState({
        importPanelVisible: true,
      });
    } else {
      window.open(`${API_ROOTS.default}v1/cwm/export/putaway/details/${createFilename('putaway')}.xlsx?inboundNo=${this.props.inboundNo}`);
    }
  }
  handleUploadPutaway = () => {
    this.setState({ importPanelVisible: false });
    this.handleLoad();
  }
  render() {
    const { inboundHead, inboundPutaways, submitting } = this.props;
    const dataSource = inboundPutaways.filter((item) => {
      if (this.state.searchValue) {
        const reg = new RegExp(this.state.searchValue);
        return reg.test(item.product_no) || reg.test(item.product_sku);
      }
      return true;
    }).map((ds, idx) => ({ ...ds, seqno: idx + 1 })).sort((pa, pb) => {
      if (pa.result === pb.result) {
        return pa.id - pb.id;
      }
      return pa.result - pb.result;
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
          const fDataSource = dataSource.filter(item => !(item.result === 1));
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
          const fDataSource = dataSource.filter(item => !(item.result === 1) &&
            !this.state.selectedRowKeys.find(item1 => item1 === item.id));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,
            selectedRows: fDataSource,
          });
        },
      }],
      getCheckboxProps: record => ({
        disabled: record.result === 1,
      }),
    };
    let { columns } = this;
    if (inboundHead.rec_mode === 'scan') {
      columns = columns.filter(col => col.dataIndex !== '_OPS_');
    }
    const moreMenu = (
      <Menu onClick={this.handleMoreMenuClick}>
        <Menu.Item key="export"><Icon type="download" /> 导出</Menu.Item>
        <Menu.Item key="import"><Icon type="upload" /> 导入</Menu.Item>
      </Menu>
    );
    return (
      <DataPane
        columns={columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={dataSource}
        rowKey="id"
        loading={this.props.loading}
      >
        <DataPane.Toolbar>
          <SearchBox placeholder="货号/SKU" onSearch={this.handleSearch} />
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleBatchPutAways} icon="check">
          批量上架确认
            </Button>
            <Button loading={submitting} onClick={this.handleBatchUndoReceives} icon="rollback">
          批量取消收货
            </Button>
          </DataPane.BulkActions>
          <DataPane.Actions>
            {inboundHead.rec_mode === 'manual' && inboundHead.su_setting.enabled &&
              dataSource.filter(ds => ds.serial_no && ds.result === 0).length > 0 &&
              <Button onClick={this.handleSuBarcodePutaway}>
              条码上架
              </Button>
            }
            {inboundHead.rec_mode === 'manual' &&
              dataSource.filter(ds => ds.receive_location && ds.result === 0).length > 0 &&
              <Button loading={submitting} type="primary" ghost icon="check" onClick={this.handleExpressPutAway}>
              快捷上架
              </Button>
            }
            {inboundHead.rec_mode === 'manual' && dataSource.filter(ds => ds.result === 0).length > 0 &&
              <Dropdown overlay={moreMenu}>
                <Button>上架导入</Button>
              </Dropdown>}
            <ImportDataPanel
              adaptors={null}
              title="上架导入"
              visible={this.state.importPanelVisible}
              endpoint={`${API_ROOTS.default}v1/cwm/putaway/details/import`}
              formData={{
                inboundNo: this.props.inboundNo,
                whseCode: this.props.defaultWhse.code,
                loginName: this.props.loginName,
              }}
              onClose={() => { this.setState({ importPanelVisible: false }); }}
              onUploaded={this.handleUploadPutaway}
            />
          </DataPane.Actions>
        </DataPane.Toolbar>
        <PuttingAwayModal inboundNo={this.props.inboundNo} />
        <SuBarPutawayModal />
      </DataPane>
    );
  }
}
