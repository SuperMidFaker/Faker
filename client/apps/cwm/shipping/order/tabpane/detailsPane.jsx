import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import { intlShape, injectIntl } from 'react-intl';
import { showDetailModal, addTemporary, deleteTemporary, clearTemporary } from 'common/reducers/cwmReceive';
import { showAsnSelectModal } from 'common/reducers/cwmShippingOrder';
import { CWM_SO_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import AddDetailModal from '../modal/addDetailModal';
import AsnSelectModal from '../modal/asnSelectModal';
import messages from '../../message.i18n';
import SKUPopover from '../../../common/popover/skuPopover';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
    units: state.cwmSku.params.units,
    currencies: state.cwmSku.params.currencies,
  }),
  {
    showDetailModal, addTemporary, deleteTemporary, clearTemporary, showAsnSelectModal,
  }
)
export default class DetailsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldValue: PropTypes.func.isRequired }).isRequired,
    editable: PropTypes.bool,
    detailEnable: PropTypes.bool.isRequired,
    selectedOwner: PropTypes.number.isRequired,
  }
  state = {
    selectedRowKeys: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
      showSizeChanger: true,
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
  handleBatchDelete = () => {
    const { selectedRowKeys } = this.state;
    const { temporaryDetails } = this.props;
    const newTemporary = temporaryDetails.filter((temporary, index) =>
      selectedRowKeys.findIndex(key => key === index) === -1);
    this.props.clearTemporary();
    this.props.addTemporary(newTemporary);
    this.setState({
      selectedRowKeys: [],
    });
  }
  showAsnSelectModal = () => {
    this.props.showAsnSelectModal();
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  render() {
    const {
      editable, temporaryDetails, detailEnable, units, currencies, form,
    } = this.props;
    const { pagination } = this.state;
    const soType = form.getFieldValue('so_type');
    const bonded = form.getFieldValue('bonded');
    const regType = form.getFieldValue('reg_type');
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: '行号',
      dataIndex: 'so_seq_no',
      width: 50,
      fixed: 'left',
      align: 'center',
      render: (col, row, index) => col ||
      (pagination.pageSize * (pagination.current - 1)) + index + 1,
    }, {
      title: '商品货号',
      dataIndex: 'product_no',
      width: 200,
      fixed: 'left',
    }, {
      title: '中文品名',
      dataIndex: 'name',
      width: 250,
    }, {
      title: '订单数量',
      width: 100,
      dataIndex: 'order_qty',
      align: 'right',
    }, {
      title: '计量单位',
      dataIndex: 'unit',
      align: 'center',
      width: 100,
      render: (o) => {
        const unit = units.find(item => item.code === o);
        if (unit) return unit.name;
        return '';
      },
    }, {
      title: '库别',
      dataIndex: 'virtual_whse',
      width: 150,
    }, {
      title: 'SKU',
      dataIndex: 'product_sku',
      width: 150,
      render: o => (o ? (<SKUPopover ownerPartnerId={this.props.selectedOwner} sku={o} />) : <span style={{ color: 'red' }}>请设置sku</span>),
    }, {
      title: '入库单号',
      dataIndex: 'asn_cust_order_no',
      width: 150,
    }, {
      title: '批次号',
      dataIndex: 'external_lot_no',
      width: 150,
    }, {
      title: '供货商',
      dataIndex: 'supplier',
      width: 120,
    }, {
      title: '单价',
      dataIndex: 'unit_price',
      width: 100,
      align: 'right',
    }, {
      title: '总价',
      dataIndex: 'amount',
      width: 100,
      align: 'right',
    }, {
      title: '币制',
      width: 100,
      dataIndex: 'currency',
      render: (o) => {
        const currency = currencies.find(curr => Number(curr.code) === Number(o));
        if (currency) {
          return <span>{currency.name}</span>;
        }
        return o;
      },
    }, {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (o, record) => (
        <span>
          <RowAction onClick={this.handleEdit} icon="edit" row={record} />
          <RowAction confirm="确定删除?" onConfirm={() => this.handleDelete(record.index)} icon="delete" row={record} />
        </span>
      ),
    }];
    let detailAddDisabled = !editable;
    if (!detailAddDisabled) {
      detailAddDisabled = !detailEnable || soType === CWM_SO_TYPES[2].value;
    }
    let crossAsnDisabled = !editable;
    if (!crossAsnDisabled) {
      crossAsnDisabled = !detailEnable ||
        ((soType !== CWM_SO_TYPES[2].value) && (soType !== CWM_SO_TYPES[3].value));
    }
    return (
      <DataPane
        columns={columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={temporaryDetails.map((item, index) => ({ ...item, index }))}
        rowKey="index"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          <Button type="primary" icon="plus-circle-o" disabled={detailAddDisabled} onClick={this.showDetailModal}>添加</Button>
          <Button icon="upload" disabled={detailAddDisabled}>导入</Button>
          <Button disabled={crossAsnDisabled} onClick={this.showAsnSelectModal}>选择ASN</Button>
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            onDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
        <AddDetailModal
          product={this.state.editRecord}
          edit={this.state.edit}
          selectedOwner={this.props.selectedOwner}
        />
        <AsnSelectModal bonded={bonded} regType={regType} ownerPartnerId={form.getFieldValue('owner_partner_id')} soType={soType} />
      </DataPane>
    );
  }
}
