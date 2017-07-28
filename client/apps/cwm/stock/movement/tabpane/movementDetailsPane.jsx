import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Button, Table, Tag, Input } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { intlShape, injectIntl } from 'react-intl';
import PackagePopover from '../../../common/popover/packagePopover';
import { loadMovementDetails, executeMovement, loadMovementHead } from 'common/reducers/cwmInventoryStock';

const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    locations: state.cwmWarehouse.locations,
    movementHead: state.cwmInventoryStock.movementHead,
    movementDetails: state.cwmInventoryStock.movementDetails,
    reload: state.cwmInventoryStock.movementReload,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadMovementDetails, executeMovement, loadMovementHead }
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
  handleBatchProductReceive = () => {
    this.props.showBatchReceivingModal();
  }
  handleExecuteMovement = () => {
    const self = this;
    Modal.confirm({
      title: '是否确认移库已完成?',
      onOk() {
        self.props.executeMovement(self.props.movementNo, self.props.movementDetails, self.props.loginId,
          self.props.defaultWhse.code).then((result) => {
            if (!result.err) {
              self.props.loadMovementHead(self.props.movementNo);
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
  }]
  render() {
    const { movementDetails, mode } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
      },
    };
    return (
      <div>
        <div className="toolbar">
          <Search placeholder="货号/SKU" style={{ width: 200 }} onSearch={this.handleSearch} />
          <div className={`bulk-actions ${this.state.selectedRowKeys.length === 0 ? 'hide' : ''}`}>
            <h3>已选中{this.state.selectedRowKeys.length}项</h3>
          </div>
          <div className="toolbar-right">
            {mode === 'manual' &&
            <Button size="large" icon="check" onClick={this.handleExecuteMovement}>
              执行移库
            </Button>
            }
          </div>
        </div>
        <Table columns={this.columns} rowSelection={rowSelection} dataSource={movementDetails} rowKey="asn_seq_no"
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
        />
      </div>
    );
  }
}
