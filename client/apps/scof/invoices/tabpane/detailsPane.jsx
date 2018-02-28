/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Input, Tag } from 'antd';
import RowAction from 'client/components/RowAction';
import DataPane from 'client/components/DataPane';
import { intlShape, injectIntl } from 'react-intl';
import { toggleDetailModal, setTemporary, splitInvoice, getInvoice } from 'common/reducers/sofInvoice';
import { loadCmsParams } from 'common/reducers/cmsManifest';
import ExcelUploader from 'client/components/ExcelUploader';
import DetailModal from '../modal/detailModal';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    temporaryDetails: state.sofInvoice.temporaryDetails,
    currencies: state.cmsManifest.params.currencies,
    countries: state.cmsManifest.params.tradeCountries,
  }),
  {
    toggleDetailModal, loadCmsParams, setTemporary, splitInvoice, getInvoice,
  }
)
export default class DetailsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldValue: PropTypes.func }).isRequired,
    invoiceNo: PropTypes.string,
  }
  state = {
    selectedRowKeys: [],
  };
  componentDidMount() {
    this.props.loadCmsParams();
    const temporaryDetails = [...this.props.temporaryDetails];
    const newTemporary = temporaryDetails.map(td => ({ ...td, splitQty: td.qty, disabled: true }));
    this.props.setTemporary(newTemporary);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.temporaryDetails.length === 0 && nextProps.temporaryDetails.length !== 0) {
      const temporaryDetails = [...nextProps.temporaryDetails];
      const newTemporary =
      temporaryDetails.map(td => ({ ...td, splitQty: td.qty, disabled: true }));
      this.props.setTemporary(newTemporary);
    }
  }
  componentWillUnmount() {
    this.props.setTemporary([]);
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDelete = (index) => {
    const temporaryDetails = [...this.props.temporaryDetails];
    temporaryDetails.splice(index, 1);
    this.handleCalculate(temporaryDetails);
    this.props.setTemporary(temporaryDetails);
  }
  handleEdit = (row) => {
    this.props.toggleDetailModal(true, row);
  }
  invoiceDetailsUploaded = (data) => {
    const { temporaryDetails } = this.props;
    const newTemporaryDetails = temporaryDetails.concat(data);
    this.handleCalculate(newTemporaryDetails);
    this.props.setTemporary(newTemporaryDetails);
  }
  handleBatchDelete = () => {
    const { selectedRowKeys } = this.state;
    const { temporaryDetails } = this.props;
    const newTemporary = temporaryDetails.filter((temporary, index) =>
      selectedRowKeys.findIndex(key => key === index) === -1);
    this.setState({
      selectedRowKeys: [],
    });
    this.handleCalculate(newTemporary);
    this.props.setTemporary(newTemporary);
  }
  handleCalculate = (temporaryDetails) => {
    const { form } = this.props;
    const totalQty = temporaryDetails.reduce((prev, next) => prev + Number(next.qty), 0);
    const totalAmount = temporaryDetails.reduce((prev, next) => prev + Number(next.amount), 0);
    const totalNetWt = temporaryDetails.reduce((prev, next) => prev + Number(next.net_wt), 0);
    form.setFieldsValue({
      total_qty: totalQty,
      total_amount: totalAmount,
      total_net_wt: totalNetWt,
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleTemplateDownload = () => {
    window.open(`${XLSX_CDN}/发票明细导入模板.xlsx`);
  }
  toggleDetailModal = () => {
    this.props.toggleDetailModal(true);
  }
  handleSplitChange = (e, record) => {
    const temporaryDetails = [...this.props.temporaryDetails];
    const changedOne = temporaryDetails.find(td => td.id === record.id);
    if (e.target.value > changedOne.qty) {
      changedOne.splitQty = changedOne.qty;
    } else {
      changedOne.splitQty = e.target.value;
    }
    this.props.setTemporary(temporaryDetails);
  }
  handleSplit = () => {
    const temporaryDetails = [...this.props.temporaryDetails];
    const splitDetails = temporaryDetails.filter(td => !td.disabled);
    this.props.splitInvoice(this.props.invoiceNo, splitDetails).then((result) => {
      if (!result.error) {
        this.setState({ selectedRowKeys: [] });
        this.props.getInvoice(this.props.invoiceNo).then((re) => {
          if (!re.error) {
            const newTemporaryDetails =
            re.data.details.map(de => ({ ...de, splitQty: de.qty, disabled: true }));
            this.props.setTemporary(newTemporaryDetails);
          }
        });
      }
    });
  }
  render() {
    const {
      temporaryDetails, currencies, countries,
    } = this.props;
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
      onSelect: (record, selected) => {
        const tempDetails = [...this.props.temporaryDetails];
        const selectOne = tempDetails.find(td => td.id === record.id);
        if (selected) {
          selectOne.disabled = false;
        } else {
          selectOne.disabled = true;
          selectOne.splitQty = selectOne.qty;
        }
        this.props.setTemporary(tempDetails);
      },
      onSelectAll: (selected) => {
        const tempDetails = [...this.props.temporaryDetails];
        tempDetails.forEach(td => td.disabled = !selected); // eslint-disable-line
        const { length } = tempDetails;
        let selectedRowKeys = [];
        if (selected) {
          selectedRowKeys = Array.from(new Array(length).keys());
        }
        this.setState({ selectedRowKeys });
        this.props.setTemporary(tempDetails);
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
      dataIndex: 'description',
      width: 200,
    }, {
      title: '数量',
      width: 100,
      dataIndex: 'qty',
      align: 'right',
    }, {
      title: '拆分数量',
      dataIndex: 'splitQty',
      width: 100,
      align: 'right',
      render: (o, record, index) => <Input size="small" value={o} disabled={record.disabled} onChange={e => this.handleSplitChange(e, record, index)} />,
    }, {
      title: '计量单位',
      dataIndex: 'unit',
      align: 'center',
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
        const currency = currencies.find(curr => Number(curr.curr_code) === Number(o));
        if (currency) {
          return <span>{currency.curr_name}</span>;
        }
        return o;
      },
    }, {
      title: '原产国',
      dataIndex: 'orig_country',
      width: 100,
      render: o => countries.find(coun => coun.cntry_co === o) &&
      countries.find(coun => coun.cntry_co === o).cntry_name_cn,
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
          {<Button type="primary" icon="plus-circle-o" onClick={this.toggleDetailModal}>{this.gmsg('add')}</Button>}
          <ExcelUploader
            endpoint={`${API_ROOTS.default}v1/scof/invoice/details/import`}
            formData={{
              data: JSON.stringify({
              }),
            }}
            onUploaded={this.invoiceDetailsUploaded}
          >
            {<Button icon="upload">{this.gmsg('import')}</Button>}
          </ExcelUploader>
          <Button icon="download" onClick={this.handleTemplateDownload} style={{ marginLeft: 8 }}>模板下载</Button>
          <DataPane.BulkActions
            selectedRowKeys={this.state.selectedRowKeys}
            handleDeselectRows={this.handleDeselectRows}
          >
            <Button onClick={this.handleSplit}>拆分发票</Button>
            <Button onClick={this.handleBatchDelete} icon="delete" />
          </DataPane.BulkActions>
        </DataPane.Toolbar>
        <DetailModal headForm={this.props.form} />
      </DataPane>
    );
  }
}
