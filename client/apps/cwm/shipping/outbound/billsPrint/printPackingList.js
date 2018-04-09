function packDetailPdfBody(packDetails, pdfBodyTable) {
  pdfBodyTable.body.push([{ text: '货物明细', style: 'title', colSpan: 5 }, '', '', '', '']);
  const bodyHeader = [];
  pdfBodyTable.widths.push(100);
  bodyHeader.push({ text: 'SU号', style: 'tableHeader' });
  pdfBodyTable.widths.push(100);
  bodyHeader.push({ text: '商品货号', style: 'tableHeader' });
  pdfBodyTable.widths.push(120);
  bodyHeader.push({ text: '产品名称', style: 'tableHeader' });
  pdfBodyTable.widths.push('*');
  bodyHeader.push({ text: '数量', style: 'tableHeader' });
  pdfBodyTable.widths.push(120);
  bodyHeader.push({ text: '集箱号', style: 'tableHeader' });
  pdfBodyTable.body.push(bodyHeader);
  let totalQty = 0;
  for (let i = 0; i < packDetails.length; i++) {
    const data = packDetails[i];
    pdfBodyTable.body.push([data.serial_no || '', data.product_no || '', data.name || '', data.chkpacked_qty,
      data.packed_no || '']);
    totalQty += data.chkpacked_qty;
  }
  if (packDetails.length !== 16) {
    pdfBodyTable.body.push(['', '', '', '', '']);
  }
  pdfBodyTable.body.push(['合计', '', '', totalQty, '']);
}
export default function printPackListPdf(packDetails) {
  const docDefinition = {
    pageOrientation: 'landscape',
    pageSize: 'A4',
    pageMargins: [20, 15],
    styles: {
      title: {
        fontSize: 18,
        bold: true,
        alignment: 'center',
        width: '100%',
        margin: [0, 0, 0, 8],
      },
      header: {
        fontSize: 10,
        margin: [0, 3, 0, 4],
      },
      table: {
        fontSize: 11,
        color: 'black',
        alignment: 'center',
        margin: [2, 2, 2, 2],
      },
      tableHeader: {
        fontSize: 11,
        bold: true,
        color: 'black',
        alignment: 'center',
        margin: [2, 5, 2, 5],
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
  let num = 0;
  if (packDetails.length > 23) {
    num = 30 - ((packDetails.length - 23) % 30);
  } else {
    num = 23 - packDetails.length;
  }
  const pdfBodyTable = { widths: [], body: [] };
  packDetailPdfBody(packDetails, pdfBodyTable);
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
        paddingBottom(i, node) { return (node.table.body[i][0].text === '') ? 10 * num : 1; },
      },
    },
  ];
  docDefinition.footer = (currentPage, pageCount) => ({ text: `第 ${currentPage.toString()}页，共 ${pageCount}页`, style: 'footer' });
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
