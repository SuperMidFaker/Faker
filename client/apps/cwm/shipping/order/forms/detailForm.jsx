/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Table } from 'antd';
import RowUpdater from 'client/components/rowUpdater';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
import { showDetailModal, addTemporary, deleteTemporary } from 'common/reducers/cwmReceive';
import AddDetailModal from '../../../common/modal/addDetailModal';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
  }),
  { showDetailModal, addTemporary, deleteTemporary }
)
export default class DetailForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    detailEnable: PropTypes.bool.isRequired,
  }
  state = {
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
      onChange: this.handlePageChange,
    },
    editRecord: {},
    edit: false,
  };
  componentWillReceiveProps(nextProps) {
    const { soBody } = nextProps;
    if (soBody && (nextProps.soBody !== this.props.soBody)) {
      this.props.addTemporary(soBody);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handlePageChange = (current) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
      },
    });
  }
  showDetailModal = () => {
    this.setState({
      edit: false,
    });
    this.props.showDetailModal();
  }
  handleDelete = (index) => {
    this.props.deleteTemporary(index);
  }
  handleEdit = (row) => {
    this.setState({
      editRecord: row,
      edit: true,
    });
    this.props.showDetailModal();
  }
  render() {
    const { editable, temporaryDetails, detailEnable } = this.props;
    const { pagination } = this.state;
    const columns = [{
      title: '行号',
      dataIndex: 'so_seq_no',
      width: 50,
    }, {
      title: '商品货号',
      dataIndex: 'product_no',
      width: 200,
    }, {
      title: '中文品名',
      dataIndex: 'name',
      width: 200,
    }, {
      title: '订单数量',
      width: 100,
      dataIndex: 'order_qty',
    }, {
      title: '计量单位',
      dataIndex: 'unit_name',
    }, {
      title: '单价',
      dataIndex: 'unit_price',
    }, {
      title: '操作',
      render: (o, record, index) => (
        <span><RowUpdater onHit={this.handleEdit} label="修改" row={record} /><span className="ant-divider" /><RowUpdater onHit={() => this.handleDelete(index)} label="删除" row={record} /></span>
      ),
    }];
    return (
      <div>
        <div className="toolbar">
          {editable && <Button type="primary" disabled={detailEnable ? '' : 'disabled'} onClick={this.showDetailModal}>添加明细</Button>}
          {editable && <Button disabled={detailEnable ? '' : 'disabled'}>导入</Button>}
        </div>
        <Table columns={columns} dataSource={temporaryDetails.map((item, index) => ({ ...item, index }))} rowKey="index" pagination={pagination} />
        <AddDetailModal product={this.state.editRecord} edit={this.state.edit} selectedOwner={this.props.selectedOwner} />
      </div>
    );
  }
}
