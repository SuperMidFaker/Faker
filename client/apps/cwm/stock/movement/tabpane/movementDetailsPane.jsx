import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Input } from 'antd';
import { MdIcon } from 'client/components/FontIcon';
import DataPane from 'client/components/DataPane';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import SKUPopover from '../../../common/popover/skuPopover';
import TraceIdPopover from '../../../common/popover/traceIdPopover';
import RowUpdater from 'client/components/rowUpdater';
import { loadMovementDetails, executeMovement, loadMovementHead, removeMoveDetail, cancelMovement, updateMovementDetail } from 'common/reducers/cwmMovement';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    username: state.account.username,
    movementHead: state.cwmMovement.movementHead,
    movementDetails: state.cwmMovement.movementDetails,
    reload: state.cwmMovement.movementReload,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadMovementDetails, executeMovement, loadMovementHead, removeMoveDetail, cancelMovement, updateMovementDetail }
)
@connectNav({
  depth: 3,
  moduleName: 'cwm',
})
export default class MovementDetailsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    movementNo: PropTypes.string.isRequired,
    movementHead: PropTypes.object.isRequired,
    updateMovementDetail: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    selectedRows: [],
    confirmDisabled: true,
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
    this.props.loadMovementDetails(this.props.movementNo);
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleBatchDetailRemove = () => {
    const { username, movementNo } = this.props;
    if (this.props.movementDetails.length === this.state.selectedRowKeys.length) {
      this.props.cancelMovement(movementNo, username).then((result) => {
        if (!result.err) {
          this.context.router.push('/cwm/stock/movement');
        }
      });
    } else {
      this.props.removeMoveDetail(movementNo, this.state.selectedRowKeys, username).then((result) => {
        if (!result.err) {
          this.props.loadMovementDetails(this.props.movementNo);
        }
      });
    }
  }
  removeMoveDetail = (row) => {
    const { username, movementNo } = this.props;
    if (this.props.movementDetails.length === 1) {
      this.props.cancelMovement(movementNo, username).then((result) => {
        if (!result.err) {
          this.context.router.push('/cwm/stock/movement');
        }
      });
    } else {
      this.props.removeMoveDetail(movementNo, [row.to_trace_id], username).then((result) => {
        if (!result.err) {
          this.props.loadMovementDetails(this.props.movementNo);
        }
      });
    }
  }
  handleUpdateToLocation = (id, value) => {
    this.props.updateMovementDetail(id, { to_location: value }).then(() => {
      this.props.loadMovementDetails(this.props.movementNo);
    });
  }
  handleExecuteMovement = () => {
    const props = this.props;
    const toTraceIds = props.movementDetails.map(md => md.to_trace_id);
    Modal.confirm({
      title: '是否确认库存移动已完成?',
      onOk() {
        props.executeMovement(props.movementNo, toTraceIds,
          props.username, props.defaultWhse.code).then((result) => {
            if (!result.err) {
              props.loadMovementHead(props.movementNo);
            }
          });
      },
      onCancel() {},
      okText: '执行库存移动',
    });
  }
  columns = [{
    title: '行号',
    dataIndex: 'seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 150,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 150,
    render: o => (<SKUPopover sku={o} />),
  }, {
    title: '库存移动数量',
    width: 180,
    dataIndex: 'move_qty',
    className: 'cell-align-right',
  }, {
    title: '来源追踪ID',
    dataIndex: 'from_trace_id',
    width: 180,
    render: o => o && <TraceIdPopover traceId={o} />,
  }, {
    title: '来源库位',
    dataIndex: 'from_location',
    width: 180,
  }, {
    title: '目的追踪ID',
    dataIndex: 'to_trace_id',
    width: 180,
    render: o => o && <TraceIdPopover traceId={o} />,
  }, {
    title: '目的库位',
    dataIndex: 'to_location',
    width: 180,
    render: (o, row) => {
      if (this.props.movementHead.isdone) {
        return o;
      } else {
        return <Input defaultValue={o} onBlur={e => this.handleUpdateToLocation(row.id, e.target.value)} />;
      }
    },
  }, {
    title: '操作',
    width: 80,
    render: (o, record) => !record.isdone && <RowUpdater onClick={this.removeMoveDetail} label="取消明细" row={record} />,
  }]
  render() {
    const { movementDetails, mode, movementHead } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    return (
      <DataPane fullscreen={this.props.fullscreen}
        columns={this.columns} rowSelection={rowSelection} indentSize={0}
        dataSource={movementDetails} rowKey="to_trace_id" loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <DataPane.BulkActions selectedRowKeys={this.state.selectedRowKeys} handleDeselectRows={this.handleDeselectRows}>
            {this.state.selectedRowKeys.length > 0 && (<Button onClick={this.handleBatchDetailRemove}>
              <MdIcon type="check-all" />批量移除明细
            </Button>)}
          </DataPane.BulkActions>
          <DataPane.Actions>
            {mode === 'manual' && movementHead.isdone === 0 &&
            <Button icon="check" onClick={this.handleExecuteMovement}>
              执行库存移动
            </Button>
            }
          </DataPane.Actions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
