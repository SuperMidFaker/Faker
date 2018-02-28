import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Layout, Row, Col, Table, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import { saveTempChange } from 'common/reducers/cmsInvoice';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const { TextArea } = Input;

function MSTextArea(props) {
  const {
    value, field, autosize, onChange,
  } = props;
  function handleChange(ev) {
    onChange(ev.target.value, field);
  }
  return (
    <div>
      <TextArea onChange={handleChange} value={value} autosize={autosize}/>
    </div>
  );
}

MSTextArea.propTypes = {
  autosize: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trxModes: state.cmsInvoice.params.trxModes.map(tm => ({
      key: tm.trx_mode,
      text: `${tm.trx_mode} | ${tm.trx_spec}`,
    })),
    invoice: state.cmsInvoice.invData,
  }),
  { saveTempChange }
)

@Form.create()
export default class ContractContent extends React.Component {
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
      cop_g_no: '',
      g_name: '',
      en_g_name: '',
      orig_country: '',
      qty: null,
      unit_price: '',
      amount: null,
      wet_wt: null,
    }],
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: '序号',
    dataIndex: 'g_no',
  }, {
    title: '货号',
    dataIndex: 'cop_g_no',
  }, {
    title: '中文品名',
    dataIndex: 'g_name',
  }]
  totCols = [{
    dataIndex: 'total',
  }, {
    dataIndex: 'cop_g_no',
  }, {
    dataIndex: 'g_name',
  }]
  handleFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.saveTempChange(change, this.props.invoice.id);
  }
  render() {
    const { invoice, trxModes } = this.props;
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
      title: '原产国',
      dataIndex: 'orig_country',
    }, {
      title: '数量',
      dataIndex: 'qty',
    });
    totCols.push({
      dataIndex: 'orig_country',
    }, {
      dataIndex: 'qty',
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
    columns.push({
      title: '金额',
      dataIndex: 'amount',
    }, {
      title: '净重',
      dataIndex: 'wet_wt',
    });
    totCols.push({
      dataIndex: 'amount',
    }, {
      dataIndex: 'wet_wt',
    });
    return (
      <Content className="page-content layout-fixed-width">
        <Card style={{ width: 650, minHeight: 800 }}>
          <div className="doc-header">
            <h4>合同 CONTRACT</h4>
            <span />
            <Row gutter={16}>
              <Col sm={12}>
                <InfoItem label="卖方 Seller" field={invoice.consignee} editable placeholder="输入卖方" dataIndex="consignee" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="合同号 Contract No." field={invoice.invoice_no} editable placeholder="输入合同号" dataIndex="invoice_no" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="买方 Buyer" field={invoice.buyer} editable placeholder="输入买方" dataIndex="buyer" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="日期 Date" type="date" field={invoice.invoice_date} editable placeholder="输入日期" dataIndex="invoice_date" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem
                  type="select"
                  label="成交方式 Terms Of Delivery"
                  placeholder="点击选择"
                  field={invoice.trxn_mode}
                  editable
                  options={trxModes}
                  onEdit={value => this.handleFill(value, 'trxn_mode')}
                />
              </Col>
            </Row>
            <span />
            <span>兹经买卖双方同意，由买方购进，卖方出售下列货物，并按下列条款签订本合同：</span>
            <Table columns={columns} />
            {!!invoice.sub_total_en && <Table showHeader={false} pagination={false} columns={totCols} dataSource={this.state.sumval} />}
            <span />
            <Row gutter={16}>
              <Col sm={24}>
                <InfoItem label="付款条件 Terms Of Payment" field={invoice.payment_terms} editable placeholder="输入付款条件" dataIndex="payment_terms" onEdit={this.handleFill} />
              </Col>
            </Row>
            <span />
            <Row gutter={16}>
              <Col sm={24}>
                {!!invoice.remark_en && <span>备注 Remark</span>}
                {!!invoice.remark_en && <MSTextArea value={invoice.remark} field='remark' autosize={{ minRows: 2, maxRows: 6 }} onChange={this.handleFill} />}
              </Col>
            </Row>
            {!!invoice.sign_en && <div style={{ margin: 28 }}>
              <Row gutter={16}>
                <Col sm={12}>
                  <h4>买方  THE BUYERS</h4>
                </Col>
                <Col sm={12}>
                  <h4>卖方  THE SELLERS </h4>
                </Col>
              </Row>
            </div>}
          </div>
        </Card>
      </Content>
    );
  }
}
