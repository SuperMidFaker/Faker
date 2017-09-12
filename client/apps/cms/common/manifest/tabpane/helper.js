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
  const netwtdecimal = countDecimal(netWtSum);
  const fixed = decimal < 2 ? 2 : decimal;
  let finalFixed = fixed;
  for (let i = 0; i < netWts.length; i++) {
    const netwt = netWts[i];
    const divgrosswt = totalGrossWt * netwt / netWtSum;
    let grosswt = Number(divgrosswt.toFixed(fixed));
    if (grosswt === 0) {
      grosswt = Number(divgrosswt.toFixed(netwtdecimal));
      finalFixed = netwtdecimal;
    }
    totalRoundGrossWt += grosswt;
    grossWts.push(grosswt);
    if (netwt > netWts[maxNetWtIdx]) {
      maxNetWtIdx = i;
    }
  }
  grossWts[maxNetWtIdx] = Number((grossWts[maxNetWtIdx] + totalGrossWt - totalRoundGrossWt).toFixed(finalFixed));
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
  const tradedecimal = countDecimal(tradeTotal);
  const fixed = decimal < 2 ? 2 : decimal;
  let finalFixed = fixed;
  for (let i = 0; i < tradeAmounts.length; i++) {
    const tradeamt = tradeAmounts[i];
    const divamt = (totalAmount * tradeamt / tradeTotal);
    let amt = Number(divamt.toFixed(fixed));
    if (amt === 0) {
      amt = Number(divamt.toFixed(tradedecimal));
      finalFixed = tradedecimal;
    }
    totalRoundAmount += amt;
    amts.push(amt);
    if (tradeamt > tradeAmounts[maxAmountIdx]) {
      maxAmountIdx = i;
    }
  }
  amts[maxAmountIdx] = Number((amts[maxAmountIdx] + totalAmount - totalRoundAmount).toFixed(finalFixed));
  return amts;
}
