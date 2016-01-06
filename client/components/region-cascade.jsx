import React, { PropTypes } from 'react';
import {Row, Col, Select} from '../../reusable/ant-ui';
import world from './worldwide-regions.json';
import chinaRegions from './china-regions.json';
const Option = Select.Option;
const OptGroup = Select.OptGroup;

export default class RegionCascade extends React.Component {
  static propTypes = {
    setFormValue: PropTypes.func.isRequired,
    region: PropTypes.object.isRequired
  }
  constructor(...args) {
    super(...args);
    this.state = {
      disableProvince: false,
      country: 'CN',
      province: '省/自治区/直辖市',
      cities: [],
      city: '市',
      counties: [],
      county: '区县'
    };
  }
  componentWillReceiveProps(nextProps) {
    const propsAsState = {};
    ['country', 'province', 'city', 'county'].forEach((key) => {
      if (nextProps.region[key] && nextProps.region[key] !== this.state[key]) {
        propsAsState[key] = nextProps.region[key];
      }
    });
    this.setState(propsAsState);
  }
  handleCountryChange(value) {
    if (value !== 'CN') {
      this.setState({disableProvince: true});
    } else {
      this.setState({disableProvince: false});
    }
    this.props.setFormValue('country', value);
  }
  handleProvinceChange(value) {
    let cities;
    chinaRegions.province.forEach((prov) => {
      if (prov.name === value) {
        cities = prov.city;
        return;
      }
    });
    this.setState({cities});
    this.props.setFormValue('province', value);
  }
  handleCityChange(value) {
    let counties;
    this.state.cities.forEach((city) => {
      if (city.name === value) {
        counties = city.county;
        return;
      }
    });
    this.setState({counties});
    this.props.setFormValue('city', value);
  }
  handleCountyChange(value) {
    this.props.setFormValue('district', value);
  }
  render() {
    const {country, province, cities, city, counties, county, disableProvince} = this.state;
    return (
      <Row>
        <Col span="24">
          <Select value={country} style={{width: '100%'}} onChange={(value) => this.handleCountryChange(value)}>
            <OptGroup label="选择国家或地区">
              {
                world.countries.map((ctry) => {
                  return (<Option value={ctry.code}>{ctry.zh_cn}</Option>);
                })
              }
            </OptGroup>
          </Select>
        </Col>
        <Col span="8">
          <Select value={province} disabled={disableProvince} style={{width: '100%', marginTop: 10}} onChange={(value) => this.handleProvinceChange(value)}>
            {
              chinaRegions.province.map((prov) => {
                return (<Option value={prov.name}>{prov.name}</Option>);
              })
            }
          </Select>
        </Col>
        <Col span="7" offset="1">
          <Select value={city} disabled={disableProvince} style={{width: '100%', marginTop: 10}} onChange={(value) => this.handleCityChange(value)}>
          {
            cities.map((c) => {
              return (<Option value={c.name}>{c.name}</Option>);
            })
          }
          </Select>
        </Col>
        <Col span="7" offset="1">
          <Select value={county} disabled={disableProvince} style={{width: '100%', marginTop: 10}} onChange={(value) => this.handleCountyChange(value)}>
          {
            counties.map((c) => {
              return (<Option value={c.name}>{c.name}</Option>);
            })
          }
          </Select>
        </Col>
      </Row>);
  }
}
