function countDecimal(floatNum) {
  if (Math.floor(floatNum) === floatNum) {
    return 0;
  } else {
    const digits = floatNum.toString().split('.')[1];
    return digits ? digits.length : 0;
  }
}

export function dividGrossWt(netWts, totalGrossWt) {
  if (netWts.length === 0) {
    return [];
  }
  const netWtSum = netWts.reduce((acc, value) => value + acc, 0);
  const grossWts = [];
  let totalRoundGrossWt = 0;
  let maxNetWtIdx = 0;
  const decimal = countDecimal(totalGrossWt);
  const fixed = decimal < 2 ? 2 : decimal;
  for (let i = 0; i < netWts.length; i++) {
    const netwt = netWts[i];
    const grosswt = Number((totalGrossWt * netwt / netWtSum).toFixed(fixed));
    totalRoundGrossWt += grosswt;
    grossWts.push(grosswt);
    if (netwt > netWts[maxNetWtIdx]) {
      maxNetWtIdx = i;
    }
  }
  grossWts[maxNetWtIdx] += Number((totalGrossWt - totalRoundGrossWt).toFixed(fixed));
  return grossWts;
}

export function dividAmount(tradeAmounts, totalAmount) {
  if (tradeAmounts.length === 0) {
    return [];
  }
  const tradeTotal = tradeAmounts.reduce((acc, value) => acc + value, 0);
  const amts = [];
  let totalRoundAmount = 0;
  let maxAmountIdx = 0;
  const decimal = countDecimal(totalAmount);
  const fixed = decimal < 2 ? 2 : decimal;
  for (let i = 0; i < tradeAmounts.length; i++) {
    const tradeamt = tradeAmounts[i];
    const amt = Number((totalAmount * tradeamt / tradeTotal).toFixed(fixed));
    totalRoundAmount += amt;
    amts.push(amt);
    if (tradeamt > tradeAmounts[maxAmountIdx]) {
      maxAmountIdx = i;
    }
  }
  amts[maxAmountIdx] += Number((totalAmount - totalRoundAmount).toFixed(fixed));
  return amts;
}
