import moment from 'moment';
import { CMS_DOCU_TYPE } from 'common/constants';

  function getBase64FromImageUrl(url) {
    const img = new Image();
    img.src = url;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }

  function headBody(docu, trxText) {
    const body = [
      [{ stack: [
          { text: `Consignee :`, style: 'subheader' },
          { text: `${docu.consignee || ''}`, style: 'headContent' }
        ]},
      { stack: [
          { text: '买方 Buyer :', style: 'subheader' },
          { text: `${docu.buyer || ''}` , style: 'headContent'}
        ],
      }],
      [{stack: [
        { text: `Terms Of Payment :`, style: 'subheader' },
        { text: `${docu.payment_terms || ''}`, style: 'headContent' },
        { text: 'Terms Of Delivery :', style: 'subheader' },
        { text: `${trxText}` , style: 'headContent'},
        { text: 'Insurance :', style: 'subheader' },
        { text: `${docu.insurance || ''}` , style: 'headContent'}
      ]},{
        stack: [
          { text: 'Notify contacts', style: 'subheader' },
          { text: `${docu.notify || ''}` , style: 'headContent'}
        ]
      }]
    ];
    if (docu.smarks_en) {
      body.push([{ text: `Shipping Marks\n ${docu.shipping_marks || ''}`, style: 'subheader', colSpan: 2, },'']);
    }
    return body;
  }

  function pdfBody(docu, docuBody) {
    const pdf = [];
    const header = [];
    let widths = ['8%', '10%', '20%'];
    header.push({ text: '序号', style: 'tableHeader' }, { text: '货号', style: 'tableHeader' }, { text: '中文品名', style: 'tableHeader' });
    if (docu.eng_name_en) {
      header.push({ text: '英文品名', style: 'tableHeader' });
      widths.push('*');
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
      body.push(`${dbody.g_no}`, `${dbody.cop_g_no}`, `${dbody.g_name}`);
      if (docu.eng_name_en) {
        body.push(`${dbody.en_name || ''}`);
      }
      body.push(`${dbody.orig_country}`);
      body.push({ text: `${dbody.g_qty || 0}`, alignment: 'right' });
      if (docu.unit_price_en) {
        body.push({ text: `${dbody.dec_price || 0}`, alignment: 'right' });
      }
      body.push({ text: `${dbody.trade_total || 0}`, alignment: 'right' });
      body.push(`${dbody.wet_wt}`);
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
  export function invTempPdfDef (docu, trxModes, docuBody) {
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
          margin: [60, 20, 2, 10],
        },
        subtitle: {
          fontSize: 10,
          bold: true,
          color: 'black',
          margin: [60, 4, 2, 4],
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
          fontSize: 10,
          color: 'black',
          margin: [2, 5, 2, 5],
        },
        tableHeader: {
          fontSize: 11,
          bold: false,
          margin: [2, 5, 2, 5],
        },
        bottom: {
          fontSize: 10,
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
        columnGap: 20,
      },
    };
    let logoUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
    const logoFilter = docu.imgs.filter(img => img.img_type === 0)[0];
    if (logoFilter) {
      logoUrl = logoFilter.url;
    }
    const logo = getBase64FromImageUrl(logoUrl);
    // console.log('logo', logo);
    // if (docu.docu_type === CMS_DOCU_TYPE.invoice) {
      let hbodyHeight = ["*", "*"];
      if (docu.smarks_en) {
        hbodyHeight = ["*", "*", 70];
      }
      docDefinition.header = {
        // margin: 10,
        columns: [
          {
            image: logo,
            width: 120,
            margin: [20, 0, 20, 20],
          },
          [ { text: 'Invoice', style: 'header'},
            { columns: [
                { text: `${docu.subtitle || ''}`, style: 'subtitle' },
                { stack: [
                  { text: 'Invoice No :', style: 'subheader'},
                  { text: `${docu.docu_no || ''}`, style: 'headContent'},
                  { text: 'Invoice Date :', style: 'subheader'},
                  { text: `${moment(docu.date).format('YYYY.MM.DD') || ''}`, style: 'headContent'},
                ]},
              ]
            }
          ],
        ]
      };
      docDefinition.content = [
        {
          style: 'table',
          table: {
            widths: '50%',
            heights: hbodyHeight,
            body: headBody(docu, trxText),
          }
        },
      ];
      docDefinition.content.push({
        style: 'table',
        table: pdfBody(docu, docuBody),
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
            { text: `${docu.footer3 || ''}`, border: [false, true, false, false]}
          ]]
        },
      };
    // }
    return docDefinition;
  }
