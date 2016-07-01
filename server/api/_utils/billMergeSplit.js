import _ from 'lodash';
import DataGrouper from './dataGrouper';

const dg = new DataGrouper();
dg.register('merge', item => {
  const combined = {};
  const summedKeys = [ 'qty', 'dec_total', 'gross_wt', 'wet_wt' ];
  summedKeys.forEach(sk => {
    combined[sk] = _.reduce(item.elements, (prev, elem) => {
      if (elem[sk] && !isNaN(Number(elem[sk]))) {
        return prev + Number(elem[sk]);
      } else {
        return prev;
      }
    }, 0);
  });
  if (combined.qty > 0) {
    combined.dec_price = combined.dec_total / combined.qty;
  }
  if (item.elements.length > 0) {
    const plainKeys = [
      'em_g_no', 'code_t', 'code_s', 'g_name', 'g_model',
      'country_code', 'element', 'unit', 'curr', 'usage', 'rm_mode',
      'reg_code', 'bom_version', 'note', 'creater_login_id',
    ];
    plainKeys.forEach(pk => {
      if (!(pk in item.key)) {
        combined[pk] = item.elements[0][pk];
      }
    });
  }
  return { ...item.key, ...combined };
});

function mergeSortBodies(billList, mergeOpt, sortOpt) {
  let merged = billList;
  if (mergeOpt.checked) {
    const groupedKeys = [];
    if (mergeOpt.byHsCode) {
      groupedKeys.push('code_t', 'code_s');
    }
    if (mergeOpt.byGName) {
      groupedKeys.push('g_name');
    }
    if (mergeOpt.byCurr) {
      groupedKeys.push('curr');
    }
    if (mergeOpt.byCountry) {
      groupedKeys.push('country_code');
    }
    if (mergeOpt.byCopGNo) {
      // 根据料号商品货号
      groupedKeys.push('cop_g_no');
    }
    if (mergeOpt.byEmGNo) {
      groupedKeys.push('em_g_no');
    }
    merged = dg.merge(billList, groupedKeys);
  }
  // todo http://stackoverflow.com/a/6913821
  const fieldOrders = [];
  if (sortOpt.customControl) {
    fieldOrders.push({
      fieldFn: obj => obj.custom_control,
      order: 'desc',
    });
  }
  if (sortOpt.decTotal) {
    fieldOrders.push({
      fieldFn: obj => obj.dec_total,
      order: 'desc',
    });
  }
  if (sortOpt.decPriceDesc) {
    fieldOrders.push({
      fieldFn: obj => obj.dec_price,
      order: 'desc',
    });
  }
  if (sortOpt.hsCodeAsc) {
    fieldOrders.push({
      fieldFn: obj => `${obj.code_t}${obj.code_s}`,
      order: 'asc',
    });
  }
  if (fieldOrders.length > 0) {
    merged = merged.sort((lhs, rhs) => {
      let cmped = 0;
      for (let i = 0; i < fieldOrders.length; i++) {
        const fo = fieldOrders[i];
        if (fo.fieldFn(lhs) === fo.fieldFn(rhs)) {
          continue;
        }
        if (fo.order === 'asc') {
          cmped = fo.fieldFn(lhs) < fo.fieldFn(rhs) ? -1 : 1;
        } else {
          cmped = fo.fieldFn(lhs) < fo.fieldFn(rhs) ? 1 : -1;
        }
        if (cmped !== 0) {
          break;
        }
      }
      return cmped;
    });
  }
  return merged;
}

function copyHead(origHead) {
  const syned = {};
  const excludes = [
    'id', 'created_date', 'pre_entry_id', 'entry_id', 'pack_count',
    'gross_wt', 'wet_wt', 'fee_rate', 'insur_rate', 'other_rate',
  ];
  for (const key in origHead) {
    if (origHead.hasOwnProperty(key) && excludes.indexOf(key) === -1) {
      syned[key] = origHead[key];
    }
  }
  return syned;
}

function splitPerCountToEntries(billList, billHead, maxEntryNum, perCount, billTotal) {
  const entries = [];
  const head = copyHead(billHead);
  const splitCount = Math.ceil(billList.length / perCount);
  let entryCount = maxEntryNum + 1;
  for (let spIndex = 0; spIndex < splitCount; spIndex++) {
    let listNo = 1;
    const curhead = { ...head };
    const bodies = [];
    for (let bIndex = spIndex * perCount; bIndex < (spIndex + 1) * perCount; bIndex++) {
      if (bIndex < billList.length) {
        bodies.push({ ...billList[bIndex], list_g_no: listNo++ });
      } else {
        break;
      }
    }
    curhead.comp_entry_id = `${billHead.bill_no}-${entryCount++}`;
    curhead.gross_wt = 0;
    curhead.wet_wt = 0;
    bodies.forEach(bd => curhead.gross_wt += bd.gross_wt || 0);
    bodies.forEach(bd => curhead.wet_wt += bd.wet_wt || 0);
    let thisDecTotal = 0;
    bodies.forEach(bd => thisDecTotal += bd.dec_total || 0);
    curhead.other_rate = billHead.gross_wt > 0 ?
      billHead.other_rate * (curhead.gross_wt / billHead.gross_wt) : 0;
    curhead.fee_rate = billHead.gross_wt > 0 ?
      billHead.fee_rate * (curhead.gross_wt / billHead.gross_wt) : 0;
    curhead.insur_rate = billTotal > 0 ?
      billHead.insur_rate * (thisDecTotal / billTotal) : 0;
    curhead.pack_count = billHead.gross_wt > 0 ?
      billHead.pack_count * (curhead.gross_wt / billHead.gross_wt) : 0;
    entries.push({ head: curhead, bodies });
  }
  return entries;
}

export default function mergeSplit(billHead, entryNumSoFar, billList, splitOpt, mergeOpt, sortOpt) {
  let specailHsCodeBillList = [];
  let customControlBillList = [];
  let normalBillList = billList;
  let billTotal = 0;
  billList.forEach(bl => billTotal += bl.dec_total);
  if (splitOpt.byHsCode) {
    specailHsCodeBillList = billList.filter(bl => bl.special_hscode > 0);
    normalBillList = normalBillList.filter(bl => bl.special_hscode === 0);
  }
  if (splitOpt.byCustom) {
    customControlBillList = billList.filter(bl => bl.custom_control > 0);
    normalBillList = normalBillList.filter(bl => bl.custom_control === 0);
  }
  specailHsCodeBillList = mergeSortBodies(specailHsCodeBillList, mergeOpt, sortOpt);
  customControlBillList = mergeSortBodies(customControlBillList, mergeOpt, sortOpt);
  normalBillList = mergeSortBodies(normalBillList, mergeOpt, sortOpt);

  let entries = splitPerCountToEntries(specailHsCodeBillList, billHead,
    entryNumSoFar, splitOpt.perCount, billTotal);
  entries = entries.concat(splitPerCountToEntries(customControlBillList, billHead,
    entryNumSoFar + entries.length, splitOpt.perCount, billTotal));
  entries = entries.concat(splitPerCountToEntries(normalBillList, billHead,
    entryNumSoFar + entries.length, splitOpt.perCount, billTotal));
  return entries;
}
