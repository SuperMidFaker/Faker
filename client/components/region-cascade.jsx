import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Select, Cascader, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CHINA_CODE } from '../../common/constants';
import { loadProvinces, loadRegionChildren, loadNextRegionList } from 'common/reducers/chinaRegions';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import world from './worldwide-regions.json';
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const formatMsg = format(messages);

function getRegionProps(nextRegion) {
  const [province, city, district, street] = nextRegion;
  const items = [];
  if (province) {
    items.push(province);
  }
  if (city) {
    items.push(city);
  }
  if (district) {
    items.push(district);
  }
  if (street) {
    items.push(street);
  }
  return items;
}

function getNextChinaRegions(nextRegion, props, resolve) {
  const [province, city, district] = nextRegion;
  props.loadNextRegionList(province, city, district).then(result => {
    const chinaRegions = props.provinces.map(prov => ({
      value: prov.name,
      label: prov.name,
      code: prov.code,
      isLeaf: false,
    }));
    let regions = chinaRegions;
    for (let i = 0; i < regions.length; i++) {
      const provRg = regions[i];
      if (provRg.label === province) {
        provRg.children = result.data.cities.map(cit => ({
          value: cit.name,
          label: cit.name,
          code: cit.code,
          isLeaf: false,
        }));
        regions = provRg.children;
        break;
      }
    }
    for (let i = 0; i < regions.length; i++) {
      const cityRg = regions[i];
      if (cityRg.label === city) {
        cityRg.children = result.data.districts.map(distr => ({
          value: distr.name,
          label: distr.name,
          code: distr.code,
          isLeaf: false,
        }));
        regions = cityRg.children;
        break;
      }
    }
    for (let i = 0; i < regions.length; i++) {
      const distrRg = regions[i];
      if (distrRg.label === district) {
        distrRg.children = result.data.streets.map(str => ({
          value: str.name,
          label: str.name,
          code: str.code,
        }));
        break;
      }
    }
    resolve(chinaRegions);
  });
}

function isEmptyRegionProp(region) {
  if (!region) {
    return true;
  }
  return region.length === 0 || !region[0];
}

@injectIntl
@connect(
  state => ({
    provinces: state.chinaRegions.provinces,
    provLoaded: state.chinaRegions.provLoaded,
  }),
  { loadRegionChildren, loadProvinces, loadNextRegionList }
)
export default class RegionCascade extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    country: PropTypes.string, // undefined 不显示country编辑框
    // todo 统一region使用
    region: PropTypes.array,  // [ 'province', 'city', 'district', 'street' ]
    provinces: PropTypes.array.isRequired,
    provLoaded: PropTypes.bool.isRequired,
    onChange: PropTypes.func, // value参数 ['region_code', 'province', 'city','district', 'street'], country
    loadProvinces: PropTypes.func.isRequired,
    loadNextRegionList: PropTypes.func.isRequired,
  }
  constructor(...args) {
    super(...args);
    this.state = {
      disableCascader: false,
      country: CHINA_CODE,
      chinaRegions: [],
      areaItems: [],
    };
  }
  componentWillMount() {
    if (this.props.provLoaded) {
      const chinaRegions = this.props.provinces.map(prov => ({
        value: prov.name,
        label: prov.name,
        code: prov.code,
        isLeaf: false,
      }));
      this.setState({ chinaRegions });
    }
    if (this.props.region) {
      console.log('will mount region', this.props.region);
      const areaItems = getRegionProps(this.props.region);
      if (areaItems.length > 0) {
        getNextChinaRegions(areaItems, this.props, chinaRegions => {
          this.setState({ chinaRegions });
        });
        this.setState({ areaItems });
      }
    }
  }
  componentDidMount() {
    if (!this.props.provLoaded) {
      this.props.loadProvinces().then(result => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
    }
  }
  componentWillReceiveProps(nextProps) {
      console.log('will receive', nextProps.region, this.props.region, this.state.areaItems);
      console.log('will receive', nextProps.provinces, this.props.provinces);
    if (nextProps.region.country !== this.props.region.country) {
      this.setState({
        country: nextProps.region.country,
      });
    }
    if (nextProps.provinces.length !== this.props.provinces.length) {
      const areaItems = getRegionProps(nextProps.region);
      if (areaItems.length > 0) {
        console.log('provinces areas', areaItems);
        getNextChinaRegions(areaItems, nextProps, chinaRegions => {
          this.setState({ chinaRegions });
        });
        this.setState({ areaItems });
      } else {
        const chinaRegions = nextProps.provinces.map(prov => ({
          value: prov.name,
          label: prov.name,
          code: prov.code,
          isLeaf: false,
        }));
        this.setState({ chinaRegions });
      }
    } else if (!isEmptyRegionProp(nextProps.region)) {
      if (isEmptyRegionProp(this.props.region)) {
        const areaItems = getRegionProps(nextProps.region);
        getNextChinaRegions(areaItems, nextProps,
          chinaRegions => {
            this.setState({ chinaRegions });
        });
        console.log('new state', areaItems);
        this.setState({ areaItems });
      }
    } else if (!isEmptyRegionProp(this.props.region)) {
      console.log('set areas empty');
      this.setState({ areaItems: [] });
    }
  }
  handleCountryChange = (value) => {
    if (value !== CHINA_CODE) {
      this.setState({
        disableCascader: true,
        areaItems: [],
      });
    } else {
      this.setState({
        disableCascader: false,
      });
    }
    if (this.props.onChange) {
      this.props.onChange([], value);
    }
  }
  handleRegionLoad = (selOpts) => {
    const targetOption = selOpts[selOpts.length - 1];
    this.props.loadRegionChildren(targetOption.code).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        targetOption.children = result.data.map(rg => ({
          value: rg.name,
          label: rg.name,
          code: rg.code,
          isLeaf: selOpts.length === 3,
        }));
        this.setState({ chinaRegions: [...this.state.chinaRegions] });
      }
    });
    const areaItems = [];
    for (let i = 0; i < selOpts.length; i++) {
      areaItems.push(selOpts[i].value);
    }
    this.setState({ areaItems: [...areaItems] });
    if (this.props.onChange) {
      areaItems.unshift(selOpts[selOpts.length - 1].code);
      this.props.onChange(areaItems);
    }
  }
  handleRegionChange = (values, selOpts) => {
    if (this.props.onChange) {
      const areaItems = [...values];
      if (selOpts.length > 0) {
        areaItems.unshift(selOpts[selOpts.length - 1].code);
      }
      this.props.onChange(areaItems);
    }
    console.log('region change', values);
    this.setState({ areaItems: values });
  }
  render() {
    const { areaItems, country, disableCascader, chinaRegions } = this.state;
    const { intl } = this.props;
    console.log('render', this.state);
    return (
      <Row>
        {
          this.props.country !== undefined &&
          <Select size="large" value={country} style={{ width: '100%', marginBottom: 8 }} onChange={this.handleCountryChange}>
            <OptGroup label={formatMsg(intl, 'selectCountry')}>
            {
              world.countries.map(ctry => <Option value={ctry.code} key={ctry.code}>{ctry.zh_cn}</Option>)
            }
            </OptGroup>
          </Select>
        }
        <Cascader size="large" options={chinaRegions} disabled={disableCascader}
          placeholder={formatMsg(intl, 'defaultCascaderRegion')} onChange={this.handleRegionChange}
          loadData={this.handleRegionLoad} changeOnSelect value={areaItems}
        />
      </Row>
    );
  }
}
