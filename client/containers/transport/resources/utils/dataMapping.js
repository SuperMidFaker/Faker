const carStatusTexts = {
  '-1': '已停用',
  '0': '不在途',
  '1': '在途'
};

const connectTypes = {
  '0': '未连接',
  '1': 'APP',
  '2': 'G7'
};

const carTypes = {
  '0': '敞篷车',
  '1': '厢式车',
  '2': '两者均可',
  '3': '轿运车'
};

const lengthTypes = {
  '0': 2.0,
  '1': 4.2,
  '2': 5.2
};

const vpropertyTypes = {
  '0': '司机自有车辆',
  '1': '公司车辆'
};

const driverStatusTexts = {
  '0': '不可用',
  '1': '可用'
};

export const nodeTypes = ['发货地', '收获地', '中转地'];

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

/**
 * 给数组每个成员增加一个唯一的key,主要是因为react生成列表时需要唯一key
 * @param {arr<Array>}
 * @return {Array}
 */
export function addUniqueKeys(arr) {
  return arr.map((item, index) => {
    return {...item, key: index};
  });
}
