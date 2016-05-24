import React, { PropTypes } from 'react';
import { Row, Col, Select } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { CHINA_CODE } from '../../common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import world from './worldwide-regions.json';
import chinaRegions from './china-regions.json';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const formatMsg = format(messages);

@injectIntl
export default class RegionCascade extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    withoutCountry: PropTypes.bool,
    setFormValue: PropTypes.func.isRequired,
    region: PropTypes.object.isRequired
  }
  static defaultProps = {
    withoutCountry: false
  }
  constructor(...args) {
    super(...args);
    this.defaultProvince = formatMsg(this.props.intl, 'defaultProvRegions');
    this.defaultCity = formatMsg(this.props.intl, 'defaultCityRegions');
    this.defaultCounty = formatMsg(this.props.intl, 'defaultCountyRegions');
    const cities = this.getCitiesFromProvince(this.props.region.province) || [];
    const counties = this.getCountiesFromCity(cities, this.props.region.city) || [];
    this.state = {
      disableProvince: false,
      country: CHINA_CODE,
      province: this.props.region.province || this.defaultProvince,
      cities,
      city: this.props.region.city || this.defaultCity,
      counties,
      county: this.props.region.county || this.defaultCounty
    };
  }
  componentWillReceiveProps(nextProps) {
    const propsAsState = {};
    ['country', 'province', 'city', 'county'].forEach((key) => {
      if (nextProps.region[key] && nextProps.region[key] !== this.state[key]) {
        propsAsState[key] = nextProps.region[key];
      }
    });
    const cities = this.getCitiesFromProvince(propsAsState.province);
    if (cities) {
      propsAsState.cities = cities;
    }
    const counties = this.getCountiesFromCity(propsAsState.cities, propsAsState.city);
    if (counties) {
      propsAsState.counties = counties;
    }
    this.setState(propsAsState);
  }
  getCitiesFromProvince(province) {
    let cities;
    if (province) {
      for (let i = 0; i < chinaRegions.province.length; i++) {
        const prov = chinaRegions.province[i];
        if (prov.name === province) {
          if (prov.city) {
            if (Array.isArray(prov.city)) {
              cities = prov.city;
            } else {
              cities = [prov.city];
            }
          } else {
            cities = [];
          }
          break;
        }
      }
    }
    return cities;
  }
  getCountiesFromCity(cities, curCity) {
    let counties;
    if (cities && curCity) {
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        if (city.name === curCity) {
          if (city.county) {
            if (Array.isArray(city.county)) {
              counties = city.county;
            } else {
              counties = [city.county];
            }
          } else {
            counties = [];
          }
          break;
        }
      }
    }
    return counties;
  }
  handleCountryChange(value) {
    if (value !== CHINA_CODE) {
      this.setState({
        disableProvince: true,
        province: this.defaultProvince,
        cities: [],
        city: this.defaultCity,
        counties: [],
        county: this.defaultCounty
      });
    } else {
      this.setState({disableProvince: false});
    }
    this.props.setFormValue('country', value);
  }
  handleProvinceChange(value) {
    const cities = this.getCitiesFromProvince(value);
    this.setState({cities, city: this.defaultCity, counties: [], county: this.defaultCounty});
    this.props.setFormValue('province', value);
    this.props.setFormValue('city', undefined);
    this.props.setFormValue('district', undefined);
  }
  handleCityChange(value) {
    const counties = this.getCountiesFromCity(
      this.state.cities, value
    );
    this.setState({counties, county: this.defaultCounty});
    this.props.setFormValue('city', value);
    this.props.setFormValue('district', undefined);
  }
  handleCountyChange(value) {
    this.props.setFormValue('district', value);
  }
  render() {
    const { country, province, cities, city, counties, county, disableProvince } = this.state;
    return (
      <Row>
        {
          !this.props.withoutCountry &&
        <Col span="24">
          <Select size="large" value={country} style={{width: '100%'}} onChange={(value) => this.handleCountryChange(value)}>
            <OptGroup label={formatMsg(this.props.intl, 'selectCountry')}>
              {
                world.countries.map((ctry) => (<Option value={ctry.code} key={ctry.code}>{ctry.zh_cn}</Option>))
              }
            </OptGroup>
          </Select>
        </Col>
        }
        <Col span="8">
          <Select size="large" value={province} disabled={disableProvince} style={{width: '100%'}} onChange={(value) => this.handleProvinceChange(value)}>
            {
              chinaRegions.province.map((prov, idx) => <Option value={prov.name} key={`prov.name${idx}`}>{prov.name}</Option>)
            }
          </Select>
        </Col>
        <Col span="7" offset="1">
          <Select size="large" value={city} disabled={disableProvince} style={{width: '100%'}} onChange={(value) => this.handleCityChange(value)}>
          {
            cities.map((c, idx) => <Option value={c.name} key={`c.name${idx}`}>{c.name}</Option>)
          }
          </Select>
        </Col>
        <Col span="7" offset="1">
          <Select size="large" value={county} disabled={disableProvince} style={{width: '100%'}} onChange={(value) => this.handleCountyChange(value)}>
          {
            counties.map((c, idx) => <Option value={c.name} key={`c.name${idx}`}>{c.name}</Option>)
          }
          </Select>
        </Col>
      </Row>);
  }
}
