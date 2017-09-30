import JsBarcode from 'jsbarcode';
import * as Location from 'client/util/location';

function textToBase64Barcode(text, mark) {
  const canvas = document.createElement('canvas');
  if (mark) {
    JsBarcode(canvas, text, { text: mark, fontSize: 15, height: 35 });
  } else {
    JsBarcode(canvas, text, { displayValue: false, height: 35, marginBottom: 0 });
  }
  return canvas.toDataURL('image/png');
}

function pdfBody(data) {
  const { expressInfo } = data;
  let barcode0 = textToBase64Barcode(data.courierNoSon, `${data.seq}/${expressInfo.parcel_quantity} 子单号 ${data.courierNoSon}`);
  let barcode1 = textToBase64Barcode(data.courierNoSon, `子单号 ${data.courierNoSon}`);
  let bartext = `\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0 母单号  ${data.courierNo}`;
  if (data.courierNoSon === data.courierNo) {
    barcode0 = textToBase64Barcode(data.courierNoSon, `${data.seq}/${expressInfo.parcel_quantity} 母单号 ${data.courierNoSon}`);
    barcode1 = textToBase64Barcode(data.courierNoSon, `母单号 ${data.courierNoSon}`);
    bartext = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
  }
  if (expressInfo.parcel_quantity === 1) {
    barcode0 = textToBase64Barcode(data.courierNoSon, `运单号 ${data.courierNoSon}`);
    barcode1 = textToBase64Barcode(data.courierNoSon, `运单号 ${data.courierNoSon}`);
    bartext = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
  }
  let pdfcontent = [];
  const imgE = false;
  const titleBody = [{ image: data.sflogo, width: 75, alignment: 'center', border: [true, true, false, false] }];
  if (expressInfo.added_services && expressInfo.added_services.indexOf('COD') >= 0) {
    titleBody.push({ image: data.sfCod, width: 70, alignment: 'center', border: [false, true, false, false] });
  } else {
    titleBody.push({ text: '', border: [false, true, false, false] });
  }
  if (imgE) {
    titleBody.push({ image: data.sfE, width: 30, alignment: 'center', border: [false, true, false, false] });
  } else {
    titleBody.push({ text: '', border: [false, true, false, false] });
  }
  titleBody.push({ image: data.sfNum, width: 80, alignment: 'center', border: [false, true, true, false] });
  const receiverAddr = `${expressInfo.receiver_contact} ${expressInfo.receiver_phone}\n${Location.renderConsignLocation(expressInfo, 'receiver', '')}${expressInfo.receiver_address}`;
  const senderAddr = `${expressInfo.sender_contact} ${expressInfo.sender_phone}\n${Location.renderConsignLocation(expressInfo, 'sender', '')}${expressInfo.sender_address}`;
  pdfcontent = [
    { style: 'table',
      table: {
        widths: ['25%', '35%', '15%', '25%'],
        body: [titleBody],
      },
    },
    { style: 'table',
      table: {
        widths: ['60%', '40%'],
        body: [
          [{ rowSpan: 2, image: barcode0, width: 150, alignment: 'center', border: [true, true, true, false] },
            { text: expressInfo.express_type, fontSize: 12, alignment: 'center' }],
          ['', { rowSpan: 2, text: '', fontSize: 11, alignment: 'center', border: [true, true, true, true] }],
          [{ text: `${bartext}`, fontSize: 9, alignment: 'center', border: [true, false, true, true] }, ''],
        ],
      },
    },
    // 代收货款\n卡号：0123456789\n¥3000元
    { style: 'table',
      table: {
        widths: ['2%', '98%'],
        body: [
          // [{ text: '目的地', border: [true, false] }, { image: data.sf2, width: 200, alignment: 'center', border: [true, false, true] }],
          [{ text: '目的地', border: [true, false] }, { text: expressInfo.destcode, fontSize: 18, border: [true, false, true] }],
          ['收件人', {
            text: receiverAddr,
            fontSize: 12,
          }],
          ['寄件人', { text: senderAddr, fontSize: 12 }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    },
  ];
  const detailTab = { style: 'table',
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [{ text: `付款方式：${expressInfo.pay_method}`, border: [true, false, false, false] },
          { text: '计费重量：', border: [false, false, false, false] },
          { text: '标准化包装费：', border: [false, false, false, false] },
          { text: '签单返还：', border: [false, false, true, false] }],
        [{ text: `月结账号：${expressInfo.custid}`, border: [true, false, false, false] },
          { text: '实际重量：', border: [false, false, false, false] },
          { text: '个性化包装费：', border: [false, false, false, false] },
          { text: '转寄协议客户', border: [false, false, true, false] }],
        [{ text: '第三方地区：', border: [true, false, false, false] },
          { text: '声明价值：', border: [false, false, false, false] },
          { text: '超长超重附件费', border: [false, false, false, false] },
          { text: '', border: [false, false, true, false] }],
        [{ text: '费用合计：', border: [true, false, false, false] },
          { text: '报价费用：', border: [false, false, false, false] },
          { text: '易碎件：', border: [false, false, false, false] },
          { text: expressInfo.return_tracking_no ? `签回单号：${expressInfo.return_tracking_no}` : '', border: [false, false, true, false] }],
      ],
    },
  };
  pdfcontent.push(detailTab);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['2%', '58%', '20%', '20%'],
        body: [
          [{ rowSpan: 2, text: '托寄物' }, { rowSpan: 2, colSpan: 2, text: expressInfo.product_name, alignment: 'center', fontSize: 12 }, '',
          { text: '', fontSize: 10, alignment: 'center', border: [true, true, true, false] }],
          ['', '', '', { text: '自寄 自取', alignment: 'center', border: [true, false, true, false] }],
          [{ rowSpan: 2, text: '备注' }, { text: '', rowSpan: 2 }, { rowSpan: 2, text: '收件员：\n寄件日期：\n派件员：' },
          { text: '签名', border: [true, true, true, false] }],
          ['', '', '', { text: '月     日', alignment: 'right', border: [true, false, true, true] }],
        ],
      },
    }
  );
  pdfcontent.push(
    { table: {
      widths: ['30%', '70%'],
      body: [
        [{ image: data.sf3, width: 70, alignment: 'center' },
        { image: barcode1, width: 150, alignment: 'center' }],
      ],
    },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['2%', '98%'],
        body: [
          [{
            text: '收件人',
            border: [true, false, true, false],
          }, {
            text: receiverAddr,
            fontSize: 12,
            border: [true, false, true, false],
          }],
          ['寄件人', { text: senderAddr, fontSize: 12 }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    }
  );
  const detailTab2 = { style: 'table',
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [{ text: `付款方式：${expressInfo.pay_method}`, border: [true, false, false, false] },
          { text: '计费重量：', border: [false, false, false, false] },
          { text: '标准化包装费：', border: [false, false, false, false] },
          { text: '签单返还：', border: [false, false, true, false] }],
        [{ text: `月结账号：${expressInfo.custid}`, border: [true, false, false, false] },
          { text: '实际重量：', border: [false, false, false, false] },
          { text: '个性化包装费：', border: [false, false, false, false] },
          { text: '转寄协议客户', border: [false, false, true, false] }],
        [{ text: '第三方地区：', border: [true, false, false, false] },
          { text: '声明价值：', border: [false, false, false, false] },
          { text: '超长超重附件费', border: [false, false, false, false] },
          { text: '', border: [false, false, true, false] }],
        [{ text: '费用合计：', border: [true, false, false, false] },
          { text: '报价费用：', border: [false, false, false, false] },
          { text: '易碎件：', border: [false, false, false, false] },
          { text: expressInfo.return_tracking_no ? `签回单号：${expressInfo.return_tracking_no}` : '', border: [false, false, true, false] }],
      ],
    },
  };
  pdfcontent.push(detailTab2);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['100%'],
        body: [
          [{ text: '客户自定义内容\n托寄物、订单条码、备注、sku、产品属性、派件要求打印在该区域', alignment: 'center' }],
        ],
      },
    }
  );
  return pdfcontent;
}

export function WaybillDef(data) {
  const docDefinition = {
    pageSize: { width: 400, height: 600 },
    pageMargins: [5, 5],
    content: [],
    styles: {
      table: {
        fontSize: 7,
      },
    },
    defaultStyle: {
      font: 'selfFont',
    },
  };
  docDefinition.content = pdfBody(data);
  return docDefinition;
}

function TrigeminyList(data) {
  const { expressInfo } = data;
  let barcode0 = textToBase64Barcode(data.courierNoSon, `${data.seq}/${expressInfo.parcel_quantity} 子单号 ${data.courierNoSon}`);
  let barcode1 = textToBase64Barcode(data.courierNoSon, `子单号 ${data.courierNoSon}`);
  let bartext = `\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0 母单号  ${data.courierNo}`;
  if (data.courierNoSon === data.courierNo) {
    barcode0 = textToBase64Barcode(data.courierNoSon, `${data.seq}/${expressInfo.parcel_quantity} 母单号 ${data.courierNoSon}`);
    barcode1 = textToBase64Barcode(data.courierNoSon, `母单号 ${data.courierNoSon}`);
    bartext = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
  }
  if (expressInfo.parcel_quantity === 1) {
    barcode0 = textToBase64Barcode(data.courierNoSon, `运单号 ${data.courierNoSon}`);
    barcode1 = textToBase64Barcode(data.courierNoSon, `运单号 ${data.courierNoSon}`);
    bartext = '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0';
  }
  let pdfcontent = [];
  const imgE = false;
  const titleBody = [{ image: data.sflogo, width: 75, margin: [2, 10], alignment: 'center', border: [true, true, false, false] }];
  if (expressInfo.added_services && expressInfo.added_services.indexOf('COD') >= 0) {
    titleBody.push({ image: data.sfCod, margin: [2, 10], width: 70, alignment: 'center', border: [false, true, false, false] });
  } else {
    titleBody.push({ text: '', margin: [2, 10], border: [false, true, false, false] });
  }
  if (imgE) {
    titleBody.push({ image: data.sfE, margin: [2, 10], width: 30, alignment: 'center', border: [false, true, false, false] });
  } else {
    titleBody.push({ text: '', margin: [2, 10], border: [false, true, false, false] });
  }
  titleBody.push({ image: data.sfNum, margin: [2, 10], width: 80, alignment: 'center', border: [false, true, true, false] });
  const receiverAddr = `${expressInfo.receiver_contact} ${expressInfo.receiver_phone}\n${Location.renderConsignLocation(expressInfo, 'receiver', '')}${expressInfo.receiver_address}`;
  const senderAddr = `${expressInfo.sender_contact} ${expressInfo.sender_phone}\n${Location.renderConsignLocation(expressInfo, 'sender', '')}${expressInfo.sender_address}`;
  pdfcontent = [
    { style: 'table',
      table: {
        widths: ['25%', '35%', '15%', '25%'],
        body: [titleBody],
      },
    },
    { style: 'table',
      table: {
        widths: ['60%', '40%'],
        body: [
          [{ rowSpan: 2, image: barcode0, margin: [2, 10], width: 150, alignment: 'center', border: [true, true, true, false] },
            { text: expressInfo.express_type, margin: [2, 10], fontSize: 12, alignment: 'center' }],
          ['', { rowSpan: 2, text: '', fontSize: 11, margin: [2, 10], alignment: 'center', border: [true, true, true, true] }],
          [{ text: `${bartext}`, margin: [2, 10], fontSize: 9, alignment: 'center', border: [true, false, true, true] }, ''],
        ],
      },
    },
    // 代收货款\n卡号：0123456789\n¥3000元
    { style: 'table',
      table: {
        widths: ['3%', '70%', '27%'],
        body: [
          // [{ text: '目的地', border: [true, false] }, { image: data.sf2, width: 200, alignment: 'center', border: [true, false, true] }],
          [{ text: '目的地', fontSize: 9, border: [true, false] }, { colSpan: 2, text: expressInfo.destcode, fontSize: 18, border: [true, false, true] }, ''],
          [{ text: '收件人', fontSize: 9 }, { colSpan: 2, text: receiverAddr, fontSize: 12 }, ''],
          [{ text: '寄件人', fontSize: 9 }, { text: senderAddr, fontSize: 12 }, { text: '定时派送\n自寄自取', alignment: 'center' }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    },
  ];
  const detailTab = { style: 'table',
    table: {
      widths: ['26%', '26%', '26%', '22%'],
      body: [
        [{ text: `付款方式：${expressInfo.pay_method}`, fontSize: 7, margin: [2, 2], border: [true, false, false, false] },
          { text: '计费重量：', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          { text: '包装费用：', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          { rowSpan: 4, text: '签名', fontSize: 7, margin: [2, 2], border: [true, false, true] }],
        [{ text: `月结账号：${expressInfo.custid}`, fontSize: 7, margin: [2, 2], border: [true, false, false, false] },
          { text: '声明价值：', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          { text: '运费：', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          ''],
        [{ text: '第三方地区：', fontSize: 7, margin: [2, 2], border: [true, false, false, false] },
          { text: '保价费用：', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          { text: '费用合计', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          ''],
        [{ text: '实际重量：', fontSize: 7, margin: [2, 2], border: [true, false, false, false] },
          { text: '定时派送：', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          { text: '', fontSize: 7, margin: [2, 2], border: [false, false, false, false] },
          { text: '', fontSize: 7, margin: [2, 2], border: [false, false, false, false] }],
      ],
    },
  };
  pdfcontent.push(detailTab);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['3%', '55%', '20%', '22%'],
        body: [
          [{ text: '托寄物', fontSize: 9 }, { text: expressInfo.product_name, alignment: 'center', fontSize: 12 }, { text: '收件员：\n寄件日期：\n派件员：' },
            { text: '\n\n月     日', alignment: 'right', border: [true, false, true, true] }],
        ],
      },
    }
  );
  pdfcontent.push(
    { table: {
      widths: ['30%', '70%'],
      body: [
        [{ image: data.sf3, width: 70, alignment: 'center' },
            { image: barcode1, width: 150, alignment: 'center' }],
      ],
    },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['3%', '97%'],
        body: [
          [{
            text: '收件人', fontSize: 9, border: [true, false, true, false],
          }, {
            text: receiverAddr,
            fontSize: 12,
            border: [true, false, true, false],
          }],
          [{ text: '寄件人', fontSize: 9 }, { text: senderAddr, fontSize: 12 }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['100%'],
        body: [
          [{ text: '客户自定义内容\n\n\n托寄物、订单条码、备注、sku、产品属性、派件要求打印在该区域\n\n\n\n', alignment: 'center', border: [true, false, true, true] }],
        ],
      },
    }
  );
  pdfcontent.push(
    { table: {
      widths: ['30%', '70%'],
      body: [
        [{ image: data.sf3, width: 70, alignment: 'center' },
          { image: barcode1, width: 150, alignment: 'center' }],
      ],
    },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['3%', '97%'],
        body: [
          [{
            text: '收件人', fontSize: 9, border: [true, false, true, false],
          }, {
            text: receiverAddr,
            fontSize: 12,
            border: [true, false, true, false],
          }],
          [{ text: '寄件人', fontSize: 9 }, { text: senderAddr, fontSize: 12 }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['100%'],
        body: [
          [{ text: '客户自定义内容\n\n\n托寄物、订单条码、备注、sku、产品属性、派件要求打印在该区域\n\n\n\n', alignment: 'center', border: [true, false, true, true] }],
        ],
      },
    }
  );
  return pdfcontent;
}

export function TrigeminyListDef(data) {
  const docDefinition = {
    pageSize: { width: 400, height: 840 },
    pageMargins: [5, 5],
    content: [],
    styles: {
      table: {
        fontSize: 7,
      },
    },
    defaultStyle: {
      font: 'selfFont',
    },
  };
  docDefinition.content = TrigeminyList(data);
  return docDefinition;
}

function podPdfBody(data) {
  const { expressInfo } = data;
  const barcode0 = textToBase64Barcode(expressInfo.return_tracking_no, `回单号 ${expressInfo.return_tracking_no}`);
  const barcode1 = textToBase64Barcode(expressInfo.return_tracking_no, `回单号 ${expressInfo.return_tracking_no}`);
  let pdfcontent = [];
  const imgCod = true; // 判断是否需要显示COD E 的字段

  const titleBody = [{ image: data.sflogo, width: 75, alignment: 'center', border: [true, true, false, false] }];
  if (imgCod) {
    titleBody.push({ image: data.pod, width: 70, alignment: 'center', border: [false, true, false, false] });
  } else {
    titleBody.push({ text: '', border: [false, true, false, false] });
  }
  titleBody.push({ image: data.sfNum, width: 80, alignment: 'center', border: [false, true, true, false] });
  const receiverAddr = `${expressInfo.receiver_contact} ${expressInfo.receiver_phone}\n${Location.renderConsignLocation(expressInfo, 'receiver', '')}${expressInfo.receiver_address}`;
  const senderAddr = `${expressInfo.sender_contact} ${expressInfo.sender_phone}\n${Location.renderConsignLocation(expressInfo, 'sender', '')}${expressInfo.sender_address}`;
  pdfcontent = [
    { style: 'table',
      table: {
        widths: ['25%', '50%', '25%'],
        body: [titleBody],
      },
    },
    { style: 'table',
      table: {
        widths: ['60%', '40%'],
        body: [
          [{ rowSpan: 2, image: barcode0, width: 150, alignment: 'center', border: [true, true, true, false] },
            { text: '签单返还', fontSize: 12, alignment: 'center' }],
          ['', { rowSpan: 2, text: '', fontSize: 11, alignment: 'center', border: [true, true, true, true] }],
          [{ text: '', fontSize: 9, alignment: 'center', border: [true, false, true, true] }, ''],
        ],
      },
    },
    { style: 'table',
      table: {
        widths: ['2%', '98%'],
        body: [
          // [{ text: '目的地', border: [true, false] }, { image: data.sf2, width: 200, alignment: 'center', border: [true, false, true] }],
          [{ text: '目的地', border: [true, false] }, { text: expressInfo.origincode, fontSize: 16, border: [true, false, true] }],
          ['收件人', {
            text: senderAddr,
            fontSize: 12,
          }],
          ['寄件人', { text: receiverAddr, fontSize: 12 }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    },
  ];
  const detailTab = { style: 'table',
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [{ text: `付款方式：${expressInfo.pay_method}`, border: [true, false, false, false] },
          { text: '计费重量：', border: [false, false, false, false] },
          { text: '标准化包装费：', border: [false, false, false, false] },
          { text: '签单返还：', border: [false, false, true, false] }],
        [{ text: '月结账号：', border: [true, false, false, false] },
          { text: '实际重量：', border: [false, false, false, false] },
          { text: '个性化包装费：', border: [false, false, false, false] },
          { text: '转寄协议客户', border: [false, false, true, false] }],
        [{ text: '第三方地区：', border: [true, false, false, false] },
          { text: '声明价值：', border: [false, false, false, false] },
          { text: '超长超重附件费', border: [false, false, false, false] },
          { text: '', border: [false, false, true, false] }],
        [{ text: '费用合计：', border: [true, false, false, false] },
          { text: '报价费用：', border: [false, false, false, false] },
          { text: '易碎件：', border: [false, false, false, false] },
          { text: `主运单号：${data.courierNo}`, border: [false, false, true, false] }],
      ],
    },
  };
  pdfcontent.push(detailTab);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['2%', '58%', '20%', '20%'],
        body: [
          [{ rowSpan: 2, text: '托寄物' }, { rowSpan: 2, colSpan: 2, text: expressInfo.product_name, alignment: 'center', fontSize: 12 }, '',
          { text: '', fontSize: 10, alignment: 'center', border: [true, true, true, false] }],
          ['', '', '', { text: '自寄 自取', alignment: 'center', border: [true, false, true, false] }],
          [{ rowSpan: 2, text: '备注' }, { text: '', rowSpan: 2 }, { rowSpan: 2, text: '收件员：\n寄件日期：\n派件员：' },
          { text: '签名', border: [true, true, true, false] }],
          ['', '', '', { text: '月     日', alignment: 'right', border: [true, false, true, true] }],
        ],
      },
    }
  );
  pdfcontent.push(
    { table: {
      widths: ['30%', '70%'],
      body: [
        [{ image: data.sf3, width: 70, alignment: 'center' },
        { image: barcode1, width: 150, alignment: 'center' }],
      ],
    },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['2%', '98%'],
        body: [
          [{
            text: '收件人',
            border: [true, false, true, false],
          }, {
            text: senderAddr,
            fontSize: 12,
            border: [true, false, true, false],
          }],
          ['寄件人', { text: receiverAddr, fontSize: 12 }],
        ],
      },
      layout: {
        paddingBottom(i, node) { return (node.table.body[i][1].text === '') ? 10 : 1; },
      },
    }
  );
  const detailTab2 = { style: 'table',
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [{ text: `付款方式：${expressInfo.pay_method}`, border: [true, false, false, false] },
          { text: '计费重量：', border: [false, false, false, false] },
          { text: '标准化包装费：', border: [false, false, false, false] },
          { text: '签单返还：', border: [false, false, true, false] }],
        [{ text: '月结账号：', border: [true, false, false, false] },
          { text: '实际重量：', border: [false, false, false, false] },
          { text: '个性化包装费：', border: [false, false, false, false] },
          { text: '转寄协议客户', border: [false, false, true, false] }],
        [{ text: '第三方地区：', border: [true, false, false, false] },
          { text: '声明价值：', border: [false, false, false, false] },
          { text: '超长超重附件费', border: [false, false, false, false] },
          { text: '', border: [false, false, true, false] }],
        [{ text: '费用合计：', border: [true, false, false, false] },
          { text: '报价费用：', border: [false, false, false, false] },
          { text: '易碎件：', border: [false, false, false, false] },
          { text: `主运单号：${data.courierNo}`, border: [false, false, true, false] }],
      ],
    },
  };
  pdfcontent.push(detailTab2);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['100%'],
        body: [
          [{ text: '客户自定义内容\n托寄物、订单条码、备注、sku、产品属性、派件要求打印在该区域', alignment: 'center' }],
        ],
      },
    }
  );
  return pdfcontent;
}

export function podWaybillDef(data) {
  const docDefinition = {
    pageSize: 'A5',
    pageMargins: [20, 6],
    content: [],
    styles: {
      table: {
        fontSize: 8,
      },
    },
    defaultStyle: {
      font: 'selfFont',
    },
  };
  docDefinition.content = podPdfBody(data);
  return docDefinition;
}
