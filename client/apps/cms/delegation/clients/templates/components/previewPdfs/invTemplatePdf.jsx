  function pdfBody(docu, docuBody) {
    const pdf = [];
    const header = [];
    header.push({ text: '序号', style: 'tableHeader' }, { text: '货号', style: 'tableHeader' }, { text: '中文品名', style: 'tableHeader' });
    if (docu.eng_name_en) {
      header.push({ text: '英文品名', style: 'tableHeader' });
    }
    header.push(
      { text: '原产国', style: 'tableHeader' },
      { text: '数量', style: 'tableHeader' },
    );
    if (docu.unit_price_en) {
      header.push({ text: '单价', style: 'tableHeader' });
    }
    header.push(
      { text: '金额', style: 'tableHeader' },
      { text: '净重', style: 'tableHeader' },
    );
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
    return pdf;
  }
  export function invTempPdfDef (docu, trxModes, docuBody) {
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
          'logo',
          [
            { text: 'Invoice', style: 'header'},
            {
              columns: [
                { text: `${docu.subtitle}`, style: 'eachheader' },
                { text: `Invoice No :\n ${docu.docu_no} \nInvoice Date :\n ${moment(docu.date).format('YYYY.MM.DD')}`, style: 'eachheader' },
              ]
            }
          ]
        ],
      };
      docDefinition.content = [
        { columns: [
            { text: `Consignee :  ${docu.consignee || ''}` },
            { text: `买方 Buyer :  ${docu.buyer || ''}` },
          ]
        },
        { columns: [
            { text: `Terms Of Payment :\n ${docu.payment_terms || ''}\nTerms Of Delivery :\n ${trxText}\nInsurance :\n ${docu.insurance || ''}` },
            { text: `Notify contacts\n ${docu.notify || ''}` },
          ]
        },
      ];
      if (docu.smarks_en) {
        docDefinition.content.push({ text: `Shipping Marks\n ${docu.shipping_marks || ''}` });
      }
      docDefinition.content.push({
        style: 'table',
        table: { headerRows: 1, body: pdfBody(docu, docuBody) },
      });
      if (docu.packages_en) {
        docDefinition.content.push({ text: `Number Of Packages:  ${docu.packages || ''}` });
      }
      if (docu.gross_wt_en) {
        docDefinition.content.push({ text: `Gross Weight: ${docu.gross_wt || ''} Kgs` });
      }
      if (docu.remark_en) {
        docDefinition.content.push({ text: `Remark :  ${docu.remark || ''}` });
      }
    }
    return docDefinition;
  }
