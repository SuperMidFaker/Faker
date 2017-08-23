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
  let barcode0 = textToBase64Barcode(data.courierNoSon, `${data.seq}/${data.expressNum} 子单号 ${data.courierNoSon}`);
  let barcode1 = textToBase64Barcode(data.courierNoSon, `子单号 ${data.courierNoSon}`);
  let bartext = `\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0 母单号  ${data.courierNo}`;
  if (data.courierNoSon === data.courierNo) {
    barcode0 = textToBase64Barcode(data.courierNoSon, `${data.seq}/${data.expressNum} 母单号 ${data.courierNoSon}`);
    barcode1 = textToBase64Barcode(data.courierNoSon, `母单号 ${data.courierNoSon}`);
    bartext = '';
  }
  let pdfcontent = [];
  const imgCod = false; // 判断是否需要显示COD E 的字段
  const imgE = false;
  const titleBody = [{ image: data.sflogo, width: 75, alignment: 'center', border: [true, true, false, false] }];
  if (imgCod) {
    titleBody.push({ image: data.sfCod, width: 70, alignment: 'center', border: [false, true, false, false] });
  }
  if (imgE) {
    titleBody.push({ image: data.sfE, width: 30, alignment: 'center', border: [false, true, false, false] });
  }
  titleBody.push({ image: data.sfNum, width: 80, alignment: 'center', border: [false, true, true, false] });
  const receiverAddr = `${data.outboundHead.receiver_name} ${data.outboundHead.receiver_phone}\n${Location.renderConsignLocation(data.outboundHead, 'receiver', '')}${data.outboundHead.receiver_address}`;
  const senderAddr = `${data.whseInfo.contact} ${data.whseInfo.phone}\n${Location.renderLocation(data.whseInfo, 'province', 'city', 'district', 'street', '')}${data.whseInfo.address}`;
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
            { text: data.whseInfo.express_type, fontSize: 12, alignment: 'center' }],
          ['', { rowSpan: 2, text: '代收贷款\n卡号:\n ￥ ', fontSize: 11, alignment: 'center', border: [true, true, true, true] }],
          [{ text: `${bartext}`, fontSize: 9, alignment: 'center', border: [true, false, true, true] }, ''],
        ],
      },
    },
    { style: 'table',
      table: {
        widths: ['2%', '98%'],
        body: [
          // [{ text: '目的地', border: [true, false] }, { image: data.sf2, width: 200, alignment: 'center', border: [true, false, true] }],
          [{ text: '目的地', border: [true, false] }, { text: data.outboundHead.destcode, fontSize: 16, border: [true, false, true] }],
          ['收件人', {
            text: receiverAddr,
            fontSize: 10,
          }],
          ['寄件人', { text: senderAddr, fontSize: 10 }],
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
        [{ text: '付款方式：寄付月结', border: [true, false, false, false] },
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
          { text: '', border: [false, false, true, false] }],
      ],
    },
  };
  pdfcontent.push(detailTab);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['2%', '58%', '20%', '20%'],
        body: [
          [{ rowSpan: 2, text: '托寄物' }, { rowSpan: 2, colSpan: 2, text: '' }, '',
          { text: '特安服务', fontSize: 10, alignment: 'center', border: [true, true, true, false] }],
          ['', '', '', { text: '自寄 自取', alignment: 'center', border: [true, false, true, false] }],
          [{ rowSpan: 2, text: '备注' }, { text: '', rowSpan: 2 }, { rowSpan: 2, text: '收件员：\n寄件日期：\n派件员：' },
          { text: '签名', border: [true, true, true, false] }],
          ['', '', '', { text: '月  日', alignment: 'right', border: [true, false, true, true] }],
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
            fontSize: 10,
            border: [true, false, true, false],
          }],
          ['寄件人', { text: senderAddr, fontSize: 10 }],
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
        [{ text: '付款方式：', border: [true, false, false, false] },
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
          { text: '', border: [false, false, true, false] }],
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
    pageSize: 'A5',
    pageMargins: [25, 25],
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
