import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InfoItem from 'client/components/InfoItem';
import { Card, Form, Layout, Row, Col, Table, Input, Upload, Icon, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { saveTempChange, uploadImages, removeImg } from 'common/reducers/cmsInvoice';
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
      <TextArea onChange={handleChange} value={value} autosize={autosize} />
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
    customs: state.cmsInvoice.params.customs.map(tm => ({
      key: tm.customs_code,
      text: `${tm.customs_code} | ${tm.customs_name}`,
    })),
    invoice: state.cmsInvoice.invData,
  }),
  { saveTempChange, uploadImages, removeImg }
)

@Form.create()
export default class PackingListContent extends React.Component {
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
    logoImg: [],
    sealImg: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.invoice !== this.props.invoice) {
      if (nextProps.invoice.imgs.length > 0) {
        const logo = nextProps.invoice.imgs.filter(img => img.img_type === 0)[0];
        if (logo) {
          this.setState({ logoImg: [{ uid: -1, url: logo.url }] });
        }
        const seal = nextProps.invoice.imgs.filter(img => img.img_type === 1)[0];
        if (seal) {
          this.setState({ sealImg: [{ uid: -1, url: seal.url }] });
        }
      }
    }
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
  handleUploaded = (data) => {
    this.props.uploadImages(data);
  }
  render() {
    const { invoice, trxModes } = this.props;
    const me = this;
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
    if (invoice.containerno_en) {
      columns.push({
        title: '箱号',
        dataIndex: 'container_no',
      });
      totCols.push({
        dataIndex: 'container_no',
      });
    }
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const uploadLogoProps = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      listType: 'picture-card',
      fileList: this.state.logoImg,
      withCredentials: true,
      onChange(info) {
        me.setState({ logoImg: info.fileList });
        if (info.file.response && info.file.response.status === 200) {
          me.handleUploaded({
            template_id: invoice.id,
            img_type: 0,
            url: info.file.response.data,
          });
          message.success('上传成功');
        }
      },
      onRemove() {
        me.props.removeImg({
          template_id: invoice.id,
          img_type: 0,
        });
      },
    };
    const uploadSealProps = {
      action: `${API_ROOTS.default}v1/upload/img/`,
      listType: 'picture-card',
      fileList: this.state.sealImg,
      withCredentials: true,
      onChange(info) {
        me.setState({ sealImg: info.fileList });
        if (info.file.response && info.file.response.status === 200) {
          me.handleUploaded({
            template_id: invoice.id,
            img_type: 1,
            url: info.file.response.data,
          });
          message.success('上传成功');
        }
      },
      onRemove() {
        me.props.removeImg({
          template_id: invoice.id,
          img_type: 1,
        });
      },
    };
    return (
      <Content className="page-content layout-fixed-width">
        <Card style={{ width: 650, minHeight: 800 }}>
          <div className="doc-header">
            <Row>
              <Col sm={8}>
                <Upload
                  {...uploadLogoProps}
                >
                  {this.state.logoImg.length >= 1 ? null : uploadButton}
                </Upload>
              </Col>
              <Col sm={16}>
                <Row><h4>PACKING LIST</h4></Row>
                <Row>
                  <Col sm={11}>
                    <MSTextArea value={invoice.subtitle} field="subtitle" autosize={{ minRows: 2, maxRows: 4 }} onChange={this.handleFill} />
                  </Col>
                  <Col sm={11} offset={1}>
                    <InfoItem label="Invoice No" field={invoice.invoice_no} editable placeholder="输入发票编号" dataIndex="invoice_no" onEdit={this.handleFill} />
                    <InfoItem label="Invoice Date" type="date" field={invoice.invoice_date} editable placeholder="输入发票日期" dataIndex="invoice_date" onEdit={this.handleFill} />
                  </Col>
                </Row>
              </Col>
            </Row>
            <span />
            <Row gutter={16}>
              <Col sm={12}>
                <span>Consignee</span>
                <MSTextArea value={invoice.consignee} field="consignee" autosize={{ minRows: 2, maxRows: 4 }} onChange={this.handleFill} />
              </Col>
              <Col sm={12}>
                <span>Buyer</span>
                <MSTextArea value={invoice.buyer} field="buyer" autosize={{ minRows: 2, maxRows: 4 }} onChange={this.handleFill} />
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
                <MSTextArea value={invoice.notify} field="notify" autosize={{ minRows: 6, maxRows: 10 }} onChange={this.handleFill} />
              </Col>
            </Row>
            <Row gutter={16}>
              {!!invoice.smarks_en && <span>Shipping Marks</span>}
              {!!invoice.smarks_en && <MSTextArea value={invoice.shipping_marks} field="shipping_marks" autosize={{ minRows: 2, maxRows: 6 }} onChange={this.handleFill} />}
            </Row>
            <Row>
              <span />
              <Table columns={columns} />
              {!!invoice.sub_total_en && <Table showHeader={false} pagination={false} columns={totCols} dataSource={this.state.sumval} />}
            </Row>
            <Row>
              <Upload
                {...uploadSealProps}
              >
                {this.state.sealImg.length >= 1 ? null : uploadButton}
              </Upload>
            </Row>
            <Row>
              { !!invoice.packages_en && <span>Number Of Packages:</span>}
            </Row>
            <Row>
              { !!invoice.gross_wt_en && <span>Gross Weight: Kgs</span>}
            </Row>
            <Row>
              { !!invoice.remark_en && <span>Remarks</span>}
              { !!invoice.remark_en && <MSTextArea value={invoice.remark} field="remark" autosize={{ minRows: 1, maxRows: 6 }} onChange={this.handleFill} />}
            </Row>
            <span />
            <div style={{ paddingTop: 20 }}>
              <Row>
                <Col sm={7}>
                  <MSTextArea value={invoice.footer1} field="footer1" autosize={{ minRows: 3, maxRows: 6 }} onChange={this.handleFill} />
                </Col>
                <Col sm={7} offset={1}>
                  <MSTextArea value={invoice.footer2} field="footer2" autosize={{ minRows: 3, maxRows: 6 }} onChange={this.handleFill} />
                </Col>
                <Col sm={8} offset={1}>
                  <MSTextArea value={invoice.footer3} field="footer3" autosize={{ minRows: 3, maxRows: 6 }} onChange={this.handleFill} />
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      </Content>
    );
  }
}
