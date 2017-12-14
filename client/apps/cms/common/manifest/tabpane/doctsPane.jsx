import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Collapse, Button, Breadcrumb, Table, Select, Icon, Form, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../docus/message.i18n';
import { loadTempParams, loadDocuDatas, loadDocuBody, loadInvTemplates, updateDocuTemplate, setDocu } from 'common/reducers/cmsInvoice';
import InvoiceDetails from '../docus/invoiceDetails';
import ContractDetails from '../docus/contractDetails';
import PacklistDetails from '../docus/packlistDetails';
import { CMS_DOCU_TYPE } from 'common/constants';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const { Content, Sider } = Layout;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    docuDatas: state.cmsInvoice.docuDatas,
    invTemplates: state.cmsInvoice.invTemplates,
    billMeta: state.cmsManifest.billMeta,
    docu: state.cmsInvoice.docu,
    docuBody: state.cmsInvoice.docuBody,
    trxModes: state.cmsInvoice.params.trxModes.map(tm => ({
      key: tm.trx_mode,
      text: `${tm.trx_mode} | ${tm.trx_spec}`,
    })),
  }),
  { loadTempParams, loadDocuDatas, loadDocuBody, loadInvTemplates, updateDocuTemplate, setDocu }
)

export default class DocuPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billSeqNo: PropTypes.string.isRequired,
    docuDatas: PropTypes.array.isRequired,
    invTemplates: PropTypes.array.isRequired,
    docu: PropTypes.object.isRequired,
    trxModes: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    invoices: [],
    contracts: [],
    packlists: [],
    invtemps: [],
    contemps: [],
    paktemps: [],
  }
  componentDidMount() {
    let script;
    if (!document.getElementById('pdfmake-min')) {
      script = document.createElement('script');
      script.id = 'pdfmake-min';
      script.src = `${__CDN__}/assets/pdfmake/pdfmake.min.js`;
      script.async = true;
      document.body.appendChild(script);
    }
    if (!document.getElementById('pdfmake-vfsfont')) {
      script = document.createElement('script');
      script.id = 'pdfmake-vfsfont';
      script.src = `${__CDN__}/assets/pdfmake/vfs_fonts.js`;
      script.async = true;
      document.body.appendChild(script);
    }
    this.props.loadTempParams();
    this.props.loadInvTemplates({ tenantId: this.props.tenantId, docuType: [0, 1, 2], partnerId: this.props.billMeta.customerId });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.docuDatas !== this.props.docuDatas) {
      let invoices = [];
      let contracts = [];
      let packlists = [];
      if (nextProps.docuDatas.length > 0) {
        invoices = nextProps.docuDatas.filter(dt => dt.docu_type === 0);
        contracts = nextProps.docuDatas.filter(dt => dt.docu_type === 1);
        packlists = nextProps.docuDatas.filter(dt => dt.docu_type === 2);
        if (this.props.docu && this.props.docu.id) {
          this.handleRowClick(nextProps.docu);
        } else {
          const docu = invoices.length > 0 ? invoices[0] : {};
          this.props.setDocu(docu);
          this.props.loadDocuBody(docu.id);
        }
      } else {
        this.props.setDocu({});
      }
      this.setState({ invoices, contracts, packlists });
    }
    if (nextProps.invTemplates !== this.props.invTemplates) {
      const invtemps = nextProps.invTemplates.filter(tp => tp.docu_type === 0);
      const contemps = nextProps.invTemplates.filter(tp => tp.docu_type === 1);
      const paktemps = nextProps.invTemplates.filter(tp => tp.docu_type === 2);
      this.setState({ invtemps, contemps, paktemps });
    }
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRowClick = (record) => {
    this.props.loadDocuBody(record.id);
    this.props.setDocu(record);
  }
  handleTempSelectChange = (value) => {
    this.props.updateDocuTemplate({ tempId: value, docu: this.props.docu }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadDocuDatas({ billSeqNo: this.props.billSeqNo });
      }
    });
  }
  handlePanelChange = (key) => {
    const { invoices, contracts, packlists } = this.state;
    let docu = {};
    if (key === 'invoice') {
      docu = invoices.length > 0 ? invoices[0] : {};
    } else if (key === 'contract') {
      docu = contracts.length > 0 ? contracts[0] : {};
    } else if (key === 'packlist') {
      docu = packlists.length > 0 ? packlists[0] : {};
    }
    this.handleRowClick(docu);
  }
  pdfBody = () => {
    const { docu, docuBody } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '序号', style: 'tableHeader' }, { text: '中文品名', style: 'tableHeader' });
    if (docu.eng_name_en) {
      header.push({ text: '英文品名', style: 'tableHeader' });
    }
    if (docu.docu_type === CMS_DOCU_TYPE.packingList) {
      header.push(
        { text: '型号', style: 'tableHeader' },
        { text: '原产国', style: 'tableHeader' },
        { text: '数量', style: 'tableHeader' },
        { text: '净重', style: 'tableHeader' },
      );
      if (docu.containerno_en) {
        header.push({ text: '箱号 container_no', style: 'tableHeader' });
      }
      pdf.push(header);
      for (let i = 0; i < docuBody.length; i++) {
        const dbody = docuBody[i];
        const body = [];
        body.push(`${dbody.g_no}`, `${dbody.g_name}`);
        if (docu.eng_name_en) {
          body.push(`${dbody.en_name || ''}`);
        }
        body.push(`${dbody.g_model}`, `${dbody.orig_country}`);
        body.push({ text: `${dbody.g_qty || 0}`, alignment: 'right' });
        body.push({ text: `${dbody.wet_wt || 0}`, alignment: 'right' });
        if (docu.containerno_en) {
          body.push(`${dbody.container_no || ''}`);
        }
        pdf.push(body);
      }
    } else {
      header.push(
        { text: '型号', style: 'tableHeader' },
        { text: '原产国', style: 'tableHeader' },
        { text: '数量', style: 'tableHeader' },
        { text: '金额', style: 'tableHeader' },
        { text: '币制', style: 'tableHeader' },
      );
      if (docu.unit_price_en) {
        header.push({ text: '单价', style: 'tableHeader' });
      }
      pdf.push(header);
      for (let i = 0; i < docuBody.length; i++) {
        const dbody = docuBody[i];
        const body = [];
        body.push(`${dbody.g_no}`, `${dbody.g_name}`);
        if (docu.eng_name_en) {
          body.push(`${dbody.en_name || ''}`);
        }
        body.push(`${dbody.g_model}`, `${dbody.orig_country}`);
        body.push({ text: `${dbody.g_qty || 0}`, alignment: 'right' });
        body.push({ text: `${dbody.trade_total || 0}`, alignment: 'right' });
        body.push(`${dbody.trade_curr}`);
        if (docu.unit_price_en) {
          body.push({ text: `${dbody.dec_price || 0}`, alignment: 'right' });
        }
        pdf.push(body);
      }
    }
    if (docu.sub_total_en) {
      const footer = [];
      const sumval = docuBody.reduce((a, b) => ({
        g_qty: (a.g_qty || 0) + (b.g_qty || 0),
        trade_total: Number((a.trade_total || 0) + (b.trade_total || 0)),
        dec_price: Number((a.dec_price || 0) + (b.dec_price || 0)),
        wet_wt: Number((a.wet_wt || 0) + (b.wet_wt || 0)),
      }), {
        g_qty: 0,
        trade_total: 0,
        dec_price: 0,
        wet_wt: 0,
      });
      footer.push('小计', '');
      if (docu.eng_name_en) {
        footer.push('');
      }
      if (docu.docu_type === CMS_DOCU_TYPE.packingList) {
        footer.push('', '');
        footer.push({ text: `${(sumval.g_qty).toFixed(3)}`, alignment: 'right' });
        footer.push({ text: `${(sumval.wet_wt).toFixed(3)}`, alignment: 'right' });
        if (docu.containerno_en) {
          footer.push('');
        }
      } else {
        footer.push('', '');
        footer.push({ text: `${(sumval.g_qty).toFixed(3)}`, alignment: 'right' });
        footer.push({ text: `${(sumval.trade_total).toFixed(3)}`, alignment: 'right' });
        footer.push('');
        if (docu.unit_price_en) {
          footer.push({ text: `${(sumval.dec_price).toFixed(3)}`, alignment: 'right' });
        }
      }
      pdf.push(footer);
    }
    return pdf;
  }
  handleDocDef = () => {
    const { docu, trxModes } = this.props;
    const trxmode = trxModes.find(trx => trx.key === docu.trxn_mode);
    const trxText = trxmode ? trxmode.text : '';
    const docDefinition = {
      content: [],
      styles: {
        eachheader: {
          fontSize: 9,
          margin: [40, 20, 30, 30],
        },
        header: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        table: {
          fontSize: 10,
          color: 'black',
          margin: [2, 10, 2, 10],
        },
        tableHeader: {
          fontSize: 12,
          bold: true,
          color: 'black',
          margin: [2, 2, 2, 2],
        },
        footer: {
          margin: [2, 12, 2, 12],
        },
        sign: {
          fontSize: 12,
          bold: true,
          color: 'black',
          margin: [12, 12, 12, 12],
        },
      },
      defaultStyle: {
        font: 'yahei',
      },
    };
    if (docu.docu_type === CMS_DOCU_TYPE.invoice) {
      docDefinition.header = {
        columns: [
          { text: `发票编号 Invoice No :  ${docu.docu_no}`, style: 'eachheader' },
          { text: `日期 Invoice Date :  ${moment(docu.date).format('YYYY.MM.DD')}`, style: 'eachheader' },
        ],
      };
      docDefinition.content = [
        { text: '发票 Invoice', style: 'header' },
        { text: `发票编号 Invoice No :  ${docu.docu_no}` },
        { text: `日期 Invoice Date :  ${moment(docu.date).format('YYYY.MM.DD')}` },
        { text: `买方 Buyer :  ${docu.buyer || ''}` },
        { text: `卖方 Seller :  ${docu.seller || ''}` },
        { style: 'table',
          table: { headerRows: 1, body: this.pdfBody() },
        },
        { text: `付款条件 Terms Of Payment :  ${docu.payment_terms || ''}` },
        { text: `成交方式 Terms Of Delivery :  ${trxText}` },
      ];
      if (docu.insurance_en) {
        docDefinition.content.push({ text: `保险  Insurance :  ${docu.insurance || ''}` });
      }
      if (docu.dest_port_en) {
        docDefinition.content.push({ text: `目的口岸  Port Of Destination :  ${docu.dest_port || ''}` });
      }
      if (docu.remark_en) {
        docDefinition.content.push({ text: `备注 Remark :  ${docu.remark || ''}` });
      }
    } else if (docu.docu_type === CMS_DOCU_TYPE.contract) {
      docDefinition.header = {
        columns: [
          { text: `合同号 Contract No :  ${docu.docu_no}`, style: 'eachheader' },
          { text: `日期 Date :  ${moment(docu.date).format('YYYY.MM.DD')}`, style: 'eachheader' },
        ],
      };
      docDefinition.content = [
        { text: '合同 Contract', style: 'header' },
        { text: `合同号 Contract No :  ${docu.docu_no}` },
        { text: `日期 Date :  ${moment(docu.date).format('YYYY.MM.DD')}` },
        { text: `买方 Buyer :  ${docu.buyer || ''}` },
        { text: `卖方 Seller :  ${docu.seller || ''}` },
        { text: '兹经买卖双方同意，由买方购进，卖方出售下列货物，并按下列条款签订本合同：' },
        { style: 'table',
          table: { headerRows: 1, body: this.pdfBody() },
        },
        { text: `付款条件 Terms Of Payment :  ${docu.payment_terms || ''}` },
        { text: `成交方式 Terms Of Delivery :  ${trxText}` },
      ];
      if (docu.insurance_en) {
        docDefinition.content.push({ text: `保险  Insurance :  ${docu.insurance || ''}` });
      }
      if (docu.dest_port_en) {
        docDefinition.content.push({ text: `目的口岸  Port Of Destination :  ${docu.dest_port || ''}` });
      }
      if (docu.remark_en) {
        docDefinition.content.push({ text: `备注 Remark :  ${docu.remark || ''}` });
      }
      docDefinition.content.push({ text: '本合同一式二份，买卖双方各执一份为证。', style: 'footer' });
      docDefinition.content.push({ text: 'This contract is mad outin two original copies, one copy to be held by each party in witness thereof.' });
      if (docu.sign_en) {
        docDefinition.content.push({ columns: [
          { text: '买方  THE BUYERS', style: 'sign' },
          { text: '卖方  THE SELLERS', style: 'sign' },
        ] });
      }
    } else if (docu.docu_type === CMS_DOCU_TYPE.packingList) {
      docDefinition.header = {
        columns: [
          { text: `发票编号 Invoice No :  ${docu.docu_no}`, style: 'eachheader' },
          { text: `日期 Date :  ${moment(docu.date).format('YYYY.MM.DD')}`, style: 'eachheader' },
        ],
      };
      docDefinition.content = [
        { text: '箱单 PackingList', style: 'header' },
        { text: `发票号 Invoice No :  ${docu.docu_no}` },
        { text: `日期 Date :  ${moment(docu.date).format('YYYY.MM.DD')}` },
        { text: `买方 Buyer :  ${docu.buyer || ''}` },
        { text: `卖方 Seller :  ${docu.seller || ''}` },
        { style: 'table',
          table: { headerRows: 1, body: this.pdfBody() },
        },
        { text: `付款条件 Terms Of Payment :  ${docu.payment_terms || ''}` },
        { text: `成交方式 Terms Of Delivery :  ${trxText}` },
      ];
      if (docu.insurance_en) {
        docDefinition.content.push({ text: `保险  Insurance :  ${docu.insurance || ''}` });
      }
      if (docu.dest_port_en) {
        docDefinition.content.push({ text: `目的口岸  Port Of Destination :  ${docu.dest_port || ''}` });
      }
      if (docu.remark_en) {
        docDefinition.content.push({ text: `备注 Remark :  ${docu.remark || ''}` });
      }
      docDefinition.content.push({ text: `大件数 Packages :  ${docu.pack_count || ''}` });
      docDefinition.content.push({ text: `毛重 Gross Weight :  ${docu.gross_wt || ''}` });
    }
    return docDefinition;
  }
  handlePDF = () => {
    // pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = this.handleDocDef();
    window.pdfMake.fonts = {
      yahei: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
        italics: 'msyh.ttf',
        bolditalics: 'msyh.ttf',
      },
    };
    window.pdfMake.createPdf(docDefinition).open();
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { invoices, contracts, packlists, invtemps, contemps, paktemps } = this.state;
    const docu = this.props.docu ? this.props.docu : {};
    const invTempId = (docu.docu_type === 0 && docu.template_id) ? docu.template_id : null;
    const conTempId = (docu.docu_type === 1 && docu.template_id) ? docu.template_id : null;
    const pakTempId = (docu.docu_type === 2 && docu.template_id) ? docu.template_id : null;
    const docuCols = [{
      dataIndex: 'docu_code',
      key: 'docu_code',
      render: o => <div style={{ paddingLeft: 15 }}>{o}</div>,
    }];
    return (
      <Layout className="ant-layout-wrapper">
        <Sider width={280} className="menu-sider">
          <div className="left-sider-panel" >
            <Collapse accordion defaultActiveKey="invoice" onChange={this.handlePanelChange}>
              <Panel header={this.msg('invoice')} key="invoice">
                <FormItem>
                  <Select
                    placeholder="选择发票模板"
                    optionFilterProp="search"

                    onChange={this.handleTempSelectChange}
                    style={{ width: '100%' }}
                    value={invTempId}
                  >
                    <OptGroup>
                      {invtemps.map(data => (<Option key={data.id} value={data.id}
                        search={`${data.id}${data.template_name}`}
                      ><Icon type="file-text" /> {data.template_name}</Option>)
                        )}
                    </OptGroup>
                  </Select>
                </FormItem>
                <Table size="middle" dataSource={invoices} columns={docuCols} showHeader={false}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                  onRow={record => ({
                    onClick: () => { this.handleRowClick(record); },
                  })}
                />
              </Panel>
              <Panel header={this.msg('contract')} key="contract">
                <FormItem>
                  <Select
                    placeholder="选择合同模板"
                    optionFilterProp="search"

                    onChange={this.handleTempSelectChange}
                    style={{ width: '100%' }}
                    value={conTempId}
                  >
                    <OptGroup>
                      {contemps.map(data => (<Option key={data.id} value={data.id}
                        search={`${data.id}${data.template_name}`}
                      ><Icon type="file-text" /> {data.template_name}</Option>)
                        )}
                    </OptGroup>
                  </Select>
                </FormItem>
                <Table size="middle" dataSource={contracts} columns={docuCols} showHeader={false}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                  onRow={record => ({
                    onClick: () => { this.handleRowClick(record); },
                  })}
                />
              </Panel>
              <Panel header={this.msg('packingList')} key="packlist">
                <FormItem>
                  <Select
                    placeholder="选择箱单模板"
                    optionFilterProp="search"

                    onChange={this.handleTempSelectChange}
                    style={{ width: '100%' }}
                    value={pakTempId}
                  >
                    <OptGroup>
                      {paktemps.map(data => (<Option key={data.id} value={data.id}
                        search={`${data.id}${data.template_name}`}
                      ><Icon type="file-text" /> {data.template_name}</Option>)
                        )}
                    </OptGroup>
                  </Select>
                </FormItem>
                <Table size="middle" dataSource={packlists} columns={docuCols} showHeader={false}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                  onRow={record => ({
                    onClick: () => { this.handleRowClick(record); },
                  })}
                />
              </Panel>
            </Collapse>
          </div>
        </Sider>
        <Layout>
          <div className="panel-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {docu.docu_type === CMS_DOCU_TYPE.invoice && '发票'}
                {docu.docu_type === CMS_DOCU_TYPE.contract && '合同'}
                {docu.docu_type === CMS_DOCU_TYPE.packingList && '箱单'}
              </Breadcrumb.Item>
              { docu.docu_code &&
                <Breadcrumb.Item>
                  {`${docu.docu_code}`}
                </Breadcrumb.Item>
              }
            </Breadcrumb>
            <div className="toolbar-right">
              <Button icon="file-pdf" onClick={this.handlePDF}>PDF</Button>
            </div>
          </div>
          <Content className="layout-fixed-width layout-fixed-width-large">
            {docu.docu_type === CMS_DOCU_TYPE.invoice && <InvoiceDetails invoice={docu} />}
            {docu.docu_type === CMS_DOCU_TYPE.contract && <ContractDetails invoice={docu} />}
            {docu.docu_type === CMS_DOCU_TYPE.packingList && <PacklistDetails invoice={docu} />}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

