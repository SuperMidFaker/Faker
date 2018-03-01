import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    orderDetails: state.sofOrders.formData.orderDetails,
    currencies: state.cmsManifest.params.currencies,
    countries: state.cmsManifest.params.tradeCountries,
  }),
  { }
)
export default class OrderDetailsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
  }
  msg = key => formatMsg(this.props.intl, key)
  columns = [{
    title: '序号',
    dataIndex: 'seq_no',
    width: 45,
    align: 'center',
    className: 'table-col-seq',
    render: (col, row, index) => index + 1,
  }, {
    title: '发票号',
    dataIndex: 'invoice_no',
    width: 150,
  }, {
    title: '采购订单号',
    dataIndex: 'po_no',
    width: 150,
  }, {
    title: '集装箱号',
    dataIndex: 'container_no',
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
      const currency = this.props.currencies.find(curr => Number(curr.curr_code) === Number(o));
      if (currency) {
        return <span>{currency.curr_name}</span>;
      }
      return o;
    },
  }, {
    title: '原产国',
    dataIndex: 'orig_country',
    width: 100,
    render: (o, record) => {
      if (record.orig_country) {
        return this.props.countries.find(coun =>
          coun.cntry_co === record.orig_country).cntry_name_cn;
      } else if (record.country) {
        return this.props.countries.find(coun =>
          coun.cntry_co === record.country).cntry_name_cn;
      }
      return '';
    },
  }, {
    title: '净重',
    dataIndex: 'net_wt',
    width: 100,
  }];
  render() {
    return (
      <DataPane
        columns={this.columns}
        dataSource={this.props.orderDetails}
        rowKey="id"
      />
    );
  }
}
