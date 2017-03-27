import { TARIFF_METER_METHODS } from 'common/constants';

export function getChargeAmountExpression(meter, gradient, miles, quantity, unitRatio, coefficient) {
  const amounts = [`${gradient}`];
  if (meter) {
    if (meter === TARIFF_METER_METHODS[3].value) {
      amounts.push(`x${miles}公里`);
    }
    if (meter === TARIFF_METER_METHODS[2].value) {
      amounts.push(`x${quantity}立方米`);
    } else {
      amounts.push(`x${quantity}千克`);
    }
  }
  if (!meter || unitRatio !== 1) {
    amounts.push(`x${unitRatio}`);
  }
  if (coefficient !== 1) {
    amounts.push(`x${coefficient}`);
  }
  return amounts.join('');
}
