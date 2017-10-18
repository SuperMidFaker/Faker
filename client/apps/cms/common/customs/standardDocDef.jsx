import moment from 'moment';

function calFeeRate(curr, rate, mark) {
  const feeRate = { curr: '', rate: '', mark: '' };
  let rateStr = '';
  if (rate && rate > 0) {
    feeRate.rate = rate;
    if (mark === '1') {
      feeRate.mark = mark;
      feeRate.curr = '000';
    } else if (Number(mark) > 1) {
      feeRate.mark = mark;
      feeRate.curr = curr;
    }
    rateStr = `\n${feeRate.curr}/${feeRate.rate}/${feeRate.mark}`;
  }
  return rateStr;
}

function pdfHeader(head, declWayCode, orderNo, params) {
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
  const feeRateStr = calFeeRate(head.fee_curr, head.fee_rate, head.fee_mark);
  const insurRateStr = calFeeRate(head.insur_curr, head.insur_rate, head.insur_mark);
  const otherRateStr = calFeeRate(head.other_curr, head.other_rate, head.other_mark);

  if (declWayCode === 'IBND') {
    headContent = [
      { columns: [
        { text: `${head.delg_no}/${orderNo}`, style: 'header' },
      ] },
      { columns: [
        { text: '中华人民共和国海关进境货物备案清单', style: 'title' },
      ] },
      { columns: [
        { width: 180, text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: [200, '*', '*', 82, 80],
          body: [
            [{ text: `收发货人  ${head.trade_custco || ''}\n${head.trade_name || ''}`, style: 'tableCell' },
            { text: `进境口岸 (${ieport.customs_code})\n${ieport.customs_name}` },
            { text: `备案号\n${head.manual_no || ''}` },
            { text: `进境日期\n${head.i_e_date ? moment(head.i_e_date).format('YYYY-MM-DD') : ''}` },
            { text: `申报日期\n${head.d_date ? moment(head.d_date).format('YYYY-MM-DD') : ''}` }],
            [{ text: `消费使用单位  (${head.owner_custco})\n${head.owner_name || ''}` },
            { text: `监管方式   (${trademode.trade_mode})\n${trademode.trade_abbr}` },
            { text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}` },
            { text: `启运国(地区) (${deptCountry.value})\n${deptCountry.text}` },
            { text: `境内目的地 (${district.district_code})\n${district.district_name}` }],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i) {
            return (i === 0) ? 1.2 : 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [200, 95, '*', 118],
          body: [
            [{ text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}`, border: [true, false, true, false] },
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}`, border: [true, false, true, false] },
            { text: `运输工具名称\n${head.traf_name || ''}`, border: [true, false, true, false] },
            { text: `提运单号\n${head.bl_wb_no || ''}`, border: [true, false, true, false] }],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [131, 60, 95, '*', 118],
          body: [
            [{ text: `许可证号\n${head.license_no || ''}` },
            { text: `成交方式 (${trxnmode.trx_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${feeRateStr}` },
            { text: `保费   ${insurRateStr}` },
            { text: `杂费   ${otherRateStr}` }],
            [{ text: `件数\n   ${head.pack_count || ''}` },
            { text: `毛重(千克)\n   ${head.gross_wt || ''}` },
            { text: `净重(千克)\n   ${head.net_wt || ''}` },
            { colSpan: 2, text: `随附单证   ${head.cert_mark || ''}` }, {}],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [90],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, false] }]],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['8%', '12%', '25%', '12%', '14%', '*', '*', '*'],
          heights: [10],
          body: [[
            { text: '项号', style: 'tableHeader' },
            { text: '商品编号', style: 'tableHeader' },
            { text: '商品名称、规格型号', style: 'tableHeader' },
            { text: '数量及单位', style: 'tableHeader' },
            { text: '原产国(地区)', style: 'tableHeader' },
            { text: '单价', style: 'tableHeader' },
            { text: '总价', style: 'tableHeader' },
            { text: '币制', style: 'tableHeader' },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
    ];
  } else if (declWayCode === 'EBND') {
    headContent = [
      { columns: [
        { text: `${head.delg_no}/${orderNo}`, style: 'header' },
      ] },
      { columns: [
        { text: '中华人民共和国海关出境货物备案清单', style: 'title' },
      ] },
      { columns: [
        { width: 180, text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: [200, '*', '*', 82, 80],
          body: [
            [{ text: `收发货人  ${head.trade_custco || ''}\n${head.trade_name || ''}`, style: 'tableCell' },
            { text: `出境口岸 (${ieport.customs_code})\n${ieport.customs_name}` },
            { text: `备案号\n${head.manual_no || ''}` },
            { text: `出境日期\n${head.i_e_date ? moment(head.i_e_date).format('YYYY-MM-DD') : ''}` },
            { text: `申报日期\n${head.d_date ? moment(head.d_date).format('YYYY-MM-DD') : ''}` }],
            [{ text: `生成销售单位  (${head.owner_custco})\n${head.owner_name || ''}` },
            { text: `监管方式   (${trademode.trade_mode})\n${trademode.trade_abbr}` },
            { text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}` },
            { text: `运抵国(地区) (${deptCountry.value})\n${deptCountry.text}` },
            { text: `境内货源地 (${district.district_code})\n${district.district_name}` }],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i) {
            return (i === 0) ? 1.2 : 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [200, 95, '*', 118],
          body: [
            [{ text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}`, border: [true, false, true, false] },
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}`, border: [true, false, true, false] },
            { text: `运输工具名称\n${head.traf_name || ''}`, border: [true, false, true, false] },
            { text: `提运单号\n${head.bl_wb_no || ''}`, border: [true, false, true, false] }],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [131, 60, 95, '*', 118],
          body: [
            [{ text: `许可证号\n${head.license_no || ''}` },
            { text: `成交方式 (${trxnmode.trx_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${feeRateStr}` },
            { text: `保费   ${insurRateStr}` },
            { text: `杂费   ${otherRateStr}` }],
            [{ text: `件数\n   ${head.pack_count || ''}` },
            { text: `毛重(千克)\n   ${head.gross_wt || ''}` },
            { text: `净重(千克)\n   ${head.net_wt || ''}` },
            { colSpan: 2, text: `随附单证   ${head.cert_mark || ''}` }, {}],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [90],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, false] }]],
        },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['8%', '12%', '25%', '12%', '14%', '*', '*', '*'],
          heights: [10],
          body: [[
            { text: '项号', style: 'tableHeaderAlignCenter' },
            { text: '商品编号', style: 'tableHeader' },
            { text: '商品名称、规格型号', style: 'tableHeader' },
            { text: '数量及单位', style: 'tableHeader' },
            { text: '最终目的国(地区)', style: 'tableHeader' },
            { text: '单价', style: 'tableHeader' },
            { text: '总价', style: 'tableHeader' },
            { text: '币制', style: 'tableHeader' },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
    ];
  } else if (declWayCode === 'IMPT') {
    headContent = [
      { columns: [
        { text: `${head.delg_no}/${orderNo}`, style: 'header' },
      ] },
      { columns: [
        { text: '中华人民共和国海关进口货物报关单', style: 'cdfTitle' },
      ] },
      { columns: [
        { width: 180, text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: [220, 110, '*', 85],
          body: [
            [{ text: `收发货人  (${head.trade_custco || ''})\n${head.trade_name || ''}`, border: [true, true, true, false] },
            { text: `进口口岸 (${ieport.customs_code})\n${ieport.customs_name}`, border: [true, true, true, false] },
            { text: `进口日期\n${head.i_e_date ? moment(head.i_e_date).format('YYYY-MM-DD') : ''}`, border: [true, true, true, false] },
            { text: `申报日期\n${head.d_date ? moment(head.d_date).format('YYYY-MM-DD') : ''}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i) {
            return (i === 0) ? 1.2 : 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [220, 50, '*', 132],
          body: [
            [{ text: `消费使用单位  (${head.owner_custco})\n${head.owner_name || ''}`, border: [true, true, true, false] },
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}`, border: [true, true, true, false] },
            { text: `运输工具名称\n${head.traf_name || ''}`, border: [true, true, true, false] },
            { text: `提运单号\n${head.bl_wb_no || ''}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [220, 110, '*', 102],
          body: [
            [{ text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}`, border: [true, true, true, false] },
            { text: `监管方式 (${trademode.trade_mode})\n${trademode.trade_abbr}`, border: [true, true, true, false] },
            { text: `征免性质 (${cutMode.rm_mode})\n${cutMode.rm_spec}`, border: [true, true, true, false] },
            { text: `备案号\n${head.manual_no || ''}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [150, 120, '*', 102],
          body: [
            [{ text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}`, border: [true, true, true, false] },
            { text: `启运国(地区) (${deptCountry.value})\n${deptCountry.text}`, border: [true, true, true, false] },
            { text: `装货港 (${deptPort.port_code})\n${deptPort.port_c_cod}`, border: [true, true, true, false] },
            { text: `境内目的地 (${district.district_code})\n${district.district_name}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [150, 62, 110, '*', 102],
          heights: [20, 20, 20],
          body: [
            [{ text: `许可证号\n${head.license_no || ''}` },
            { text: `成交方式 (${trxnmode.trx_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${feeRateStr}` },
            { text: `保费   ${insurRateStr}` },
            { text: `杂费   ${otherRateStr}` }],
            [{ text: `合同协议号\n${head.contr_no || ''}` },
            { text: `件数\n      ${head.pack_count || ''}` },
            { text: `包装种类 (${wrapType.value})\n${wrapType.text}` },
            { text: `毛重(千克)\n      ${head.gross_wt || ''}` },
            { text: `净重(千克)\n      ${head.net_wt || ''}` }],
            [{ text: `集装箱号\n${head.container_no || ''}` },
            { colSpan: 4, text: `随附单证   ${head.cert_mark || ''}` }, {}, {}, {}],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [48],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, false] }]],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['6%', '12%', '24%', '12%', '14%', '*', '*', '*', '*'],
          heights: [10],
          body: [[
            { text: '项号', style: 'tableHeader' },
            { text: '商品编号', style: 'tableHeader' },
            { text: '商品名称、规格型号', style: 'tableHeader' },
            { text: '数量及单位', style: 'tableHeader' },
            { text: '原产国(地区)', style: 'tableHeader' },
            { text: '单价', style: 'tableHeader' },
            { text: '总价', style: 'tableHeader' },
            { text: '币制', style: 'tableHeader' },
            { text: '征免', style: 'tableHeader' },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
    ];
  } else if (declWayCode === 'EXPT') {
    headContent = [
      { columns: [
        { text: `${head.delg_no}/${orderNo}`, style: 'header' },
      ] },
      { columns: [
        { text: '中华人民共和国海关出口货物报关单', style: 'cdfTitle' },
      ] },
      { columns: [
        { width: 180, text: `预录入编号:  ${head.pre_entry_id || ''}`, fontSize: 8, alignment: 'center' },
        { text: `海关编号:  ${head.entry_id || ''}`, fontSize: 8, alignment: 'center' },
      ] },
      { style: 'table',
        table: {
          widths: [220, 110, '*', 85],
          body: [
            [{ text: `收发货人  (${head.trade_custco || ''})\n${head.trade_name || ''}`, border: [true, true, true, false] },
            { text: `出口口岸 (${ieport.customs_code})\n${ieport.customs_name}`, border: [true, true, true, false] },
            { text: `出口日期\n${head.i_e_date ? moment(head.i_e_date).format('YYYY-MM-DD') : ''}`, border: [true, true, true, false] },
            { text: `申报日期\n${head.d_date ? moment(head.d_date).format('YYYY-MM-DD') : ''}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i) {
            return (i === 0) ? 1.2 : 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [220, 50, '*', 132],
          body: [
            [{ text: `生产销售单位  (${head.owner_custco})\n${head.owner_name || ''}`, border: [true, true, true, false] },
            { text: `运输方式 (${trafmode.trans_code})\n${trafmode.trans_spec}`, border: [true, true, true, false] },
            { text: `运输工具名称\n${head.traf_name || ''}`, border: [true, true, true, false] },
            { text: `提运单号\n${head.bl_wb_no || ''}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [220, 110, '*', 102],
          body: [
            [{ text: `申报单位  (${head.agent_custco})\n${head.agent_name || ''}`, border: [true, true, true, false] },
            { text: `监管方式 (${trademode.trade_mode})\n${trademode.trade_abbr}`, border: [true, true, true, false] },
            { text: `征免性质 (${cutMode.rm_mode})\n${cutMode.rm_spec}`, border: [true, true, true, false] },
            { text: `备案号\n${head.manual_no || ''}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [150, 120, '*', 102],
          body: [
            [{ text: `贸易国(地区) (${tradeCountry.value})\n${tradeCountry.text}`, border: [true, true, true, false] },
            { text: `运抵国(地区) (${deptCountry.value})\n${deptCountry.text}`, border: [true, true, true, false] },
            { text: `指运港 (${deptPort.port_code})\n${deptPort.port_c_cod}`, border: [true, true, true, false] },
            { text: `境内货源地 (${district.district_code})\n${district.district_name}`, border: [true, true, true, false] }],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      { style: 'table',
        table: {
          widths: [150, 62, 110, '*', 102],
          heights: [20, 20, 20],
          body: [
            [{ text: `许可证号\n${head.license_no || ''}` },
            { text: `成交方式 (${trxnmode.trx_mode})\n${trxnmode.trx_spec}` },
            { text: `运费   ${feeRateStr}` },
            { text: `保费   ${insurRateStr}` },
            { text: `杂费   ${otherRateStr}` }],
            [{ text: `合同协议号\n${head.contr_no || ''}` },
            { text: `件数\n      ${head.pack_count || ''}` },
            { text: `包装种类 (${wrapType.value})\n${wrapType.text}` },
            { text: `毛重(千克)\n      ${head.gross_wt || ''}` },
            { text: `净重(千克)\n      ${head.net_wt || ''}` }],
            [{ text: `集装箱号\n${head.container_no || ''}` },
            { colSpan: 4, text: `随附单证   ${head.cert_mark || ''}` }, {}, {}, {}],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [48],
          body: [[{ text: `标记唛码及备注   ${head.note || ''}`, border: [true, false, true, false] }]],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['4%', '10%', '26%', '10%', '15%', '*', '*', '*', '*'],
          heights: [10],
          body: [[
            { text: '项号', style: 'tableHeader' },
            { text: '商品编号', style: 'tableHeader' },
            { text: '商品名称、规格型号', style: 'tableHeader' },
            { text: '数量及单位', style: 'tableHeader' },
            { text: '最终目的国(地区)', style: 'tableHeader' },
            { text: '单价', style: 'tableHeader' },
            { text: '总价', style: 'tableHeader' },
            { text: '币制', style: 'tableHeader' },
            { text: '征免', style: 'tableHeader' },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineWidth() {
            return 0.8;
          },
        },
      },
    ];
  }
  return headContent;
}

function pdfBody(bodydatas, declWayCode, params) {
  const pdfbody = [];
  const countries = params.tradeCountries.map(tc => ({
    value: tc.cntry_co,
    text: tc.cntry_name_cn,
  }));
  const units = params.units.map(un => ({
    value: un.unit_code,
    text: un.unit_name,
  }));
  const currrencies = params.currencies.map(cr => ({
    value: cr.curr_code,
    text: cr.curr_name,
  }));
  let widths = ['4%', '10%', '33%', '10%', '10%', '*', '*', '*'];
  /*
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
  */
  if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
    // header.push({ text: '征免', style: 'tableHeader' });
    widths = ['4%', '10%', '33%', '10%', '10%', '*', '*', '*', '*'];
  }
  const height = 36;
  const heights = [10, height, height, height, height, height, height, height, height];
  // pdfbody.push(header);
  for (let i = 0; i < bodydatas.length; i++) {
    const dbody = bodydatas[i];
    const body = [];
    const gunitFl = units.filter(ut => ut.value === dbody.g_unit)[0];
    const gunit = gunitFl ? gunitFl.text : '';
    const unit1Fl = units.filter(ut => ut.value === dbody.unit_1)[0];
    const unit1 = unit1Fl ? unit1Fl.text : '';
    const unit2Fl = units.filter(ut => ut.value === dbody.unit_2)[0];
    const unit2 = unit2Fl ? unit2Fl.text : '';
    const country = countries.filter(ct => ct.value === dbody.orig_country)[0];
    const origCountry = country ? `${country.text}\n(${country.value})` : '';
    const currency = currrencies.filter(cr => cr.value === dbody.trade_curr)[0];
    const tradeCurr = currency ? `(${currency.value})\n${currency.text}` : '';
    const exemptions = params.exemptionWays.filter(ep => ep.value === dbody.duty_mode)[0];
    const dutyMode = exemptions || { value: '', text: '' };
    body.push(`${dbody.g_no || ''}`,
        `${dbody.code_t || ''}${dbody.code_s || ''}`,
        `${dbody.g_name || ''}\n${dbody.g_model || ''}`,
        { text: `${dbody.qty_1 || ''}${unit1}\n${dbody.qty_2 || ''}${unit2}\n${dbody.g_qty || ''}${gunit}`, alignment: 'right' },
        `${origCountry}`,
        { text: `${dbody.dec_price || ''}`, alignment: 'right' },
        { text: `${dbody.trade_total || ''}`, alignment: 'right' },
        `${tradeCurr}`,
      );
    if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
      body.push(`${dutyMode.text}\n${dutyMode.value}`);
    }
    pdfbody.push(body);
  }
  const bodytable = { widths, heights, body: pdfbody };
  return bodytable;
}

export function StandardDocDef(head, bodies, declWayCode, orderNo, params) {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [20, 15],
    content: [],
    styles: {
      header: {
        fontSize: 8,
        alignment: 'right',
        margin: [0, 2, 0, 5],
      },
      title: {
        fontSize: 15,
        bold: true,
        alignment: 'center',
        width: '100%',
        margin: [0, 40, 0, 14],
      },
      cdfTitle: {
        fontSize: 15,
        bold: true,
        alignment: 'center',
        width: '100%',
        margin: [0, 48, 0, 14],
      },
      table: {
        fontSize: 8,
      },
      tableCell: {
        height: 60,
      },
      tableHeader: {
        fontSize: 8,
      },
      tableHeaderAlignCenter: {
        fontSize: 8,
        alignment: 'center',
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
    content = pdfHeader(head, declWayCode, orderNo, params);
    content.push(
      { style: 'table',
        table: pdfBody(datas, declWayCode, params),
        layout: {
          // paddingBottom(i, node) { return (node.table.body[i][0].text === '') ? 15 : 1; },
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineColor(i, node) {
            return (i === 0 || i === 1 || i === node.table.body.length) ? 'black' : 'gray';
          },
          hLineWidth(i, node) {
            if (i === 0) {
              return 0;
            } else if (i === node.table.body.length) {
              return 0.8;
            } else {
              return 0.2;
            }
          },
        },
      });
    let pdfFooter = [
      [{ text: '\n', border: [true, false, false, true] },
      { text: '\n', border: [false, false, false, true] },
      { text: '\n', border: [false, false, false, true] },
      { text: '\n', border: [false, false, true, true] }],
      [{ text: '录入人员\n', border: [true, true, false, true] },
      { text: '录入单位\n', border: [false, true, true, true] },
      { text: '兹申明对以上内容承担如实申报、依法纳税之法律责任\n', margin: [12, 0, 10, 0], border: [true, true, true, false] },
      { text: '海关批注及签章\n', border: [true, true, true, false] }],
      [{ text: '\n报关人员', colSpan: 2, border: [true, true, false, true] }, {},
      { text: '\n\n申报单位（签章）', margin: [12, 0, 10, 0], border: [false, false, true, true] },
      { text: '\n\n审核日期', border: [true, false, true, true] }],
    ];
    if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
      pdfFooter = [
        [{ text: '\n', border: [true, false, false, true] },
        { text: '\n', border: [false, false, false, true] },
        { text: '\n', border: [false, false, false, true] },
        { text: '\n', border: [false, false, true, true] }],
        [{ text: '录入人员\n', border: [true, true, false, true] },
        { text: '录入单位\n', border: [false, true, true, true] },
        { text: '兹申明对以上内容承担如实申报、依法纳税之法律责任\n', margin: [12, 0, 10, 0], border: [true, true, true, false] },
        { text: '海关批注及签章\n', border: [true, true, true, false] }],
        [{ text: '\n报关人员', colSpan: 2, border: [true, true, false, true] }, {},
        { text: '\n\n申报单位（签章）', margin: [12, 0, 10, 0], border: [false, false, true, true] },
        { text: '', border: [true, false, true, true] }],
      ];
    }
    if (end) {
      content.push({ style: 'table',
        table: { widths: ['15%', '15%', '37%', '33%'], heights: [14, 36, 42], body: pdfFooter },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i, node) {
            return (i === node.table.body.length) ? 1.2 : 0.8;
          },
        },
      });
    } else {
      content.push({ style: 'table',
        pageBreak: 'after',
        table: { widths: ['15%', '15%', '37%', '33%'], body: pdfFooter },
        layout: {
          vLineWidth(i, node) {
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i, node) {
            return (i === node.table.body.length) ? 1.2 : 0.8;
          },
        },
      });
    }
    docDefinition.content = docDefinition.content.concat(content);
  }
  return docDefinition;
}
