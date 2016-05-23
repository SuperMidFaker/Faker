/**
 * 这是个执行脚本,生成可用于antd Cascader组件使用的region options选项, 形式格式参见http://ant.design/#/components/cascader
 * @param {}
 * @return {}
 * 
 */
'use strict';
const fs = require('fs');
const region = require('./../../../../components/china-regions');
const provinces = region.province;

const transformedRegion = [];

console.log('开始生成文件...');
for(let province of provinces) {
  let cities = province.city || [];
  let cityChildren = [];
  for(let city of cities) {
    let counties = [];
    if (city.county) {
      if (Array.isArray(city.county)) {
        counties = city.county;
      } else {
        counties = [city.county];
      }
    }
    console.log(counties);
    let countyChildren = [];
    for(let county of counties) {
      countyChildren.push({label: county.name, value: county.name});
    }
    cityChildren.push({label: city.name, value: city.name, children: countyChildren});
  }
  transformedRegion.push({label: province.name, value: province.name, children: cityChildren});
}

const locaction = `${__dirname}/region.json`;

fs.writeFileSync(locaction, JSON.stringify(transformedRegion, null, ' '));
console.log(`文件生成完毕, 位置在${locaction}`);