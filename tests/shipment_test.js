import { genShipmtNo } from '../server/api/_utils/shipment';

const genMap = new Map();
for (let i = 0; i < 10000; i++) {
  const shipmtno = genShipmtNo('NLO', 'NLO1600015');
  const dupCount = genMap.get(shipmtno);
  if (dupCount) {
    console.log(shipmtno, 'duplicate number', dupCount + 1);
    genMap.set(shipmtno, dupCount + 1);
  } else {
    console.log(shipmtno);
    genMap.set(shipmtno, 1);
  }
}
