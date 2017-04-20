import { dividGrossWt, dividAmount } from '../client/apps/cms/common/manifest/panel/helper';

let totGrossWt = 41.1;
let bodyDatas = [{ a: 'aa', wet_wt: 5 }, { a: 'bb', wet_wt: 10.3 }, { a: 'cc' }, { a: 'dd', wet_wt: 22.7 }, {}];
dividGrossWt(bodyDatas.slice(0, bodyDatas.length - 1).map(bd => bd.wet_wt || 0), totGrossWt);
// assert(wts === [5.41, 11.14, 0, 24.55]);

totGrossWt = 41;
bodyDatas = [{ a: 'aa', wet_wt: 39 }];
console.log(dividGrossWt(bodyDatas.map(bd => bd.wet_wt || 0), totGrossWt));

totGrossWt = 83.1378;
bodyDatas = [{ a: 'aa', wet_wt: 25.35894 }, { a: 'bb', wet_wt: 20.36 }, { a: 'cc' }, { a: 'dd', wet_wt: 32.7 }];
// dividGrossWt(bodyDatas.map(bd => bd.wet_wt || 0), totGrossWt) === [ 26.8849, 21.5852, 0, 34.6677 ];

const amount = 77.555;
bodyDatas = [{ a: 'aa', trade_total: 25.35894 }, { a: 'bb', trade_total: 20.36 }, { a: 'cc', trade_total: 10.1 }, { a: 'dd', trade_total: 22.72 }];
dividAmount(bodyDatas.map(bd => bd.trade_total), amount);
// amts === [ 25.042, 20.105, 9.973, 22.435 ]
