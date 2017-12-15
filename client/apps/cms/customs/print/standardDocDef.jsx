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
    rateStr = `${feeRate.curr}/${feeRate.rate}/${feeRate.mark}`;
  }
  return rateStr;
}

function pdfHeader(head, declWayCode, orderNo, params, skeleton) {
  const labelStyle = skeleton ? 'invisibleLabel' : 'label';
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

  if (declWayCode === 'IBND' || declWayCode === 'EBND') {
    const rowHeight = 24;
    const ieTitle = declWayCode === 'IBND' ? '中华人民共和国海关进境货物备案清单' : '中华人民共和国海关出境货物备案清单';
    const title = skeleton ? '' : ieTitle;
    const tIEPort = declWayCode === 'IBND' ? '进境口岸' : '出境口岸';
    const tIEDate = declWayCode === 'IBND' ? '进境日期' : '出境日期';
    const tTrader = declWayCode === 'IBND' ? '消费使用单位' : '生产销售单位';
    const tDeptCountry = declWayCode === 'IBND' ? '启运国(地区)' : '运抵国(地区)';
    const tOrigDest = declWayCode === 'IBND' ? '境内目的地' : '境内货源地';
    const tOrigDestCntry = declWayCode === 'IBND' ? '原产国(地区)' : '最终目的国(地区)';
    headContent = [
      {
        columns: [
          { text: `${head.delg_no}/${orderNo}`, style: 'header' },
        ],
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [60],
          body: [
            [{ text: `${title}`, style: 'title', border: [false, false, false, false] }],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: [50, '*', 220],
          heights: [10],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { text: [{ text: '预录入编号:', style: `${labelStyle}` }, { text: `${head.pre_entry_id || ''}` }], border: [false, false, false, false] },
              { text: [{ text: '海关编号:', style: `${labelStyle}` }, { text: `${head.entry_id || ''}` }], border: [false, false, false, false] },
            ],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: [200, '*', '*', 82, 80],
          heights: [rowHeight, rowHeight],
          body: [
            [
              { text: [{ text: '收发货人  ', style: `${labelStyle}` }, { text: `(${head.trade_custco})\n` }, { text: `${head.trade_name || ''}` }] },
              { text: [{ text: `${tIEPort}  `, style: `${labelStyle}` }, { text: `(${ieport.customs_code})\n` }, { text: `${ieport.customs_name || ''}` }] },
              { text: [{ text: '备案号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.manual_no || ''}` }] },
              { text: [{ text: `${tIEDate}  `, style: `${labelStyle}` }, { text: '\n' }, { text: `${head.i_e_date ? moment(head.i_e_date).format('YYYYMMDD') : ''}` }] },
              { text: [{ text: '申报日期  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.d_date ? moment(head.d_date).format('YYYYMMDD') : ''}` }] },
            ],
            [
              { text: [{ text: `${tTrader}  `, style: `${labelStyle}` }, { text: `(${head.owner_custco})\n` }, { text: `${head.owner_name || ''}` }] },
              { text: [{ text: '监管方式  ', style: `${labelStyle}` }, { text: `(${trademode.trade_mode})\n` }, { text: `${trademode.trade_abbr || ''}` }] },
              { text: [{ text: '贸易国(地区)  ', style: `${labelStyle}` }, { text: `(${tradeCountry.value})\n` }, { text: `${tradeCountry.text || ''}` }] },
              { text: [{ text: `${tDeptCountry}  `, style: `${labelStyle}` }, { text: `(${deptCountry.value})\n` }, { text: `${deptCountry.text || ''}` }] },
              { text: [{ text: `${tOrigDest}  `, style: `${labelStyle}` }, { text: `(${district.district_code})\n` }, { text: `${district.district_name || ''}` }] },
            ],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i) {
            if (skeleton) { return 0; }
            return (i === 0) ? 1.2 : 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: [200, 95, '*', 118],
          heights: [rowHeight],
          body: [
            [
              { text: [{ text: '申报单位  ', style: `${labelStyle}` }, { text: `(${head.agent_custco})\n` }, { text: `${head.agent_name || ''}` }], border: [true, false, true, false] },
              { text: [{ text: '运输方式  ', style: `${labelStyle}` }, { text: `(${trafmode.trans_code})\n` }, { text: `${trafmode.trans_spec || ''}` }], border: [true, false, true, false] },
              { text: [{ text: '运输工具名称  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.traf_name || ''}` }], border: [true, false, true, false] },
              { text: [{ text: '提运单号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.bl_wb_no || ''}` }], border: [true, false, true, false] },
            ],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: [131, 60, 95, '*', 118],
          heights: [rowHeight, rowHeight],
          body: [
            [
              { text: [{ text: '许可证号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.license_no || ''}` }] },
              { text: [{ text: '成交方式  ', style: `${labelStyle}` }, { text: `(${trxnmode.trx_mode})\n` }, { text: `${trxnmode.trx_spec || ''}` }] },
              { text: [{ text: '运费  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${feeRateStr || ''}` }] },
              { text: [{ text: '保费  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${insurRateStr || ''}` }] },
              { text: [{ text: '杂费  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${otherRateStr || ''}` }] },
            ],
            [
              { text: [{ text: '件数  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.pack_count || ''}` }] },
              { text: [{ text: '毛重(千克)  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.gross_wt || ''}` }] },
              { text: [{ text: '净重(千克)  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.net_wt || ''}` }] },
              { colSpan: 2, text: [{ text: '随附单证  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.cert_mark || ''}` }] },
              {},
            ],
          ],
        },
        layout: {
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [90],
          body: [[
            { text: [{ text: '标记唛码及备注  ', style: `${labelStyle}` }, { text: `${head.note || ''}` }], border: [true, false, true, false] },
          ]],
        },
        layout: {
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
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
            { text: '项号', style: `${labelStyle}` },
            { text: '商品编号', style: `${labelStyle}` },
            { text: '商品名称、规格型号', style: `${labelStyle}` },
            { text: '数量及单位', style: `${labelStyle}` },
            { text: `${tOrigDestCntry}`, style: `${labelStyle}` },
            { text: '单价', style: `${labelStyle}` },
            { text: '总价', style: `${labelStyle}` },
            { text: '币制', style: `${labelStyle}` },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
    ];
  } else if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
    const ieTitle = declWayCode === 'IMPT' ? '中华人民共和国海关进口货物报关单' : '中华人民共和国海关出口货物报关单';
    const title = skeleton ? '' : ieTitle;
    const tIEPort = declWayCode === 'IMPT' ? '进口口岸' : '出口口岸';
    const tIEDate = declWayCode === 'IMPT' ? '进口日期' : '出口日期';
    const tTrader = declWayCode === 'IMPT' ? '消费使用单位' : '生产销售单位';
    const tDeptCountry = declWayCode === 'IMPT' ? '启运国(地区)' : '运抵国(地区)';
    const tOrigDest = declWayCode === 'IMPT' ? '境内目的地' : '境内货源地';
    const tOrigDestCntry = declWayCode === 'IMPT' ? '原产国(地区)' : '最终目的国(地区)';
    headContent = [
      {
        columns: [
          { text: `${head.delg_no}/${orderNo}`, style: 'header' },
        ],
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [60],
          body: [
            [{ text: `${title}`, style: 'title', border: [false, false, false, false] }],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: [50, '*', 220],
          heights: [10],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { text: [{ text: '预录入编号:', style: `${labelStyle}` }, { text: `${head.pre_entry_id || ''}` }], border: [false, false, false, false] },
              { text: [{ text: '海关编号:', style: `${labelStyle}` }, { text: `${head.entry_id || ''}` }], border: [false, false, false, false] },
            ],
          ],
        },
      },
      {
        style: 'table',
        table: {
          widths: [220, 110, '*', 85],
          body: [
            [
              { text: [{ text: '收发货人  ', style: `${labelStyle}` }, { text: `(${head.trade_custco})\n` }, { text: `${head.trade_name || ''}` }], border: [true, true, true, false] },
              { text: [{ text: `${tIEPort}  `, style: `${labelStyle}` }, { text: `(${ieport.customs_code})\n` }, { text: `${ieport.customs_name || ''}` }], border: [true, true, true, false] },
              { text: [{ text: `${tIEDate}  `, style: `${labelStyle}` }, { text: '\n' }, { text: `${head.i_e_date ? moment(head.i_e_date).format('YYYYMMDD') : ''}` }], border: [true, true, true, false] },
              { text: [{ text: '申报日期  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.d_date ? moment(head.d_date).format('YYYYMMDD') : ''}` }], border: [true, true, true, false] },
            ],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i) {
            if (skeleton) { return 0; }
            return (i === 0) ? 1.2 : 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: [220, 50, '*', 132],
          body: [
            [
              { text: [{ text: `${tTrader}  `, style: `${labelStyle}` }, { text: `(${head.owner_custco})\n` }, { text: `${head.owner_name || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '运输方式  ', style: `${labelStyle}` }, { text: `(${trafmode.trans_code})\n` }, { text: `${trafmode.trans_spec || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '运输工具名称  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.traf_name || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '提运单号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.bl_wb_no || ''}` }], border: [true, true, true, false] },
            ],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: [220, 110, '*', 102],
          body: [
            [
              { text: [{ text: '申报单位  ', style: `${labelStyle}` }, { text: `(${head.agent_custco})\n` }, { text: `${head.agent_name || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '监管方式  ', style: `${labelStyle}` }, { text: `(${trademode.trade_mode})\n` }, { text: `${trademode.trade_abbr || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '征免性质  ', style: `${labelStyle}` }, { text: `(${cutMode.rm_mode})\n` }, { text: `${cutMode.rm_spec || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '备案号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.manual_no || ''}` }], border: [true, true, true, false] },
            ],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: [150, 120, '*', 102],
          body: [
            [
              { text: [{ text: '贸易国(地区)  ', style: `${labelStyle}` }, { text: `(${tradeCountry.value})\n` }, { text: `${tradeCountry.text || ''}` }], border: [true, true, true, false] },
              { text: [{ text: `${tDeptCountry}  `, style: `${labelStyle}` }, { text: `(${deptCountry.value})\n` }, { text: `${deptCountry.text || ''}` }], border: [true, true, true, false] },
              { text: [{ text: '装货港  ', style: `${labelStyle}` }, { text: `(${deptPort.port_code})\n` }, { text: `${deptPort.port_c_cod || ''}` }], border: [true, true, true, false] },
              { text: [{ text: `${tOrigDest}  `, style: `${labelStyle}` }, { text: `(${district.district_code})\n` }, { text: `${district.district_name || ''}` }], border: [true, true, true, false] },
            ],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: [150, 62, 110, '*', 102],
          heights: [20, 20, 20],
          body: [
            [
              { text: [{ text: '许可证号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.license_no || ''}` }] },
              { text: [{ text: '成交方式  ', style: `${labelStyle}` }, { text: `(${trxnmode.trx_mode})\n` }, { text: `${trxnmode.trx_spec || ''}` }] },
              { text: [{ text: '运费  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${feeRateStr || ''}` }] },
              { text: [{ text: '保费  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${insurRateStr || ''}` }] },
              { text: [{ text: '杂费  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${otherRateStr || ''}` }] },
            ],
            [
              { text: [{ text: '合同协议号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.contr_no || ''}` }] },
              { text: [{ text: '件数  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.pack_count || ''}` }] },
              { text: [{ text: '包装种类  ', style: `${labelStyle}` }, { text: `(${wrapType.value})\n` }, { text: `${wrapType.text || ''}` }] },
              { text: [{ text: '毛重(千克)  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.gross_wt || ''}` }] },
              { text: [{ text: '净重(千克)  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.net_wt || ''}` }] },
            ],
            [
              { text: [{ text: '集装箱号  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.container_no || ''}` }] },
              { colSpan: 4, text: [{ text: '随附单证  ', style: `${labelStyle}` }, { text: '\n' }, { text: `${head.cert_mark || ''}` }] },
              {}, {}, {},
            ],
          ],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
            return 0.8;
          },
        },
      },
      {
        style: 'table',
        table: {
          widths: ['100%'],
          heights: [48],
          body: [[
            { text: [{ text: '标记唛码及备注  ', style: `${labelStyle}` }, { text: `${head.note || ''}` }], border: [true, false, true, false] },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
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
            { text: '项号', style: `${labelStyle}` },
            { text: '商品编号', style: `${labelStyle}` },
            { text: '商品名称、规格型号', style: `${labelStyle}` },
            { text: '数量及单位', style: `${labelStyle}` },
            { text: `${tOrigDestCntry}`, style: `${labelStyle}` },
            { text: '单价', style: `${labelStyle}` },
            { text: '总价', style: `${labelStyle}` },
            { text: '币制', style: `${labelStyle}` },
            { text: '征免', style: `${labelStyle}` },
          ]],
        },
        layout: {
          paddingTop() { return 0; },
          paddingBottom() { return 0; },
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
          },
          hLineWidth() {
            if (skeleton) { return 0; }
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
  if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
    widths = ['4%', '10%', '33%', '10%', '10%', '*', '*', '*', '*'];
  }
  const height = 36;
  const heights = [10, height, height, height, height, height, height, height, height];
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
    body.push(
      `${dbody.g_no || ''}`,
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

export function StandardDocDef(head, bodies, declWayCode, orderNo, params, skeleton) {
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
        margin: [0, 40, 0, 0],
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
      label: {
        color: '#000000',
      },
      invisibleLabel: {
        color: '#ffffff',
      },
    },
    defaultStyle: {
      font: 'yahei',
    },
  };
  const labelStyle = skeleton ? 'invisibleLabel' : 'label';
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
    content = pdfHeader(head, declWayCode, orderNo, params, skeleton);
    content.push({
      style: 'table',
      table: pdfBody(datas, declWayCode, params, skeleton),
      layout: {
        paddingTop() { return 0; },
        paddingBottom() { return 0; },
        vLineWidth(i, node) {
          if (skeleton) { return 0; }
          return (i !== 0 && i !== node.table.widths.length) ? 0 : 1.2;
        },
        hLineColor(i, node) {
          return (i === 0 || i === 1 || i === node.table.body.length) ? 'black' : 'gray';
        },
        hLineWidth(i, node) {
          if (skeleton) { return 0; }
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
      [{ text: '录入人员\n', style: `${labelStyle}`, border: [true, true, false, true] },
        { text: '录入单位\n', style: `${labelStyle}`, border: [false, true, true, true] },
        {
          text: '兹申明对以上内容承担如实申报、依法纳税之法律责任\n', style: `${labelStyle}`, margin: [12, 0, 10, 0], border: [true, true, true, false],
        },
        { text: '海关批注及签章\n', style: `${labelStyle}`, border: [true, true, true, false] }],
      [{
        text: '\n报关人员', style: `${labelStyle}`, colSpan: 2, border: [true, true, false, true],
      }, {},
      {
        text: '\n\n申报单位（签章）', style: `${labelStyle}`, margin: [12, 0, 10, 0], border: [false, false, true, true],
      },
      { text: '\n\n审核日期', style: `${labelStyle}`, border: [true, false, true, true] }],
    ];
    if (declWayCode === 'IMPT' || declWayCode === 'EXPT') {
      pdfFooter = [
        [{ text: '\n', border: [true, false, false, true] },
          { text: '\n', border: [false, false, false, true] },
          { text: '\n', border: [false, false, false, true] },
          { text: '\n', border: [false, false, true, true] }],
        [{ text: '录入人员\n', style: `${labelStyle}`, border: [true, true, false, true] },
          { text: '录入单位\n', style: `${labelStyle}`, border: [false, true, true, true] },
          {
            text: '兹申明对以上内容承担如实申报、依法纳税之法律责任\n', style: `${labelStyle}`, margin: [12, 0, 10, 0], border: [true, true, true, false],
          },
          { text: '海关批注及签章\n', style: `${labelStyle}`, border: [true, true, true, false] }],
        [{
          text: '\n报关人员', style: `${labelStyle}`, colSpan: 2, border: [true, true, false, true],
        }, {},
        {
          text: '\n\n申报单位（签章）', style: `${labelStyle}`, margin: [12, 0, 10, 0], border: [false, false, true, true],
        },
        { text: '', border: [true, false, true, true] }],
      ];
    }
    if (end) {
      content.push({
        style: 'table',
        table: { widths: ['15%', '15%', '37%', '33%'], heights: [14, 36, 42], body: pdfFooter },
        layout: {
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i === node.table.body.length) ? 1.2 : 0.8;
          },
        },
      });
    } else {
      content.push({
        style: 'table',
        pageBreak: 'after',
        table: { widths: ['15%', '15%', '37%', '33%'], body: pdfFooter },
        layout: {
          vLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i !== 0 && i !== node.table.widths.length) ? 0.8 : 1.2;
          },
          hLineWidth(i, node) {
            if (skeleton) { return 0; }
            return (i === node.table.body.length) ? 1.2 : 0.8;
          },
        },
      });
    }
    docDefinition.content = docDefinition.content.concat(content);
  }
  return docDefinition;
}
