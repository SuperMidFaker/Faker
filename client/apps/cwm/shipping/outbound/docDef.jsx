import JsBarcode from 'jsbarcode';

function textToBase64Barcode(text) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, { format: 'CODE39', text: `子单号 ${text}` });
  return canvas.toDataURL('image/png');
}

// function encodeImageFileAsURL(image, callback) {
//   const xhr = new XMLHttpRequest();
//   const png = image;
//   xhr.open('GET', png, true);
//   xhr.responseType = 'blob';
//   xhr.onload = function (e) {
//     const reader = new FileReader();
//     reader.onload = function (event) {
//       console.log('onload');
//       const imgcode = event.target.result;
//       callback(imgcode);
//     };
//     const file = this.response;
//     reader.readAsDataURL(file);
//   };
//   xhr.send();
// }
// function encodeImageFileAsURL(images) {
//   var xhr = new XMLHttpRequest();
//   let imagesOK = 0;
//   const imgcodes = [];
//   for (var i = 0; i < images.length; i++) {
//     const png = images[i];
//     xhr.open("GET", png, true);
//     xhr.responseType = "blob";
//     xhr.onload = function (e) {
//       var reader = new FileReader();
//       reader.onload = function(event) {
//         imagesOK++;
//         console.log('onload', imagesOK);
//         var imgcode = event.target.result;
//         imgcodes.push(imgcode);
//         if (imagesOK >= images.length) {
//           callback(imgcodes);
//         }
//       }
//       var file = this.response;
//       reader.readAsDataURL(file)
//     };
//     xhr.send();
//   }
// }

function pdfBody() {
  const barcode1 = textToBase64Barcode('123456789123');
  let pdfcontent = [];
  pdfcontent = [
    { style: 'table',
      table: {
        widths: ['60%', '40%'],
        body: [
          [{ colSpan: 2, text: 'logo', fontSize: 14 }, {}],
          [{ rowSpan: 2, image: barcode1, width: 150, alignment: 'center' }, { text: '顺丰隔日', fontSize: 10 }],
          ['', { text: '代收贷款\n卡号:\n ￥ ', fontSize: 10 }],
        ],
      },
    },
    { style: 'table',
      table: {
        widths: ['10%', '90%'],
        body: [
          [{ text: '目的地', border: [true, false] }, { text: '', border: [true, false, true] }],
          ['收件人', { text: 'name num\naddress', fontSize: 10 }],
          ['寄件人', { text: 'name num\naddress', fontSize: 10 }],
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
  pdfcontent.push(detailTab);
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['10%', '50%', '20%', '20%'],
        body: [
          [{ rowSpan: 2, text: '托寄物' }, { rowSpan: 2, colSpan: 2, text: '' }, '',
          { text: '特安服务', fontSize: 11, alignment: 'center', border: [true, true, true, false] }],
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
          ['', { image: barcode1, width: 150, alignment: 'center' }],
      ],
    },
    }
  );
  pdfcontent.push(
    { style: 'table',
      table: {
        widths: ['10%', '90%'],
        body: [
          [{ text: '目的地', border: [true, false] }, { text: '', border: [true, false, true] }],
          ['收件人', { text: 'name num\naddress', fontSize: 10 }],
          ['寄件人', { text: 'name num\naddress', fontSize: 10 }],
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

export function WaybillDef() {
  // const images = ['public/assets/img/sf1.png', 'public/assets/img/sf2.png','public/assets/img/sf3.png', 'public/assets/img/sf4.png'];
  // for (var i = 0; i < images.length; i++) {
  //   encodeImageFileAsURL(images[i], function(data) { imgcodes.push(data); console.log('RESULT:', data) });
  // }
  // // encodeImageFileAsURL(images, function(data) { console.log('RESULT:', data) });
  const docDefinition = {
    pageSize: 'A5',
    pageMargins: [25, 25],
    content: [],
    styles: {
      table: {
        fontSize: 6,
      },
    },
    defaultStyle: {
      font: 'yahei',
    },
  };
  // const barcode = canvas.toDataURL((err, png) =>
  //   JsBarcode("#barcode", "123456789123", {
  //     text: '子单号 123456789123',
  //     fontSize: 20,
  //     width:4,
  //     height:40,
  //   }));
  docDefinition.content = pdfBody();
  return docDefinition;
}
