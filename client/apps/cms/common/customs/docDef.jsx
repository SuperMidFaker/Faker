
function pdfHeader(head, declWayCode, params) {
  let headContent = [];
  const countries = params.tradeCountries.map(tc => ({
    value: tc.cntry_co,
    text: tc.cntry_name_cn,
  }));
  const customs = params.customs.filter(cu => cu.customs_code === head.i_e_port)[0];
  const ieport = customs || { customs_code: '', customs_name: '' };
  const transmode = params.transModes.filter(tm => tm.trans_code === head.traf_mode)[0];
  const trafmode = transmode || { trans_code: '', trans_spec: '' };
  const tradeMd = params.tradeModes.filter(tr => tr.trade_mode === head.trade_mode)[0];
  const trademode = tradeMd || { trade_mode: '', trade_abbr: '' };
  const trcountry = countries.filter(cur => cur.value === head.trade_country)[0];
  const tradeCountry = trcountry || { value: '', text: '' };
  const decountry = countries.filter(cur => cur.value === head.dept_dest_country)[0];
  const deptCountry = decountry || { value: '', text: '' };
  const distCode = params.districts.filter(ds => ds.district_code === head.district_code)[0];
  const district = distCode || { district_code: '', district_name: '' };
  const trxModecode = params.trxModes.filter(tr => tr.trx_mode === head.trxn_mode)[0];
  const trxnmode = trxModecode || { trx_mode: '', trx_spec: '' };
  const pack = params.packs.filter(pk => pk.value === head.wrap_type)[0];
  const wrapType = pack || { value: '', text: '' };
  const port = params.ports.filter(pt => pt.port_code === head.dept_dest_port)[0];
  const deptPort = port || { port_code: '', port_c_cod: '' };
  const remissionMode = params.remissionModes.filter(rm => rm.rm_mode === head.cut_mode)[0];
  const cutMode = remissionMode || { rm_mode: '', rm_spec: '' };

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
            [{ text: `收发货人  ${head.trade_custco || ''}\n${head.trade_name || ''}`, style: 'tableCell' },
            { text: `进境口岸 (${ieport.customs_code})\n${ieport.customs_name}` },
            { text: `备案号   ${head.manual_no || ''}` },
            { text: `进境日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `消费使用单位  (${head.owner_custco})\n${head.owner_name || ''}` },
            { text: `监管方式   (${trademode.trade_mode})\n${trademode.trade_abbr}` },
            { text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}` },
            { text: `启运国(地区) (${deptCountry.value})\n${deptCountry.text}` },
            { text: `境内目的地 (${district.district_code})\n${district.district_name}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ colSpan: 2, text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}`, border: [true, false, true, true] },
            {},
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}` },
            { text: `运输工具名称   ${head.traf_name || ''}` },
            { text: `提运单号\n${head.bl_wb_no || ''}` }],
            [{ text: `许可证号\n${head.license_no || ''}` },
            { text: `成交方式 (${trxnmode.trxn_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `件数\n   ${head.pack_count || ''}` },
            { text: `毛重(千克)\n   ${head.gross_wt || ''}` },
            { text: `净重(千克)\n   ${head.net_wt || ''}` },
            { colSpan: 2, text: `随附单证   ${head.cert_mark || ''}` }, {}],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, true] }]],
        },
        layout: { paddingBottom() { return 35; } },
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
            [{ text: `收发货人  ${head.trade_custco || ''}\n${head.trade_name || ''}` },
            { text: `出境口岸 (${ieport.customs_code})\n${ieport.customs_name}` },
            { text: `备案号   ${head.manual_no || ''}` },
            { text: `出境日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `消费使用单位  (${head.owner_custco})\n${head.owner_name || ''}` },
            { text: `监管方式 (${trademode.trade_mode})\n${trademode.trade_abbr}` },
            { text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}` },
            { text: `运抵国(地区) (${deptCountry.value})\n${deptCountry.text}` },
            { text: `境内货源地 (${district.district_code})\n${district.district_name}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ colSpan: 2, text: `申报单位   ${head.agent_name || ''}`, border: [true, false, true, true] },
            {},
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}` },
            { text: `运输工具名称   ${head.traf_name || ''}` },
            { text: `提运单号\n${head.bl_wb_no || ''}` }],
            [{ text: `许可证号\n${head.license_no || ''}` },
            { text: `成交方式 (${trxnmode.trxn_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `件数\n   ${head.pack_count || ''}` },
            { text: `毛重(千克)\n   ${head.gross_wt || ''}` },
            { text: `净重(千克)\n   ${head.net_wt || ''}` },
            { colSpan: 2, text: `随附单证   ${head.cert_mark || ''}` }, {}],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, true] }]],
        },
        layout: { paddingBottom() { return 35; } },
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
            [{ text: `收发货人  (${head.trade_custco || ''})\n${head.trade_name || ''}` },
            { text: `进口口岸 (${ieport.customs_code})\n${ieport.customs_name}` },
            { text: `进口日期   ${head.i_e_date || ''}` },
            { text: `申报日期   ${head.d_date || ''}` }],
            [{ text: `消费使用单位  (${head.owner_custco})\n${head.owner_name || ''}` },
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}` },
            { text: `运输工具名称\n${head.traf_name || ''}` },
            { text: `提运单号\n${head.bl_wb_no || ''}` }],
            [{ text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}` },
            { text: `监管方式 (${trademode.trade_mode})\n${trademode.trade_abbr}` },
            { text: `征免性质 (${cutMode.rm_mode})\n${cutMode.rm_spec}` },
            { text: `备案号\n${head.manual_no || ''}` }],
            [{ text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}` },
            { text: `启运国(地区) (${deptCountry.value})\n${deptCountry.text}` },
            { text: `装货港 (${deptPort.port_code})\n${deptPort.port_c_cod}` },
            { text: `境内目的地 (${district.district_code})\n${district.district_name}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ text: `许可证号\n${head.license_no || ''}`, border: [true, false, true, true] },
            { text: `成交方式 (${trxnmode.trxn_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `合同协议号\n${head.contr_no || ''}` },
            { text: `件数\n      ${head.pack_count || ''}` },
            { text: `包装种类 (${wrapType.value}\n${wrapType.text}` },
            { text: `毛重(千克)\n      ${head.gross_wt || ''}` },
            { text: `净重(千克)\n      ${head.net_wt || ''}` }],
            [{ text: `集装箱号\n${head.container_no || ''}` },
            { colSpan: 4, text: `随附单证   ${head.cert_mark || ''}` }, {}, {}, {}],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, true] }]],
        },
        layout: { paddingBottom() { return 35; } },
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
            [{ text: `收发货人  ${head.trade_custco || ''}\n${head.trade_name || ''}` },
            { text: `出口口岸 (${ieport.customs_code})\n${ieport.customs_name}` },
            { text: `出口日期\n${head.i_e_date || ''}` },
            { text: `申报日期\n${head.d_date || ''}` }],
            [{ text: `生产销售单位  (${head.owner_custco})\n${head.owner_name || ''}` },
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}` },
            { text: `运输工具名称\n${head.traf_name || ''}` },
            { text: `提运单号\n${head.bl_wb_no || ''}` }],
            [{ text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}` },
            { text: `监管方式 (${trademode.trade_mode})\n${trademode.trade_abbr}` },
            { text: `征免性质 (${cutMode.rm_mode})\n${cutMode.rm_spec}` },
            { text: `备案号\n${head.manual_no || ''}` }],
            [{ text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}` },
            { text: `运抵国(地区) (${deptCountry.value})\n${deptCountry.text}` },
            { text: `指运港 (${deptPort.port_code})\n${deptPort.port_c_cod}` },
            { text: `境内货源地 (${district.district_code})\n${district.district_name}` }],
          ],
        },
      },
      { style: 'table',
        table: {
          widths: ['26%', '13%', '21%', '20%', '20%'],
          body: [
            [{ text: `许可证号\n${head.license_no || ''}`, border: [true, false, true, true] },
            { text: `成交方式 (${trxnmode.trxn_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${head.fee_rate || ''}` },
            { text: `保费   ${head.insur_rate || ''}` },
            { text: `杂费   ${head.other_rate || ''}` }],
            [{ text: `合同协议号\n${head.contr_no || ''}` },
            { text: `件数\n   ${head.pack_count || ''}` },
            { text: `包装种类 (${wrapType.value}\n${wrapType.text}` },
            { text: `毛重(千克)\n   ${head.gross_wt || ''}` },
            { text: `净重(千克)\n   ${head.net_wt || ''}` }],
            [{ text: `集装箱号\n ${head.container_no || ''}` },
            { colSpan: 4, text: `随附单证   ${head.cert_mark || ''}` }, {}, {}, {}],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, true] }]],
        },
        layout: { paddingBottom() { return 35; } },
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

export function DocDef(head, bodies, declWayCode, params) {
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
    content = pdfHeader(head, declWayCode, params);
    content.push(
      { style: 'table',
        table: pdfBody(datas, declWayCode, params),
        layout: {
          paddingBottom() { return 25; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1;
          },
        },
      });
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
