import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Layout, Row, Col, Table, Input, Upload, Icon } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from './message.i18n';
import InfoItem from 'client/components/InfoItem';
import { saveTempChange } from 'common/reducers/cmsInvoice';


const { Content } = Layout;
const { TextArea } = Input;

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
      cop_g_no: '',
      g_name: '',
      en_g_name: '',
      g_model: '',
      orig_country: '',
      qty: null,
      amount: null,
      unit_price: '',
      net_wt: null,
      amount: null,
    }],
    fileList: [],
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
    console.log('val', val);
    const change = {};
    change[field] = val;
    this.props.saveTempChange(change, this.props.invoice.id);
  }
  handleCancel = () => this.setState({ previewVisible: false })

  handleChange = ({ fileList }) => this.setState({ fileList })

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
      title: '净重',
      dataIndex: 'net_wt',
    }, {
      title: '金额',
      dataIndex: 'amount',
    });
    totCols.push({
      dataIndex: 'net_wt',
    }, {
      dataIndex: 'amount',
    });
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <Content className="page-content layout-fixed-width">
        <Card style={{ width: 650, minHeight: 800 }}>
          <div className="doc-header">
            <Row>
              <Col sm={8}>
                <Upload
                  action={`${API_ROOTS.default}v1/upload/img/`}
                  listType="picture-card"
                  fileList={this.state.fileList}
                  onChange={this.handleChange}
                >
                  {this.state.fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </Col>
              <Col sm={16}>
                <Row><h4>INVOICE</h4></Row>
                <Row>
                  <Col sm={11}>
                    <TextArea value={invoice.subtitle} autosize={{ minRows: 2, maxRows: 4 }} onChange={this.handleFill}/>
                  </Col>
                  <Col sm={11} offset={1}>
                    <TextArea value={invoice.subtitle} autosize={{ minRows: 2, maxRows: 4 }} onChange={this.handleFill}/>
                  </Col>
                </Row>
              </Col>
            </Row>
            <span />
            <Row gutter={16}>
              <Col sm={12}>
                <InfoItem label="Consignee" type='textarea' field={invoice.seller} editable placeholder="输入Consignee" dataIndex="seller" onEdit={this.handleFill} />
              </Col>
              <Col sm={12}>
                <InfoItem label="Buyer" type='textarea' field={invoice.buyer} editable placeholder="输入buyer" dataIndex="seller" onEdit={this.handleFill} />
              </Col>
            </Row>
            <span />
            <Row gutter={16}>
              <Col sm={12}>
                <Row>
                  <InfoItem
                    label="Terms Of Payment"
                    field={invoice.payment_terms}
                    editable
                    placeholder="输入付款条件"
                    dataIndex="payment_terms"
                    onEdit={this.handleFill}
                  />
                </Row>
                <Row>
                  <InfoItem
                    type="select"
                    label="Terms Of Delivery"
                    placeholder="点击选择"
                    field={invoice.trxn_mode}
                    editable
                    options={trxModes}
                    onEdit={value => this.handleFill(value, 'trxn_mode')}
                  />
                </Row>
                <Row>
                    <InfoItem label="Insurance" field={invoice.insurance} editable placeholder="输入保险" dataIndex="insurance" onEdit={this.handleFill} />
                </Row>
              </Col>
              <Col sm={12}>
                <span>Notify contacts</span>
                <TextArea autosize={{ minRows: 6, maxRows: 10 }} />
              </Col>
            </Row>
            <Row gutter={16}>
              {!!invoice.smarks_en && <span>Shipping Marks</span>}
              {!!invoice.smarks_en && <TextArea value={invoice.subtitle} autosize={{ minRows: 2, maxRows: 6 }} onChange={this.handleFill}/>}
            </Row>
            <Row>
              <span />
              <Table columns={columns} />
              {!!invoice.sub_total_en && <Table showHeader={false} pagination={false} columns={totCols} dataSource={this.state.sumval} />}
            </Row>
            <Row>
              { !!invoice.packages_en && <span>Number Of Packages:</span>}
            </Row>
            <Row>
              { !!invoice.gross_wt_en && <span>Gross Weight:          Kgs</span>}
            </Row>
            <Row>
              {!!invoice.remark_en && <InfoItem label="备注 Remark" field={invoice.remark} editable placeholder="输入备注" dataIndex="remark" onEdit={this.handleFill} />}
            </Row>
          </div>
        </Card>
      </Content>
    );
  }
}
