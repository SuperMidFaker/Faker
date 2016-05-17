const statusTexts = {
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

export function transformRawCarDataToDisplayData(car) {
  const displayData = Object.assign({}, car);

  // map status code such as 0, 1 to status test
  displayData.status = displayData.status ? statusTexts[displayData.status] : statusTexts[0];
  // map connect_type code to connect_type text
  displayData.connect_type = displayData.connect_type ? connectTypes[displayData.connect_type] : connectTypes[0];
  // map car type code to type text
  displayData.type = carTypes[displayData.type];
  // map car length code to length text
  displayData.length = lengthTypes[displayData.length];
  // map vpropetry code to text
  displayData.vproperty = vpropertyTypes[displayData.vproperty];
  // add `key` unique props
  displayData.key = displayData.vehicle_id;

  return displayData;
}
