/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Tag } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import { intlShape, injectIntl } from 'react-intl';
import { showDetailModal, addTemporary, deleteTemporary, clearTemporary } from 'common/reducers/cwmReceive';
import ExcelUploader from 'client/components/ExcelUploader';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

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
  }
  state = {
    selectedRowKeys: [],
  };
  componentWillReceiveProps(nextProps) {
    const { asnBody } = nextProps;
    if (asnBody && (nextProps.asnBody !== this.props.asnBody)) {
      this.props.addTemporary(asnBody);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDelete = (index) => {
    this.props.deleteTemporary(index);
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
      editable, temporaryDetails, form, units, currencies,
    } = this.props;
    const ownerPartnerId = form.getFieldValue('owner_partner_id');
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const columns = [{
      title: '序号',
      dataIndex: 'seq_no',
      width: 45,
      align: 'center',
      className: 'table-col-seq',
      render: (col, row) => row.index + 1,
    }, {
      title: '采购订单号',
      dataIndex: 'po_no',
      width: 150,
    }, {
      title: '货号',
      dataIndex: 'product_no',
      width: 200,
    }, {
      title: '商品描述',
      dataIndex: 'product_desc',
      width: 200,
    }, {
      title: '数量',
      width: 100,
      dataIndex: 'qty',
      align: 'right',
    }, {
      title: '计量单位',
      dataIndex: 'uom',
      align: 'center',
      render: (un) => {
        const unitParam = units.find(unit => unit.code === un);
        if (unitParam) {
          return unitParam.name;
        }
        return un;
      },
    }, {
      title: '单价',
      dataIndex: 'unit_price',
      width: 100,
    }, {
      title: '总价',
      dataIndex: 'amount',
      width: 100,
      align: 'right',
    }, {
      title: '币制',
      dataIndex: 'currency',
      align: 'center',
      width: 100,
      render: (o) => {
        const currency = currencies.find(curr => Number(curr.code) === Number(o));
        if (currency) {
          return <span>{currency.name}</span>;
        }
        return o;
      },
    }, {
      title: '原产国',
      dataIndex: 'origin_country',
      width: 100,
    }, {
      title: '净重',
      dataIndex: 'net_wt',
      width: 100,
    }, {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (o) => {
        switch (o) {
          case 0:
            return <Tag>{this.msg('toShip')}</Tag>;
          case 1:
            return <Tag color="green">{this.msg('shipped')}</Tag>;
          default:
            return null;
        }
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
        fullscreen={this.props.fullscreen}
        columns={columns}
        rowSelection={rowSelection}
        indentSize={0}
        dataSource={temporaryDetails.map((item, index) => ({ ...item, index }))}
        rowKey="index"
        loading={this.state.loading}
      >
        <DataPane.Toolbar>
          {editable && <Button type="primary" icon="plus-circle-o" onClick={this.showDetailModal}>{this.gmsg('add')}</Button>}
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
            {editable && <Button icon="upload">{this.gmsg('import')}</Button>}
          </ExcelUploader>
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
