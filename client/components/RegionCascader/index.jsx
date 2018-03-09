/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Select, Cascader, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CHINA_CODE } from 'common/constants';
import { loadProvinces, loadRegionChildren, loadNextRegionList } from 'common/reducers/chinaRegions';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import world from './worldwide-regions.json';

const { Option } = Select;
const { OptGroup } = Select;
const formatMsg = format(messages);

function getRegionProps(nextRegion) {
  if (!nextRegion) {
    return [];
  }
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
  props.loadNextRegionList(province, city, district).then((result) => {
    const chinaRegions = props.provinces.map(prov => ({
      value: prov.name,
      label: prov.name,
      code: prov.code,
      isLeaf: false,
    }));
    let regions = chinaRegions;
    const tests = [province, city, district];
    const results = [result.data.cities, result.data.districts, result.data.streets];
    for (let level = 0; level < 3; level++) {
      for (let i = 0; i < regions.length; i++) {
        const rg = regions[i];
        if (rg.label === tests[level]) {
          rg.children = results[level].map(cit => ({
            value: cit.name,
            label: cit.name,
            code: cit.code,
            isLeaf: level === 2,
          }));
          regions = rg.children;
          break;
        }
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
export default class RegionCascader extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    country: PropTypes.string, // undefined 不显示country编辑框
    defaultRegion: PropTypes.array, // 初值 [ 'province', 'city', 'district', 'street' ]
    region: PropTypes.array, // 受控值 [ 'province', 'city', 'district', 'street' ]
    provinces: PropTypes.array.isRequired,
    provLoaded: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired, // value参数 ['region_code', 'province', 'city','district', 'street'], country
    loadProvinces: PropTypes.func.isRequired,
  }
  constructor(...args) {
    super(...args);
    this.state = {
      disableCascader: false,
      country: CHINA_CODE,
      chinaRegions: [],
      cascadeRegion: [],
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
    if (this.props.country !== undefined) {
      this.setState({ country: this.props.country });
    }
    if (this.props.defaultRegion) {
      const areaItems = getRegionProps(this.props.defaultRegion);
      if (areaItems.length > 0) {
        getNextChinaRegions(areaItems, this.props, (chinaRegions) => {
          this.setState({ chinaRegions });
        });
        this.setState({ cascadeRegion: areaItems });
      }
    }
  }
  componentDidMount() {
    if (!this.props.provLoaded) {
      this.props.loadProvinces().then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        }
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.country !== this.props.country) {
      this.setState({
        country: nextProps.country,
      });
    }
    if (nextProps.provinces.length !== this.props.provinces.length) {
      // 页面刷新provinces比defaultRegion/region迟加载
      const areaItems = getRegionProps(nextProps.defaultRegion);
      if (areaItems.length > 0) {
        getNextChinaRegions(areaItems, nextProps, (chinaRegions) => {
          this.setState({ chinaRegions });
        });
        this.setState({ cascadeRegion: areaItems });
      } else {
        const chinaRegions = nextProps.provinces.map(prov => ({
          value: prov.name,
          label: prov.name,
          code: prov.code,
          isLeaf: false,
        }));
        this.setState({ chinaRegions });
      }
    } else if (!isEmptyRegionProp(nextProps.defaultRegion) &&
      isEmptyRegionProp(this.props.defaultRegion)) {
      const areaItems = getRegionProps(nextProps.defaultRegion);
      getNextChinaRegions(
        areaItems, nextProps,
        (chinaRegions) => {
          this.setState({ chinaRegions });
        }
      );
      this.setState({ cascadeRegion: areaItems });
    } else if (nextProps.region !== this.props.region) {
      if (isEmptyRegionProp(nextProps.region)) {
        this.setState({ cascadeRegion: [] });
      } else {
        // this.state.cascadeRegion未变成onChange后值,不能直接与areaItems比较
        const areaItems = getRegionProps(nextProps.region);
        getNextChinaRegions(
          areaItems, nextProps,
          (chinaRegions) => {
            this.setState({ chinaRegions });
          }
        );
        this.setState({ cascadeRegion: areaItems });
      }
    }
  }
  handleCountryChange = (value) => {
    if (value !== CHINA_CODE) {
      this.setState({
        disableCascader: true,
        cascadeRegion: [],
      });
    } else {
      this.setState({
        disableCascader: false,
      });
    }
    this.props.onChange([], value);
  }
  handleRegionLoad = (selOpts) => {
    if (!selOpts || selOpts.length === 0) {
      return;
    }
    const targetOption = selOpts[selOpts.length - 1];
    this.props.loadRegionChildren(targetOption.code).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
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
  }
  handleRegionChange = (values, selOpts) => {
    this.setState({ cascadeRegion: values });
    const areaItems = [...values];
    if (selOpts && selOpts.length > 0) {
      const targetOption = selOpts[selOpts.length - 1];
      areaItems.unshift(targetOption.code);
    }
    this.props.onChange(areaItems, this.state.country);
  }
  render() {
    const {
      cascadeRegion, country, disableCascader, chinaRegions,
    } = this.state;
    const { intl } = this.props;
    return (
      <Row>
        {
          this.props.country !== undefined &&
          <Select value={country} style={{ width: '100%', marginBottom: 8 }} onChange={this.handleCountryChange}>
            <OptGroup label={formatMsg(intl, 'selectCountry')}>
              {
              world.countries.map(ctry =>
                <Option value={ctry.code} key={ctry.code}>{ctry.zh_cn}</Option>)
            }
            </OptGroup>
          </Select>
        }
        <Cascader
          options={chinaRegions}
          disabled={disableCascader}
          style={{ width: '100%' }}
          placeholder={formatMsg(intl, 'defaultCascaderRegion')}
          loadData={this.handleRegionLoad}
          changeOnSelect
          onChange={this.handleRegionChange}
          value={cascadeRegion}
          showSearch
        />
      </Row>
    );
  }
}
