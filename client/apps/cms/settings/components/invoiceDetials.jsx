import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Card, Form, Layout, Row, Col, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from './message.i18n';
import InfoItem from 'client/components/InfoItem';

const { Header, Content } = Layout;

@injectIntl
@connect(
  () => ({
  })
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@Form.create()
export default class InvoiceDetials extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    invoice: PropTypes.object,
    setVal: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    sumval: [{
      total: '合计',
      en_g_name: '',
      g_model: '',
      orig_country: '',
      qty: null,
      amount: null,
      currency: '',
      unit_price: '',
    }],
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '中文品名',
    dataIndex: 'g_name',
  }]
  totCols = [{
    dataIndex: 'total',
  }]
  render() {
    const { invoice, setVal } = this.props;
    const { industry_en, eng_name_en, unit_price_en, sub_total_en, insurance_en, dest_port_en, remark_en } = setVal;
    const columns = [...this.columns];
    const totCols = [...this.totCols];
    if (eng_name_en) {
      columns.push({
        title: '英文品名',
        dataIndex: 'en_g_name',
      });
      totCols.push({
        dataIndex: 'en_g_name',
      });
    }
    columns.push({
      title: '型号',
      dataIndex: 'g_model',
    }, {
      title: '原产国',
      dataIndex: 'orig_country',
    }, {
      title: '数量',
      dataIndex: 'qty',
    }, {
      title: '金额',
      dataIndex: 'amount',
    }, {
      title: '币制',
      dataIndex: 'currency',
    });
    totCols.push({
      dataIndex: 'g_model',
    }, {
      dataIndex: 'orig_country',
    }, {
      dataIndex: 'qty',
    }, {
      dataIndex: 'amount',
    }, {
      dataIndex: 'currency',
    });
    if (unit_price_en) {
      columns.push({
        title: '单价',
        dataIndex: 'unit_price',
      });
      totCols.push({
        dataIndex: 'unit_price',
      });
    }
    return (
      <Card style={{ width: '90%', margin: 16 }}>
        <div className="page-header">
          <h3>发票 INVOICE</h3>
          <span />
          <Row gutter={16}>
            <Col sm={12}>
              <InfoItem label="发票编号  Invoice No." field={invoice.invoice_no} editable />
            </Col>
            <Col sm={12}>
              <InfoItem label="卖方  Seller" field={invoice.seller} editable />
            </Col>
            <Col sm={12}>
              <InfoItem label="发票日期  Invoice Date" field={invoice.invoice_date} editable />
            </Col>
            <Col sm={12}>
              <InfoItem label="买方  Buyer" field={invoice.buyer} editable />
            </Col>
            <Col sm={12}>
              {industry_en && <InfoItem label="行业分类  IC" field={invoice.ic} editable />}
            </Col>
          </Row>
          <span />
          <Table columns={columns} />
          {sub_total_en && <Table showHeader={false} pagination={false} columns={totCols} dataSource={this.state.sumval} />}
          <span />
          <Row gutter={16}>
            <Col sm={24}>
              { insurance_en && <InfoItem label="保险  Insurance" field={invoice.insurance} editable /> }
            </Col>
            <Col sm={24}>
              <InfoItem label="付款条件  Terms Of Payment" field={invoice.payment_terms} editable />
            </Col>
            <Col sm={24}>
              {dest_port_en && <InfoItem label="目的口岸  Port Of Destination" field={invoice.dest_port} editable />}
            </Col>
            <Col sm={24}>
              <InfoItem label="成交方式 Terms Of Delivery" field={invoice.trxn_mode} editable />
            </Col>
            <Col sm={24}>
              {remark_en && <InfoItem label="备注 Remark" field={invoice.remark} editable />}
            </Col>
          </Row>
        </div>
      </Card>
    );
  }
}
