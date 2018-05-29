import moment from 'moment';

function totalPackingPdfBody(custOrderNo, packedNoList, pdfBodyTable) {
  pdfBodyTable.body.push([{ text: '出库总箱单', style: 'title', colSpan: 6 }, '', '', '', '', '']);
  pdfBodyTable.body.push([{ text: '订单号', style: 'tableHeader' },
    { text: (custOrderNo || ''), style: 'tableHeader', colSpan: 2 }, {},
    { text: '总箱数', style: 'tableHeader' },
    { text: packedNoList.length, style: 'tableHeader', colSpan: 2 }, {}]);
  pdfBodyTable.body.push([{ text: '箱号', style: 'table', colSpan: 6 }, '', '', '', '', '']);
  for (let i = 0; i < packedNoList.length; i++) {
    const packedNo = packedNoList[i];
    pdfBodyTable.body.push([{ text: packedNo || '', style: 'table', colSpan: 6 }, '', '', '', '', '']);
  }
  pdfBodyTable.body.push([{ text: '签字', style: 'title', colSpan: 6 }, '', '', '', '', '']);
  pdfBodyTable.body.push([{ text: '打印时间', style: 'tableHeader' },
    { text: moment().format('YYYY年MM月DD日 HH:mm'), style: 'tableHeader' },
    { text: '库管签名', style: 'tableHeader' },
    { text: '', style: 'tableHeader' },
    { text: '运输商签名', style: 'tableHeader' },
    { text: '', style: 'tableHeader' },
  ]);
  pdfBodyTable.body.push([{ text: '运输商信息', style: 'title', colSpan: 6 }, '', '', '', '', '']);
  pdfBodyTable.body.push([{ text: '', style: 'header', colSpan: 6 }, '', '', '', '', '']);
}
export default function printTotalPackingListPdf(outbound, packedNoList) {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [20, 15],
    styles: {
      title: {
        fontSize: 12,
        bold: true,
        alignment: 'center',
        width: '100%',
        margin: [0, 4, 0, 4],
      },
      header: {
        fontSize: 9,
        margin: [0, 10, 0, 10],
      },
      table: {
        fontSize: 10,
        color: 'black',
        alignment: 'center',
        margin: [2, 0, 2, 0],
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: 'black',
        alignment: 'center',
        margin: [2, 2, 2, 2],
      },
      footer: {
        alignment: 'center',
        fontSize: 8,
      },
    },
    defaultStyle: {
      font: 'yahei',
    },
  };
  const pdfBodyTable = { widths: [50, '*', 50, '*', 60, '*'], body: [] };
  totalPackingPdfBody(outbound.cust_order_no, packedNoList, pdfBodyTable);
  docDefinition.content = [
    {
      style: 'table',
      table: pdfBodyTable,
      layout: {
        vLineWidth(i, node) {
          return (i === 0 || i === node.table.widths.length - 1
            || i === node.table.widths.length) ? 1.2 : 0.5;
        },
        hLineWidth(i, node) {
          return (i === 0 || i === 1 || i === node.table.body.length - 1 ||
            i === node.table.body.length) ? 1.2 : 0.5;
        },
      },
    },
  ];
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
