import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Card, Row, Col, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { saveDocuChange } from 'common/reducers/cmsInvoice';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trxModes: state.cmsInvoice.params.trxModes.map(tm => ({
      key: tm.trx_mode,
      text: `${tm.trx_mode} | ${tm.trx_spec}`,
    })),
    customs: state.cmsInvoice.params.customs.map(tm => ({
      key: tm.customs_code,
      text: `${tm.customs_code} | ${tm.customs_name}`,
    })),
    docuBody: state.cmsInvoice.docuBody,
  }),
  { saveDocuChange }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class InvoiceDetails extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    invoice: PropTypes.object.isRequired,
    trxModes: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    sumval: [{
      total: '合计',
      en_name: '',
      g_model: '',
      orig_country: '',
      g_qty: null,
      trade_total: null,
      trade_curr: '',
      dec_price: '',
    }],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.docuBody !== this.props.docuBody && nextProps.docuBody.length > 0) {
      const sumval = nextProps.docuBody.reduce((a, b) => ({
        total: '合计',
        en_name: '',
        g_model: '',
        orig_country: '',
        g_qty: a.g_qty + b.g_qty,
        trade_total: Number(a.trade_total + b.trade_total),
        trade_curr: '',
        dec_price: Number(a.dec_price + b.dec_price),
      }), {
        total: '合计',
        en_name: '',
        g_model: '',
        orig_country: '',
        g_qty: null,
        trade_total: null,
        trade_curr: '',
        dec_price: null,
      });
      this.setState({ sumval: [sumval] });
    }
  }
  columns = [{
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }]
  totCols = [{
    dataIndex: 'total',
    width: 150,
  }]
  handleFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.saveDocuChange(change, this.props.invoice.id);
  }
  render() {
    const { invoice, trxModes, customs, docuBody } = this.props;
    const columns = [...this.columns];
    const totCols = [...this.totCols];
    if (invoice.eng_name_en) {
      columns.push({
        title: '英文品名',
        dataIndex: 'en_name',
        width: 150,
      });
      totCols.push({
        dataIndex: 'en_name',
        width: 150,
      });
    }
    columns.push({
      title: '型号',
      dataIndex: 'g_model',
      width: 300,
    }, {
      title: '原产国',
      dataIndex: 'orig_country',
      width: 100,
    }, {
      title: '数量',
      dataIndex: 'g_qty',
      width: 100,
    }, {
      title: '金额',
      dataIndex: 'trade_total',
      width: 100,
    }, {
      title: '币制',
      dataIndex: 'trade_curr',
      width: 100,
    });
    totCols.push({
      dataIndex: 'g_model',
      width: 300,
    }, {
      dataIndex: 'orig_country',
      width: 100,
    }, {
      dataIndex: 'g_qty',
      width: 100,
    }, {
      dataIndex: 'trade_total',
      width: 100,
    }, {
      dataIndex: 'trade_curr',
      width: 100,
    });
    if (invoice.unit_price_en) {
      columns.push({
        title: '单价',
        dataIndex: 'dec_price',
        width: 100,
      });
      totCols.push({
        dataIndex: 'dec_price',
        width: 100,
      });
    }
    return (
      <Card style={{ margin: 16 }}>
        <div className="page-header">
          <h3>发票 INVOICE</h3>
          <span />
          <Row gutter={16}>
            <Col sm={12}>
              <InfoItem label="发票编号  Invoice No." field={invoice.docu_no} editable placeholder="输入发票编号" dataIndex="docu_no" onEdit={this.handleFill} />
            </Col>
            <Col sm={12}>
              <InfoItem label="卖方  Seller" field={invoice.seller} editable placeholder="输入卖方" dataIndex="seller" onEdit={this.handleFill} />
            </Col>
            <Col sm={12}>
              <InfoItem label="发票日期  Invoice Date" type="date" field={invoice.date} editable placeholder="输入发票日期" dataIndex="date" onEdit={this.handleFill} />
            </Col>
            <Col sm={12}>
              <InfoItem label="买方  Buyer" field={invoice.buyer} editable placeholder="输入买方" dataIndex="buyer" onEdit={this.handleFill} />
            </Col>
          </Row>
          <span />
          <Table columns={columns} dataSource={docuBody} />
          {!!invoice.sub_total_en && <Table showHeader={false} pagination={false} columns={totCols} dataSource={this.state.sumval} />}
          <span />
          <Row gutter={16}>
            <Col sm={24}>
              {!!invoice.insurance_en && <InfoItem label="保险  Insurance" field={invoice.insurance} editable placeholder="输入保险" dataIndex="insurance" onEdit={this.handleFill} /> }
            </Col>
            <Col sm={24}>
              <InfoItem label="付款条件  Terms Of Payment" field={invoice.payment_terms} editable placeholder="输入付款条件" dataIndex="payment_terms" onEdit={this.handleFill} />
            </Col>
            <Col sm={24}>
              {!!invoice.dest_port_en && <InfoItem type="select" label="目的口岸  Port Of Destination" placeholder="点击选择"
                field={invoice.dest_port} editable options={customs} onEdit={value => this.handleFill(value, 'dest_port')}
              />}
            </Col>
            <Col sm={24}>
              <InfoItem type="select" label="成交方式  Terms Of Delivery" placeholder="点击选择"
                field={invoice.trxn_mode} editable options={trxModes} onEdit={value => this.handleFill(value, 'trxn_mode')}
              />
            </Col>
            <Col sm={24}>
              {!!invoice.remark_en && <InfoItem label="备注 Remark" field={invoice.remark} editable placeholder="输入备注" dataIndex="remark" onEdit={this.handleFill} />}
            </Col>
          </Row>
        </div>
      </Card>
    );
  }
}
