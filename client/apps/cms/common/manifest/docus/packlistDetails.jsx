import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
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
export default class PacklistDetails extends React.Component {
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
      wet_wt: null,
    }],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.docuBody !== this.props.docuBody && nextProps.docuBody.length > 0) {
      const sumval = nextProps.docuBody.reduce((a, b) => ({
        total: '合计',
        en_name: '',
        g_model: '',
        orig_country: '',
        g_qty: (a.g_qty || 0) + (b.g_qty || 0),
        wet_wt: Number((a.wet_wt || 0) + (b.wet_wt || 0)),
        container_no: '',
      }), {
        total: '合计',
        en_name: '',
        g_model: '',
        orig_country: '',
        g_qty: null,
        wet_wt: null,
        container_no: '',
      });
      this.setState({ sumval: [sumval] });
    }
  }
  columns = [{
    title: '序号',
    dataIndex: 'g_no',
    width: 80,
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
    width: 150,
  }]
  totCols = [{
    dataIndex: 'total',
    width: 80,
  }, {
    width: 150,
  }]
  handleFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.saveDocuChange(change, this.props.invoice.id);
  }
  render() {
    const {
      invoice, trxModes, customs, docuBody,
    } = this.props;
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
      title: '净重',
      dataIndex: 'wet_wt',
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
      render(o) {
        return o ? o.toFixed(3) : '';
      },
    }, {
      dataIndex: 'wet_wt',
      width: 100,
      render(o) {
        return o ? o.toFixed(3) : '';
      },
    });
    if (invoice.containerno_en) {
      columns.push({
        title: '箱号',
        dataIndex: 'container_no',
        width: 100,
      });
      totCols.push({
        dataIndex: 'container_no',
        width: 100,
      });
    }
    return (
      <Card style={{ margin: 16 }}>
        <div className="doc-header">
          <h3>箱单  PACKING LIST</h3>
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
          <Table columns={columns} dataSource={docuBody} pagination={false} scroll={{ y: 450 }} />
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
            <Col sm={12}>
              <InfoItem type="number" label="大件数  Packages" addonAfter="Package" field={invoice.pack_count} editable placeholder="输入件数" dataIndex="pack_count" onEdit={this.handleFill} />
            </Col>
            <Col sm={12}>
              <InfoItem type="number" label="毛重  Gross Weight" addonAfter="Kgs" field={invoice.gross_wt} editable placeholder="输入毛重" dataIndex="gross_wt" onEdit={this.handleFill} />
            </Col>
          </Row>
        </div>
      </Card>
    );
  }
}
