import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Table, Tag, Input } from 'antd';
import { MdIcon } from 'client/components/FontIcon';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PackagePopover from '../../../common/popover/packagePopover';
import RowUpdater from 'client/components/rowUpdater';
import { loadMovementDetails, executeMovement, loadMovementHead, removeMoveDetail, cancelMovement } from 'common/reducers/cwmMovement';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    movementHead: state.cwmMovement.movementHead,
    movementDetails: state.cwmMovement.movementDetails,
    reload: state.cwmMovement.movementReload,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadMovementDetails, executeMovement, loadMovementHead, removeMoveDetail, cancelMovement }
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
    this.props.loadMovementDetails(this.props.movementNo);
    this.setState({
      selectedRowKeys: [],
    });
  }
  handleBatchDetailRemove = () => {
    const { username, tenantId, movementNo } = this.props;
    if (this.props.movementDetails.length === this.state.selectedRowKeys.length) {
      this.props.cancelMovement(movementNo, username, tenantId).then((result) => {
        if (!result.err) {
          this.context.router.push('/cwm/stock/movement');
        }
      });
    } else {
      this.props.removeMoveDetail(movementNo, this.state.selectedRowKeys, username, tenantId).then((result) => {
        if (!result.err) {
          this.props.loadMovementDetails(this.props.movementNo);
        }
      });
    }
  }
  removeMoveDetail = (row) => {
    const { username, tenantId, movementNo } = this.props;
    if (this.props.movementDetails.length === 1) {
      this.props.cancelMovement(movementNo, username, tenantId).then((result) => {
        if (!result.err) {
          this.context.router.push('/cwm/stock/movement');
        }
      });
    } else {
      this.props.removeMoveDetail(movementNo, [row.in_detail_id], username, tenantId).then((result) => {
        if (!result.err) {
          this.props.loadMovementDetails(this.props.movementNo);
        }
      });
    }
  }
  handleExecuteMovement = () => {
    const props = this.props;
    const inboundDetailIds = props.movementDetails.map(md => md.in_detail_id);
    Modal.confirm({
      title: '是否确认移库已完成?',
      onOk() {
        props.executeMovement(props.movementNo, inboundDetailIds, props.tenantId,
          props.username, props.defaultWhse.code).then((result) => {
            if (!result.err) {
              props.loadMovementHead(props.movementNo);
            }
          });
      },
      onCancel() {},
      okText: '执行移库',
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
    render: o => (<PackagePopover sku={o} />),
  }, {
    title: '移库数量',
    width: 180,
    dataIndex: 'move_qty',
    render: o => <Tag>{o}</Tag>,
  }, {
    title: '来源库位',
    dataIndex: 'from_location',
    width: 180,
  }, {
    title: '目的库位',
    dataIndex: 'to_location',
    width: 180,
  }, {
    title: '操作',
    width: 200,
    render: (o, record) => !record.isdone && <RowUpdater onHit={this.removeMoveDetail} label="取消明细" row={record} />,
  }]
  render() {
    const { movementDetails, mode, movementHead } = this.props;
    return (
      <div>
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
            {this.state.selectedRowKeys.length > 0 && (<Button size="large" onClick={this.handleBatchDetailRemove}>
              <MdIcon type="check-all" />批量移除明细
            </Button>)}
          </div>
          <div className="toolbar-right">
            {mode === 'manual' && movementHead.isdone === 0 &&
            <Button size="large" icon="check" onClick={this.handleExecuteMovement}>
              执行移库
            </Button>
            }
          </div>
        </div>
        <Table columns={this.columns} dataSource={movementDetails} rowKey="in_detail_id"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
        />
      </div>
    );
  }
}
