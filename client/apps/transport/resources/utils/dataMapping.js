const carStatusTexts = {
  '-1': '已停用',
  0: '不在途',
  1: '在途',
};

const connectTypes = {
  0: '未连接',
  1: 'APP',
  2: 'G7',
};

const carTypes = {
  0: '牵引车',
  1: '厢式车',
  2: '低栏车',
  3: '高栏车',
  4: '平板车',
  5: '集装箱',
  6: '罐式车',
  7: '冷藏车',
  8: '超宽车',
};

const lengthTypes = {
  2: '2M',
  42: '4.2M',
  52: '5.2米',
  62: '6.2米',
  68: '6.8米',
  72: '7.2米',
  76: '7.6米',
  82: '8.2米',
  85: '8.5米',
  96: '9.6米',
  12: '12米',
  125: '12.5米',
  13: '13米',
  135: '13.5米',
  16: '16米',
  175: '17.5米',
};

const vpropertyTypes = {
  0: '司机自有车辆',
  1: '公司车辆',
};

const driverStatusTexts = {
  0: '不可用',
  1: '可用',
};

export const nodeTypes = ['发货地', '收货地', '中转地'];

export function transformRawCarDataToDisplayData(car) {
  const displayData = Object.assign({}, car);

  // map status code such as 0, 1 to status test
  displayData.status = displayData.status !== undefined ? carStatusTexts[displayData.status] : carStatusTexts[0];
  // map connect_type code to connect_type text
  displayData.connect_type = displayData.connect_type ? connectTypes[displayData.connect_type] : connectTypes[0];
  // map car type code to type text
  displayData.type = carTypes[displayData.type];
  // map car length code to length text
  displayData.length = lengthTypes[displayData.length];
  // map vpropetry code to text
  displayData.vproperty = vpropertyTypes[displayData.vproperty];

  return displayData;
}

export function transformRawDriverDataToDisplayData(driver) {
  const displayData = Object.assign({}, driver);

  displayData.status = displayData.status !== undefined ? driverStatusTexts[displayData.status] : driverStatusTexts[1];

  return displayData;
}
