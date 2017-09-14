import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Tag, Table, Button, Modal, Input, message } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import SKUPopover from '../../../common/popover/skuPopover';
import TraceIdPopover from '../../../common/popover/traceIdPopover';
import { loadInboundPutaways, showPuttingAwayModal, undoReceives, expressPutaways } from 'common/reducers/cwmReceive';
import PuttingAwayModal from '../modal/puttingAwayModal';
import { CWM_INBOUND_STATUS } from 'common/constants';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    inboundHead: state.cwmReceive.inboundFormHead,
    inboundPutaways: state.cwmReceive.inboundPutaways.list,
    loading: state.cwmReceive.inboundPutaways.loading,
    reload: state.cwmReceive.inboundReload,
    submitting: state.cwmReceive.submitting,
  }),
  { loadInboundPutaways, showPuttingAwayModal, undoReceives, expressPutaways }
)
export default class PutawayDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    inboundNo: PropTypes.string.isRequired,
    inboundHead: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    searchValue: '',
  }
  componentWillMount() {
    this.handleLoad();
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 460,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleLoad();
      this.setState({ selectedRowKeys: [], selectedRows: [] });
    }
  }
  handleLoad = () => {
    this.props.loadInboundPutaways(this.props.inboundNo);
  }
  columns = [{
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
    width: 200,
    render: o => (<SKUPopover ownerPartnerId={this.props.inboundHead.owner_partner_id} sku={o} />),
  }, {
    title: '收货数量',
    width: 100,
    dataIndex: 'inbound_qty',
    className: 'cell-align-right',
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
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (!record.result) {  // 上架明细的状态 0 未上架 1 已上架
        return (<span>
          <RowUpdater onHit={this.handlePutAway} label="上架确认" row={record} />
          <span className="ant-divider" />
          <RowUpdater onHit={this.handleUndoReceive} label="取消收货" row={record} />
        </span>);
      }
    },
  }]
  handleExpressPutAway = () => {
    const props = this.props;
    Modal.confirm({
      title: '是否确认上架完成?',
      content: '默认将收货库位设为最终储存库位，确认上架后不能操作取消收货',
      onOk() {
        return props.expressPutaways(props.loginId, props.loginName, props.inboundNo, props.tenantId);
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
  handleBatchPutAways = () => {
    this.props.showPuttingAwayModal(this.state.selectedRows);
  }
  handleUndoReceive = (row) => {
    this.props.undoReceives(this.props.inboundNo, this.props.loginId, [row.trace_id]).then((result) => {
      if (!result.error) {
        message.success('操作成功');
      } else {
        message.error('操作失败');
      }
    });
  }
  handleBatchUndoReceives = () => {
    this.props.undoReceives(this.props.inboundNo, this.props.loginId, this.state.selectedRowKeys).then((result) => {
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
  render() {
    const { inboundHead, inboundPutaways, submitting } = this.props;
    const dataSource = inboundPutaways.filter((item) => {
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
          const fDataSource = dataSource.filter(item => !(item.result === 1));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,  // TODO
            selectedRows: fDataSource,
          });
        },
      }, {
        key: 'opposite-data',
        text: '反选全部项',
        onSelect: () => {
          const fDataSource = dataSource.filter(item => !(item.result === 1) && !this.state.selectedRowKeys.find(item1 => item1 === item.id));
          const selectedRowKeys = fDataSource.map(item => item.id);
          this.setState({
            selectedRowKeys,  // TODO
            selectedRows: fDataSource,
          });
        },
      }],
      getCheckboxProps: record => ({
        disabled: record.result === 1,
      }),
    };
    let columns = this.columns;
    if (inboundHead.rec_mode === 'scan') {
      columns = [...columns];
      columns.splice(9, 10);
    }

    return (
      <div className="table-panel table-fixed-layout">
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            <Button onClick={this.handleBatchPutAways} icon="check">
              批量上架确认
            </Button>
            <Button loading={submitting} onClick={this.handleBatchUndoReceives} icon="rollback">
              批量取消收货
            </Button>
            <div className="pull-right">
              <Button type="primary" ghost shape="circle" icon="close" onClick={this.handleDeselectRows} />
            </div>
          </div>
          <div className="toolbar-right">
            {inboundHead.rec_mode === 'manual' && inboundHead.status < CWM_INBOUND_STATUS.PARTIAL_PUTAWAY.value &&
              dataSource.filter(ds => !ds.receive_location).length === 0 &&
              <Button loading={submitting} type="primary" ghost icon="check" onClick={this.handleExpressPutAway}>
              快捷上架
            </Button>
            }
          </div>
        </div>
        <Table size="middle" columns={columns} rowSelection={rowSelection} indentSize={0}
          dataSource={dataSource} rowKey="id"
          scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 240), 0), y: this.state.scrollY }}
          loading={this.props.loading}
        />
        <PuttingAwayModal inboundNo={this.props.inboundNo} />
      </div>
    );
  }
}
