import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Layout, Row, Col, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from './message.i18n';
import InfoItem from 'client/components/InfoItem';
import { saveTempChange } from 'common/reducers/cmsInvoice';

const { Content } = Layout;

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
    invoice: state.cmsInvoice.invData,
  }),
  { saveTempChange }
)

@Form.create()
export default class InvoiceContent extends React.Component {
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
  handleFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.saveTempChange(change, this.props.invoice.id);
  }
  render() {
    const { invoice, trxModes, customs } = this.props;
    const columns = [...this.columns];
    const totCols = [...this.totCols];
    if (invoice.eng_name_en) {
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
    if (invoice.unit_price_en) {
      columns.push({
        title: '单价',
        dataIndex: 'unit_price',
      });
      totCols.push({
        dataIndex: 'unit_price',
      });
    }
    return (
      <Content className="page-content layout-fixed-width">
        <Card style={{ width: 650, minHeight: 800 }}>
          <div className="doc-header">
            <h3>发票 INVOICE</h3>
            <span />
            <Row gutter={16}>
              <Col sm={12}>
                <InfoItem label="发票编号  Invoice No." field={invoice.invoice_no} editable placeholder="输入发票编号" dataIndex="invoice_no" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="卖方  Seller" field={invoice.seller} editable placeholder="输入卖方" dataIndex="seller" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="发票日期  Invoice Date" type="date" field={invoice.invoice_date} editable placeholder="输入发票日期" dataIndex="invoice_date" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="买方  Buyer" field={invoice.buyer} editable placeholder="输入买方" dataIndex="buyer" onEdit={this.handleFill} />
              </Col>
            </Row>
            <span />
            <Table columns={columns} />
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
                {!!invoice.dest_port_en && <InfoItem
                  type="select"
                  label="目的口岸  Port Of Destination"
                  placeholder="点击选择"
                  field={invoice.dest_port}
                  editable
                  options={customs}
                  onEdit={value => this.handleFill(value, 'dest_port')}
                />}
              </Col>
              <Col sm={24}>
                <InfoItem
                  type="select"
                  label="成交方式  Terms Of Delivery"
                  placeholder="点击选择"
                  field={invoice.trxn_mode}
                  editable
                  options={trxModes}
                  onEdit={value => this.handleFill(value, 'trxn_mode')}
                />
              </Col>
              <Col sm={24}>
                {!!invoice.remark_en && <InfoItem label="备注 Remark" field={invoice.remark} editable placeholder="输入备注" dataIndex="remark" onEdit={this.handleFill} />}
              </Col>
            </Row>
          </div>
        </Card>
      </Content>
    );
  }
}
