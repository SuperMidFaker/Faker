import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Tag, Button, Modal, Input, message } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import SKUPopover from '../../../common/popover/skuPopover';
import TraceIdPopover from '../../../common/popover/traceIdPopover';
import { loadInboundPutaways, showPuttingAwayModal, undoReceives, expressPutaways } from 'common/reducers/cwmReceive';
import PuttingAwayModal from '../modal/puttingAwayModal';

const Search = Input.Search;

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
  }),
  {
    loadInboundPutaways, showPuttingAwayModal, undoReceives, expressPutaways,
  }
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
    width: 150,
    fixed: 'right',
    render: (o, record) => {
      if (!record.result) { // 上架明细的状态 0 未上架 1 已上架
        return (<span>
          <RowAction onClick={this.handlePutAway} icon="check-circle-o" label="上架确认" row={record} />
          <RowAction onClick={this.handleUndoReceive} icon="close-circle-o" tooltip="取消收货" row={record} />
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
    this.props.undoReceives(this.props.inboundNo, this.props.loginId, this.state.selectedRows.map(sr => sr.trace_id)).then((result) => {
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
            selectedRowKeys,
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
            selectedRowKeys,
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
      <DataPane fullscreen={this.props.fullscreen}
        columns={columns} rowSelection={rowSelection} indentSize={0}
        dataSource={dataSource} rowKey="id" loading={this.props.loading}
      >
        <DataPane.Toolbar>
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            <Button onClick={this.handleBatchPutAways} icon="check">
          批量上架确认
            </Button>
            <Button loading={submitting} onClick={this.handleBatchUndoReceives} icon="rollback">
          批量取消收货
            </Button>
          </DataPane.BulkActions>
          <DataPane.Actions>
            {inboundHead.rec_mode === 'manual' &&
              dataSource.filter(ds => ds.receive_location && ds.result === 0).length > 0 &&
              <Button loading={submitting} type="primary" ghost icon="check" onClick={this.handleExpressPutAway}>
              快捷上架
              </Button>
            }
          </DataPane.Actions>
        </DataPane.Toolbar>
        <PuttingAwayModal inboundNo={this.props.inboundNo} />
      </DataPane>
    );
  }
}
