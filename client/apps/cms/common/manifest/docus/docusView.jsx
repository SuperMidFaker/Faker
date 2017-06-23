import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import moment from 'moment';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Collapse, Button, Breadcrumb, Table, Select, Icon, Form, message } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTempParams, loadDocuDatas, loadDocuBody, loadInvTemplates, updateDocuTemplate, setDocu } from 'common/reducers/cmsInvoice';
import InvoiceDetails from './invoiceDetails';
import ContractDetails from './contractDetails';
import PacklistDetails from './packlistDetails';
import { CMS_DOCU_TYPE } from 'common/constants';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;

function fetchData({ state, dispatch, params }) {
  const proms = [
    dispatch(loadTempParams()),
    dispatch(loadDocuDatas({ billSeqNo: params.billseqno })),
    dispatch(loadInvTemplates({ tenantId: state.account.tenantId, docuType: [0, 1, 2] }))];
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billMeta: state.cmsManifest.billMeta,
    docuDatas: state.cmsInvoice.docuDatas,
    invTemplates: state.cmsInvoice.invTemplates,
    docu: state.cmsInvoice.docu,
    docuBody: state.cmsInvoice.docuBody,
  }),
  { loadTempParams, loadDocuDatas, loadDocuBody, loadInvTemplates, updateDocuTemplate, setDocu }
)

export default class DocuView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    docuDatas: PropTypes.array.isRequired,
    invTemplates: PropTypes.array.isRequired,
    docu: PropTypes.object.isRequired,
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.docuDatas !== this.props.docuDatas) {
      const invoices = nextProps.docuDatas.filter(dt => dt.docu_type === 0);
      const contracts = nextProps.docuDatas.filter(dt => dt.docu_type === 1);
      const packlists = nextProps.docuDatas.filter(dt => dt.docu_type === 2);
      if (this.props.docu) {
        this.props.loadDocuBody(nextProps.docu.id);
      } else {
        const docu = invoices.length > 0 ? invoices[0] : {};
        this.props.setDocu(docu);
        this.props.loadDocuBody(docu.id);
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
  handleBack = () => {
    this.context.router.goBack();
  }
  handleTempSelectChange = (value) => {
    this.props.updateDocuTemplate({ tempId: value, docu: this.props.docu }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadDocuDatas({ billSeqNo: this.props.billMeta.bill_seq_no });
      }
    });
  }
  handlePanelChange = (key) => {
    const { invoices, contracts, packlists } = this.state;
    if (key === 'invoice') {
      const docu = invoices.length > 0 ? invoices[0] : {};
      this.props.setDocu(docu);
    } else if (key === 'contract') {
      const docu = contracts.length > 0 ? contracts[0] : {};
      this.props.setDocu(docu);
    } else if (key === 'packlist') {
      const docu = packlists.length > 0 ? packlists[0] : {};
      this.props.setDocu(docu);
    }
  }
  pdfBody = () => {
    const { docu, docuBody } = this.props;
    const pdf = [];
    const header = [];
    header.push({ text: '中文品名 g_name', style: 'tableHeader' });
    if (docu.eng_name_en) {
      header.push({ text: '英文品名 en_name', style: 'tableHeader' });
    }
    if (docu.docu_type === CMS_DOCU_TYPE.packingList) {
      header.push(
        { text: '型号 g_model', style: 'tableHeader' },
        { text: '原产国 country', style: 'tableHeader' },
        { text: '数量 qty', style: 'tableHeader' },
        { text: '净重 net', style: 'tableHeader' },
      );
      if (docu.containerno_en) {
        header.push({ text: '箱号 container_no', style: 'tableHeader' });
      }
      pdf.push(header);
      for (let i = 0; i < docuBody.length; i++) {
        const dbody = docuBody[i];
        const body = [];
        body.push(`${dbody.g_name}`);
        if (docu.eng_name_en) {
          body.push(`${dbody.en_name || ''}`);
        }
        body.push(`${dbody.g_model}`, `${dbody.orig_country}`, `${dbody.g_qty}`, `${dbody.wet_wt}`);
        if (docu.containerno_en) {
          body.push(`${dbody.container_no}`);
        }
        pdf.push(body);
      }
    } else {
      header.push(
        { text: '型号 g_model', style: 'tableHeader' },
        { text: '原产国 country', style: 'tableHeader' },
        { text: '数量 qty', style: 'tableHeader' },
        { text: '金额 amount', style: 'tableHeader' },
        { text: '币制 currency', style: 'tableHeader' },
      );
      if (docu.unit_price_en) {
        header.push({ text: '单价 unit_price', style: 'tableHeader' });
      }
      pdf.push(header);
      for (let i = 0; i < docuBody.length; i++) {
        const dbody = docuBody[i];
        const body = [];
        body.push(`${dbody.g_name}`);
        if (docu.eng_name_en) {
          body.push(`${dbody.en_name || ''}`);
        }
        body.push(`${dbody.g_model}`, `${dbody.orig_country}`, `${dbody.g_qty}`, `${dbody.trade_total}`, `${dbody.trade_curr}`);
        if (docu.unit_price_en) {
          body.push(`${dbody.dec_price}`);
        }
        pdf.push(body);
      }
    }
    if (docu.sub_total_en) {
      const footer = [];
      const sumval = docuBody.reduce((a, b) => ({
        g_qty: a.g_qty + b.g_qty,
        trade_total: Number(a.trade_total + b.trade_total),
        dec_price: Number(a.dec_price + b.dec_price),
        wet_wt: Number(a.wet_wt + b.wet_wt),
      }), {
        g_qty: 0,
        trade_total: 0,
        dec_price: 0,
        wet_wt: 0,
      });
      footer.push('小计');
      if (docu.eng_name_en) {
        footer.push('');
      }
      if (docu.docu_type === CMS_DOCU_TYPE.packingList) {
        footer.push('', '', sumval.g_qty, sumval.wet_wt);
        if (docu.containerno_en) {
          footer.push('');
        }
      } else {
        footer.push('', '', sumval.g_qty, sumval.trade_total, '');
        if (docu.unit_price_en) {
          footer.push(sumval.dec_price);
        }
      }
      pdf.push(footer);
    }
    return pdf;
  }
  handleDocDef = () => {
    const { docu } = this.props;
    const docDefinition = {
      content: [],
      styles: {
        header: {
          fontSize: 16,
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
      defaultStyle: { },
    };
    if (docu.docu_type === CMS_DOCU_TYPE.invoice) {
      docDefinition.content = [
        { text: '发票 Invoice', style: 'header' },
        { text: `发票编号 Invoice No :  ${docu.docu_no}` },
        { text: `日期 Invoice Date :  ${moment(docu.date).format('YYYY.MM.DD')}` },
        { text: `买方 Buyer :  ${docu.buyer || ''}` },
        { text: `卖方 Seller :  ${docu.seller || ''}` },
        { style: 'table',
          table: { body: this.pdfBody() },
        },
        { text: `付款条件 Terms Of Payment :  ${docu.payment_terms || ''}` },
        { text: `成交方式 Terms Of Delivery :  ${docu.trxn_mode || ''}` },
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
      docDefinition.content = [
        { text: '合同 Contract', style: 'header' },
        { text: `合同号 Contract No :  ${docu.docu_no}` },
        { text: `日期 Date :  ${moment(docu.date).format('YYYY.MM.DD')}` },
        { text: `买方 Buyer :  ${docu.buyer || ''}` },
        { text: `卖方 Seller :  ${docu.seller || ''}` },
        { text: '兹经买卖双方同意，由买方购进，卖方出售下列货物，并按下列条款签订本合同：' },
        { style: 'table',
          table: { body: this.pdfBody() },
        },
        { text: `付款条件 Terms Of Payment :  ${docu.payment_terms || ''}` },
        { text: `成交方式 Terms Of Delivery :  ${docu.trxn_mode || ''}` },
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
      docDefinition.content = [
        { text: '箱单 PackingList', style: 'header' },
        { text: `发票号 Invoice No :  ${docu.docu_no}` },
        { text: `日期 Date :  ${moment(docu.date).format('YYYY.MM.DD')}` },
        { text: `买方 Buyer :  ${docu.buyer || ''}` },
        { text: `卖方 Seller :  ${docu.seller || ''}` },
        { style: 'table',
          table: { body: this.pdfBody() },
        },
        { text: `付款条件 Terms Of Payment :  ${docu.payment_terms || ''}` },
        { text: `成交方式 Terms Of Delivery :  ${docu.trxn_mode || ''}` },
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
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = this.handleDocDef();
    pdfMake.createPdf(docDefinition).open();
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { billMeta } = this.props;
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
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                <a onClick={this.handleBack}>{billMeta.bill_seq_no}</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                随附单据
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel" >
            <Collapse accordion defaultActiveKey="invoice" onChange={this.handlePanelChange}>
              <Panel header={this.msg('invoice')} key="invoice">
                <FormItem label="模板：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="选择发票模板"
                    optionFilterProp="search"
                    size="large"
                    onChange={this.handleTempSelectChange}
                    style={{ width: 150 }}
                    allowClear
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
                <Table size="middle" dataSource={invoices} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
              <Panel header={this.msg('contract')} key="contract">
                <FormItem label="模板：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="选择合同模板"
                    optionFilterProp="search"
                    size="large"
                    onChange={this.handleTempSelectChange}
                    style={{ width: 150 }}
                    allowClear
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
                <Table size="middle" dataSource={contracts} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
              <Panel header={this.msg('packingList')} key="packlist">
                <FormItem label="模板：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="选择箱单模板"
                    optionFilterProp="search"
                    size="large"
                    onChange={this.handleTempSelectChange}
                    style={{ width: 150 }}
                    allowClear
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
                <Table size="middle" dataSource={packlists} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
            </Collapse>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {billMeta.bill_seq_no}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                随附单据
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {`${docu.docu_code}`}
              </Breadcrumb.Item>
            </Breadcrumb>
          }
            <ButtonToggle size="large"
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <span />
            <div className="top-bar-tools">
              <Button icon="file-pdf" onClick={this.handlePDF}>PDF</Button>
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            {docu.docu_type === CMS_DOCU_TYPE.invoice && <InvoiceDetails invoice={docu} />}
            {docu.docu_type === CMS_DOCU_TYPE.contract && <ContractDetails invoice={docu} />}
            {docu.docu_type === CMS_DOCU_TYPE.packingList && <PacklistDetails invoice={docu} />}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

