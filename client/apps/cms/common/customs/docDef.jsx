
function pdfHeader(head, declWayCode) {
  let headContent = [];
  if (declWayCode === 'IBND') {
    headContent = [
      { columns: [
        { text: '中华人民共和国海关进境货物备案清单', style: 'title' },
      ] },
      { columns: [
        { text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: ['40%', '15%', '15%', '15%', '15%'],
          body: [
            [{ text: `收发货人   ${head.trade_name || ''}`, style: 'tableCell' },
            { text: `进境口岸   ${head.i_e_port || ''}` },
            { text: `备案号   ${head.manual_no || ''}` },
            { text: `进境日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `消费使用单位   ${head.owner_name || ''}` },
            { text: `监管方式   ${head.trade_mode || ''}` },
            { text: `贸易国(地区)   ${head.trade_country || ''}` },
            { text: `启运国(地区)   ${head.dept_dest_country || ''}` },
            { text: `境内目的地   ${head.district_code || ''}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ colSpan: 2, text: `申报单位   ${head.agent_name || ''}` },
            {},
            { text: `运输方式   ${head.traf_mode || ''}` },
            { text: `运输工具名称   ${head.traf_name || ''}` },
            { text: `提运单号   ${head.bl_wb_no || ''}` }],
            [{ text: `许可证号   ${head.license_no || ''}` },
            { text: `成交方式   ${head.trxn_mode || ''}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `件数   ${head.pack_count || ''}` },
            { text: `毛重(千克)   ${head.gross_wt || ''}` },
            { text: `净重(千克)   ${head.net_wt || ''}` },
            { colSpan: 2, text: `随附单证   ${head.cert_mark || ''}` }, {}],
            [{ rowSpan: 3, colSpan: 5, text: `标记唛码及备注   ${head.note || ''}\n\n` }], [], [],
          ],
        },
      },
    ];
  } else if (declWayCode === 'EBND') {
    headContent = [
      { columns: [
        { text: '中华人民共和国海关出境货物备案清单', style: 'title' },
      ] },
      { columns: [
        { text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: ['40%', '15%', '15%', '15%', '15%'],
          body: [
            [{ text: `收发货人   ${head.trade_name || ''}` },
            { text: `出境口岸   ${head.i_e_port || ''}` },
            { text: `备案号   ${head.manual_no || ''}` },
            { text: `出境日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `消费使用单位   ${head.owner_name || ''}` },
            { text: `监管方式   ${head.trade_mode || ''}` },
            { text: `贸易国(地区)   ${head.trade_country || ''}` },
            { text: `运抵国(地区)   ${head.dept_dest_country || ''}` },
            { text: `境内货源地   ${head.district_code || ''}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ colSpan: 2, text: `申报单位   ${head.agent_name || ''}` },
            {},
            { text: `运输方式   ${head.traf_mode || ''}` },
            { text: `运输工具名称   ${head.traf_name || ''}` },
            { text: `提运单号   ${head.bl_wb_no || ''}` }],
            [{ text: `许可证号   ${head.license_no || ''}` },
            { text: `成交方式   ${head.trxn_mode || ''}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `件数   ${head.pack_count || ''}` },
            { text: `毛重(千克)   ${head.gross_wt || ''}` },
            { text: `净重(千克)   ${head.net_wt || ''}` },
            { colSpan: 2, text: `随附单证   ${head.cert_mark || ''}` }, {}],
            [{ rowSpan: 3, colSpan: 5, text: `标记唛码及备注   ${head.note || ''}\n\n` }], [], [],
          ],
        },
      },
    ];
  } else if (declWayCode === 'IMPT') {
    headContent = [
      { columns: [
        { text: '中华人民共和国海关进口货物报关单', style: 'title' },
      ] },
      { columns: [
        { text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: ['40%', '20%', '20%', '20%'],
          body: [
            [{ text: `收发货人   ${head.trade_name || ''}` },
            { text: `进口口岸   ${head.i_e_port || ''}` },
            { text: `进口日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `消费使用单位   ${head.owner_name || ''}` },
            { text: `运输方式   ${head.traf_mode || ''}` },
            { text: `运输工具名称   ${head.traf_name || ''}` },
            { text: `提运单号   ${head.bl_wb_no || ''}` }],
            [{ text: `申报单位   ${head.agent_name || ''}` },
            { text: `监管方式   ${head.trade_mode || ''}` },
            { text: `征免性质   ${head.cut_mode || ''}` },
            { text: `备案号   ${head.manual_no || ''}` }],
            [{ text: `贸易国(地区)   ${head.trade_country || ''}` },
            { text: `启运国(地区)   ${head.dept_dest_country || ''}` },
            { text: `装货港   ${head.dept_dest_port || ''}` },
            { text: `境内目的地   ${head.district_code || ''}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ text: `许可证号   ${head.license_no || ''}` },
            { text: `成交方式   ${head.trxn_mode || ''}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `合同协议号   ${head.contr_no || ''}` },
            { text: `件数   ${head.pack_count || ''}` },
            { text: `包装种类   ${head.wrap_type || ''}` },
            { text: `毛重(千克)   ${head.gross_wt || ''}` },
            { text: `净重(千克)   ${head.net_wt || ''}` }],
            [{ text: `集装箱号   ${head.container_no || ''}` },
            { colSpan: 4, text: `随附单证   ${head.cert_mark || ''}` }, {}, {}, {}],
            [{ rowSpan: 3, colSpan: 5, text: `标记唛码及备注   ${head.note || ''}\n\n` }], [], [],
          ],
        },
      },
    ];
  } else if (declWayCode === 'EXPT') {
    headContent = [
      { columns: [
        { text: '中华人民共和国海关出口货物报关单', style: 'title' },
      ] },
      { columns: [
        { text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: ['40%', '20%', '20%', '20%'],
          body: [
            [{ text: `收发货人   ${head.trade_name || ''}` },
            { text: `出口口岸   ${head.i_e_port || ''}` },
            { text: `出口日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `生产销售单位   ${head.owner_name || ''}` },
            { text: `运输方式   ${head.traf_mode || ''}` },
            { text: `运输工具名称   ${head.traf_name || ''}` },
            { text: `提运单号   ${head.bl_wb_no || ''}` }],
            [{ text: `申报单位   ${head.agent_name || ''}` },
            { text: `监管方式   ${head.trade_mode || ''}` },
            { text: `征免性质   ${head.cut_mode || ''}` },
            { text: `备案号   ${head.manual_no || ''}` }],
            [{ text: `贸易国(地区)   ${head.trade_country || ''}` },
            { text: `运抵国(地区)   ${head.dept_dest_country || ''}` },
            { text: `指运港   ${head.dept_dest_port || ''}` },
            { text: `境内货源地   ${head.district_code || ''}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ text: `许可证号   ${head.license_no || ''}` },
            { text: `成交方式   ${head.trxn_mode || ''}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `合同协议号   ${head.contr_no || ''}` },
            { text: `件数   ${head.pack_count || ''}` },
            { text: `包装种类   ${head.wrap_type || ''}` },
            { text: `毛重(千克)   ${head.gross_wt || ''}` },
            { text: `净重(千克)   ${head.net_wt || ''}` }],
            [{ text: `集装箱号   ${head.container_no || ''}` },
            { colSpan: 4, text: `随附单证   ${head.cert_mark || ''}` }, {}, {}, {}],
            [{ rowSpan: 3, colSpan: 5, text: `标记唛码及备注   ${head.note || ''}\n\n` }], [], [],
          ],
        },
      },
    ];
  }
  return headContent;
}

function pdfBody(bodydatas, declWayCode) {
  const pdfbody = [];
  const header = [];
  header.push(
      { text: '项号', style: 'tableHeader' },
      { text: '商品编号', style: 'tableHeader' },
      { text: '商品名称、规格型号', style: 'tableHeader' },
      { text: '数量及单位', style: 'tableHeader' },
      { text: '原产国(地区)', style: 'tableHeader' },
      { text: '单价', style: 'tableHeader' },
      { text: '总价', style: 'tableHeader' },
      { text: '币制', style: 'tableHeader' },
    );
  let widths = ['5%', '15%', '20%', '15%', '15%', '10%', '10%', '10%'];
  if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
    header.push({ text: '征免', style: 'tableHeader' });
    widths = ['5%', '10%', '25%', '10%', '10%', '10%', '10%', '10%', '10%'];
  }
  pdfbody.push(header);
  for (let i = 0; i < bodydatas.length; i++) {
    const dbody = bodydatas[i];
    const body = [];
    body.push(`${dbody.g_no || ''}`,
        `${dbody.code_t || ''}${dbody.code_s || ''}`,
        `${dbody.g_name || ''} ${dbody.g_model || ''}`,
        { text: `${dbody.g_qty || ''}${dbody.g_unit || ''}`, alignment: 'right' },
        `${dbody.orig_country || ''}`,
        { text: `${dbody.dec_price || ''}`, alignment: 'right' },
        { text: `${dbody.trade_total || ''}`, alignment: 'right' },
        `${dbody.trade_curr || ''}`,
      );
    if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
      body.push(`${dbody.duty_mode || ''}`);
    }
    pdfbody.push(body);
  }
  const bodytable = { widths, body: pdfbody };
  return bodytable;
}

export function DocDef(head, bodies, declWayCode) {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [20, 30],
    content: [],
    styles: {
      title: {
        fontSize: 15,
        bold: true,
        alignment: 'center',
        width: '100%',
        margin: [0, 50, 0, 15],
      },
      table: {
        fontSize: 8,
      },
      tableCell: {
        height: 30,
      },
      tableHeader: {
        fontSize: 8,
      },
    },
    defaultStyle: {
      font: 'yahei',
    },
  };
  const splitCount = Math.ceil(bodies.length / 8);
  for (let spIndex = 0; spIndex < splitCount; spIndex++) {
    let content = [];
    const datas = [];
    let end = false;
    for (let bIndex = spIndex * 8; bIndex < (spIndex + 1) * 8; bIndex++) {
      if (bIndex < bodies.length) {
        datas.push(bodies[bIndex]);
      } else {
        datas.push({});
        end = true;
      }
    }
    content = pdfHeader(head, declWayCode);
    content.push(
      { style: 'table', table: pdfBody(datas, declWayCode), layout: 'lightHorizontalLines' });
    const pdfFooter = [
      [{ text: '\n', border: [true, false, false, true] },
      { text: '\n', border: [false, false, false, true] },
      { text: '\n', border: [false, false, false, true] },
      { text: '\n', border: [false, false, true, true] }],
      [{ text: '录入人员\n', border: [true, true, false, true] },
      { text: '录入单位\n', border: [false, true, true, true] },
      { text: '兹申明对以上内容承担如实申报、依法纳税之法律责任\n', border: [true, true, true, false] },
      { text: '海关批注及签章\n', border: [true, true, true, false] }],
      [{ text: '\n报关人员', colSpan: 2, border: [true, true, false, true] }, {},
      { text: '\n申报单位（签章）', border: [false, false, true, true] },
      { text: '\n审核日期', border: [true, false, true, true] }],
    ];
    if (end) {
      content.push({ style: 'table', table: { widths: ['15%', '15%', '40%', '30%'], body: pdfFooter } });
    } else {
      content.push({ style: 'table', pageBreak: 'after', table: { widths: ['15%', '15%', '40%', '30%'], body: pdfFooter } });
    }
    docDefinition.content = docDefinition.content.concat(content);
  }
  return docDefinition;
}
