import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import { intlShape, injectIntl } from 'react-intl';
import { showDetailModal, addTemporary, deleteTemporary, clearTemporary } from 'common/reducers/cwmReceive';
import { format } from 'client/common/i18n/helpers';
import ExcelUploader from 'client/components/ExcelUploader';
import AddDetailModal from '../modal/addDetailModal';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.cwmReceive.temporaryDetails,
    loginId: state.account.loginId,
    units: state.cwmSku.params.units,
    currencies: state.cwmSku.params.currencies,
  }),
  {
    showDetailModal, addTemporary, deleteTemporary, clearTemporary,
  }
)
export default class DetailsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldValue: PropTypes.func }).isRequired,
    editable: PropTypes.bool,
    detailEnable: PropTypes.bool.isRequired,
  }
  state = {
    selectedRowKeys: [],
    editRecord: {},
    edit: false,
  };
  componentWillReceiveProps(nextProps) {
    const { asnBody } = nextProps;
    if (asnBody && (nextProps.asnBody !== this.props.asnBody)) {
      this.props.addTemporary(asnBody);
    }
  }
  msg = key => formatMsg(this.props.intl, key);
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
  asnDetailsUploaded = (data) => {
    this.props.addTemporary(data);
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
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTemplateDownload = () => {
    window.open(`${XLSX_CDN}/ASN明细导入模板_20170901.xlsx`);
  }
  render() {
    const {
      editable, temporaryDetails, detailEnable, form, units, currencies,
    } = this.props;
    const ownerPartnerId = form.getFieldValue('owner_partner_id');
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: '行号',
      dataIndex: 'seq_no',
      width: 50,
      align: 'center',
      fixed: 'left',
      render: (col, row) => row.index + 1,
    }, {
      title: '货号',
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
      width: 100,
      dataIndex: 'unit',
      align: 'center',
      render: (un) => {
        const unitParam = units.find(unit => unit.code === un);
        if (unitParam) {
          return unitParam.name;
        }
        return un;
      },
    }, {
      title: '采购订单号',
      dataIndex: 'po_no',
      width: 150,
    }, {
      title: '集装箱号',
      dataIndex: 'container_no',
      width: 150,
    }, {
      title: '库别',
      dataIndex: 'virtual_whse',
      width: 150,
    }, {
      title: '金额',
      dataIndex: 'amount',
      width: 100,
      align: 'right',
    }, {
      title: '币制',
      width: 100,
      dataIndex: 'currency',
      align: 'center',
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
          {editable && <Button type="primary" icon="plus-circle-o" disabled={detailEnable ? '' : 'disabled'} onClick={this.showDetailModal}>添加</Button>}
          <ExcelUploader
            endpoint={`${API_ROOTS.default}v1/cwm/asn/details/import`}
            formData={{
              data: JSON.stringify({
                loginId: this.props.loginId,
                ownerPartnerId,
              }),
            }}
            onUploaded={this.asnDetailsUploaded}
          >
            {editable && <Button icon="upload" disabled={detailEnable ? '' : 'disabled'}>导入</Button>}
          </ExcelUploader>
          <Button icon="download" onClick={this.handleTemplateDownload}>模版下载</Button>
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
      </DataPane>
    );
  }
}
