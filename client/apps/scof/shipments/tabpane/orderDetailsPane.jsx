import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import DataPane from 'client/components/DataPane';
import { format } from 'client/common/i18n/helpers';
import Summary from 'client/components/Summary';
import { loadOrderDetails } from 'common/reducers/sofOrders';
import messages from '../message.i18n';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    orderDetails: state.sofOrders.orderDetails,
    currencies: state.cmsManifest.params.currencies,
    countries: state.cmsManifest.params.tradeCountries,
    invoices: state.sofOrders.invoices,
  }),
  { loadOrderDetails }
)
export default class OrderDetailsPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    orderNo: PropTypes.string,
  }
  componentDidMount() {
    const { pageSize, current } = this.props.orderDetails;
    this.props.loadOrderDetails({
      pageSize,
      current,
      orderNo: this.props.orderNo,
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.orderDetails.reload) {
      const { pageSize, current } = this.props.orderDetails;
      this.props.loadOrderDetails({
        pageSize,
        current,
        orderNo: this.props.orderNo,
      });
    }
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
    dataIndex: 'g_name',
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
    dataIndex: 'country',
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
    const {
      pageSize, current, totalCount, data,
    } = this.props.orderDetails;
    const pagination = {
      hideOnSinglePage: true,
      pageSize: Number(pageSize),
      current: Number(current),
      total: totalCount,
      showTotal: total => `共 ${total} 条`,
      onChange: (page) => {
        this.props.loadOrderDetails({
          pageSize,
          current: page,
          orderNo: this.props.orderNo,
        });
      },
    };
    const statWt = data.reduce((acc, det) => ({
      total_amount: acc.total_amount + det.amount,
      total_net_wt: acc.total_net_wt + det.net_wt,
    }), { total_amount: 0, total_net_wt: 0 });
    const totCol = (
      <Summary>
        <Summary.Item label="总数量" addonAfter="KG">{statWt.total_amount.toFixed(5)}</Summary.Item>
        <Summary.Item label="总净重" addonAfter="KG">{statWt.total_net_wt.toFixed(5)}</Summary.Item>
      </Summary>
    );
    return (
      <DataPane
        columns={this.columns}
        dataSource={data}
        rowKey="id"
        total={this.props.totalCount}
        pagination={pagination}
      >
        <DataPane.Toolbar>
          <DataPane.Extra>
            {totCol}
          </DataPane.Extra>
        </DataPane.Toolbar>
      </DataPane>
    );
  }
}
