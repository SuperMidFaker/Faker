import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
// import { CMS_DOCU_TYPE } from 'common/constants';
import { Button, Tooltip } from 'antd';
import { injectIntl } from 'react-intl';
import { loadInvImgs } from 'common/reducers/cmsInvoice';

@injectIntl
@connect(
  state => ({
    invData: state.cmsInvoice.invData,
    trxModes: state.cmsInvoice.params.trxModes.map(tm => ({
      key: tm.trx_mode,
      text: `${tm.trx_mode} | ${tm.trx_spec}`,
    })),
    logo: state.cmsInvoice.logo,
    seal: state.cmsInvoice.seal,
  }),
  { loadInvImgs }
)

export default class PreviewPdf extends Component {
  static propTypes = {
    invData: PropTypes.object.isRequired,
    trxModes: PropTypes.array.isRequired,
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
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.invData.imgs !== this.props.invData.imgs) {
      let logoUrl = 'https://suso-img.b0.upaiyun.com/2018/2/9/52982a4fd0b22b6db28a6628c3268527-1518173100678.png';
      let sealUrl = 'https://suso-img.b0.upaiyun.com/2018/2/9/40%E6%B5%B7%E5%85%B3-%E7%BA%BF%E6%80%A7-1518173262699.png';
      if (nextProps.invData.imgs.filter(img => img.img_type === 0)[0]) {
        logoUrl = nextProps.invData.imgs.filter(img => img.img_type === 0)[0].url;
      }
      if (nextProps.invData.imgs.filter(img => img.img_type === 1)[0]) {
        sealUrl = nextProps.invData.imgs.filter(img => img.img_type === 1)[0].url;
      }
      this.props.loadInvImgs({ logoUrl, sealUrl });
    }
  }
  headBody = (docu, trxText) => {
    const body = [
      [{
        text: [
          { text: 'Consignee :\n', style: 'subheader' },
          { text: `${docu.consignee || ''}`, style: 'headContent' },
        ],
      },
      {
        text: [
          { text: '买方 Buyer :\n', style: 'subheader' },
          { text: `${docu.buyer || ''}`, style: 'headContent' },
        ],
      }],
      [{
        stack: [
          { text: 'Terms Of Payment :', style: 'subheader' },
          { text: `${docu.payment_terms || ''}`, style: 'headContent' },
          { text: 'Terms Of Delivery :', style: 'subheader' },
          { text: `${trxText}`, style: 'headContent' },
          { text: 'Insurance :', style: 'subheader' },
          { text: `${docu.insurance || ''}`, style: 'headContent' },
        ],
      }, {
        text: [
          { text: 'Notify contacts\n', style: 'subheader' },
          { text: `${docu.notify || ''}`, style: 'headContent' },
        ],
      }],
    ];
    if (docu.smarks_en) {
      body.push([{
        text: [
          { text: 'Shipping Marks\n', style: 'subheader' },
          { text: `${docu.shipping_marks || ''}`, style: 'headContent' },
        ],
        colSpan: 2,
      }]);
    }
    return body;
  }

  pdfBody = (docu, docuBody) => {
    const pdf = [];
    const header = [];
    const widths = ['7%', '10%', '15%'];
    header.push({ text: '序号', style: 'tableHeader' }, { text: '货号', style: 'tableHeader' }, { text: '中文品名', style: 'tableHeader' });
    if (docu.eng_name_en) {
      header.push({ text: '英文品名', style: 'tableHeader' });
      widths.push('15%');
    }
    header.push(
      { text: '原产国', style: 'tableHeader' },
      { text: '数量', style: 'tableHeader' },
    );
    widths.push('10%', '10%');
    if (docu.unit_price_en) {
      header.push({ text: '单价', style: 'tableHeader' });
      widths.push('*');
    }
    header.push(
      { text: '金额', style: 'tableHeader' },
      { text: '净重', style: 'tableHeader' },
    );
    widths.push('*', '*');
    pdf.push(header);
    for (let i = 0; i < docuBody.length; i++) {
      const dbody = docuBody[i];
      const body = [];
      body.push(`${dbody.g_no}`, `${dbody.cop_g_no || ''}`, `${dbody.g_name || ''}`);
      if (docu.eng_name_en) {
        body.push(`${dbody.en_name || ''}`);
      }
      body.push(`${dbody.orig_country || ''}`);
      body.push({ text: `${dbody.g_qty || 0}`, alignment: 'right' });
      if (docu.unit_price_en) {
        body.push({ text: `${dbody.dec_price || 0}`, alignment: 'right' });
      }
      body.push({ text: `${dbody.trade_total || 0}`, alignment: 'right' });
      body.push({ text: `${dbody.wet_wt || 0}`, alignment: 'right' });
      pdf.push(body);
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
      footer.push('小计', '', '');
      if (docu.eng_name_en) {
        footer.push('');
      }
      footer.push('');
      footer.push({ text: `${(sumval.g_qty).toFixed(3)}`, alignment: 'right' });
      if (docu.unit_price_en) {
        footer.push({ text: `${(sumval.dec_price).toFixed(3)}`, alignment: 'right' });
      }
      footer.push({ text: `${(sumval.trade_total).toFixed(3)}`, alignment: 'right' });
      footer.push({ text: `${(sumval.wet_wt).toFixed(3)}`, alignment: 'right' });
      pdf.push(footer);
    }
    const bodytable = { headerRows: 1, widths, body: pdf };
    return bodytable;
  }
  invTempPdfDef = (docu, trxModes, docuBody) => {
    const trxmode = trxModes.find(trx => trx.key === docu.trxn_mode);
    const trxText = trxmode ? trxmode.text : '';
    const docDefinition = {
      content: [],
      pageMargins: [40, 120, 40, 120],
      styles: {
        header: {
          fontSize: 13,
          bold: true,
          alignment: 'left',
          margin: [100, 20, 2, 10],
        },
        subtitle: {
          fontSize: 10,
          bold: true,
          color: 'black',
          margin: [100, 4, 2, 4],
        },
        subheader: {
          fontSize: 10,
          bold: true,
          color: 'black',
          margin: [4, 2, 2, 2],
        },
        headContent: {
          fontSize: 9,
          bold: false,
          margin: [8, 2, 2, 2],
        },
        table: {
          fontSize: 9,
          margin: [2, 2, 2, 2],
        },
        tableHeader: {
          fontSize: 9,
          color: 'black',
          margin: [2, 2, 2, 2],
        },
        bottom: {
          fontSize: 8,
          bold: false,
          margin: [10, 10, 2, 10],
        },
        footTable: {
          fontSize: 8,
          bold: false,
          margin: [40, 40],
        },
      },
      defaultStyle: {
        font: 'yahei',
      },
    };
    // if (docu.docu_type === CMS_DOCU_TYPE.invoice) {
    let hbodyHeight = [70, '*'];
    if (docu.smarks_en) {
      hbodyHeight = [70, '*', 70];
    }
    docDefinition.header = {
      columns: [
        {
          image: this.props.logo,
          width: 70,
          margin: [20, 20, 20, 20],
        },
        [{ text: 'Invoice', style: 'header' },
          {
            columns: [
              { text: `${docu.subtitle || ''}`, style: 'subtitle' },
              {
                stack: [
                  { text: 'Invoice No :', style: 'subheader' },
                  { text: `${docu.docu_no || ''}`, style: 'headContent' },
                  { text: 'Invoice Date :', style: 'subheader' },
                  { text: `${moment(docu.date).format('YYYY.MM.DD') || ''}`, style: 'headContent' },
                ],
              },
            ],
          },
        ],
      ],
    };
    docDefinition.content = [
      {
        style: 'table',
        table: {
          widths: '50%',
          heights: hbodyHeight,
          body: this.headBody(docu, trxText),
        },
        layout: {
          hLineWidth(i, node) {
            return (i === 0 || i === node.table.body.length) ? 1.5 : 1;
          },
          vLineWidth(i, node) {
            return (i === 0 || i === node.table.widths.length) ? 0 : 1;
          },
          hLineColor(i, node) {
            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
          },
          vLineColor(i, node) {
            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
          },
        },
      },
      {
        style: 'table',
        table: this.pdfBody(docu, docuBody),
        layout: {
          hLineWidth(i, node) {
            return (i === 0 || i === node.table.body.length) ? 1.5 : 1;
          },
          vLineWidth(i, node) {
            return (i === 0 || i === node.table.widths.length) ? 0 : 1;
          },
          hLineColor(i, node) {
            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
          },
          vLineColor(i, node) {
            return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
          },
        },
      },
    ];
    docDefinition.content.push({
      image: this.props.seal,
      width: 75,
      relativePosition: { x: 300, y: -20 },
    });
    if (docu.packages_en) {
      docDefinition.content.push({ text: `Number Of Packages:  ${docu.packages || ''}`, style: 'bottom' });
    }
    if (docu.gross_wt_en) {
      docDefinition.content.push({ text: `Gross Weight: ${docu.gross_wt || ''} Kgs`, style: 'bottom' });
    }
    if (docu.remark_en) {
      docDefinition.content.push({ text: `Remark :  \n${docu.remark || ''}`, style: 'bottom' });
    }
    docDefinition.footer = {
      style: 'footTable',
      table: {
        heights: [60],
        widths: '33%',
        body: [[
          { text: `${docu.footer1 || ''}`, border: [false, true, false, false] },
          { text: `${docu.footer2 || ''}`, border: [false, true, false, false] },
          { text: `${docu.footer3 || ''}`, border: [false, true, false, false] },
        ]],
      },
    };
    // }
    return docDefinition;
  }
  handlePreview = () => {
    const {
      invData, trxModes,
    } = this.props;
    const docuBody = [{
      g_no: 1, g_name: 'example1', g_qty: 2, dec_price: 5, trade_total: 10, wet_wt: 50,
    }, {
      g_no: 2, g_name: 'example2', g_qty: 3, dec_price: 3, trade_total: 9, wet_wt: 78,
    }, {
      g_no: 3, g_name: 'example3', g_qty: 6, dec_price: 7, trade_total: 42, wet_wt: 90,
    }];
    const docDefinition = this.invTempPdfDef(invData, trxModes, docuBody);
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
  render() {
    return (
      <Tooltip title="预览" placement="bottom">
        <Button icon="printer" onClick={this.handlePreview} />
      </Tooltip>
    );
  }
}
