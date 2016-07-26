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

function isPropsChange(nextProps, props, field) {
  return Object.prototype.hasOwnProperty.call(nextProps, field) &&
    nextProps[field] && nextProps[field] !== props[field];
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
    withCountry: PropTypes.bool,
    uncontrolled: PropTypes.bool, // 值由cascade本身控制, true时region传入数组结构
    // todo 统一region使用
    region: PropTypes.oneOfType([
      PropTypes.shape({
        country: PropTypes.string,
        province: PropTypes.string,
        city: PropTypes.string,
        district: PropTypes.string,
        street: PropTypes.string,
      }),
      PropTypes.array,  // [ 'province', 'city', 'district', 'street' ]
    ]),
    provinces: PropTypes.array.isRequired,
    provLoaded: PropTypes.bool.isRequired,
    setFormValue: PropTypes.func, // 'province'/'city'/'district', value
    onCascadeChange: PropTypes.func, // ant-design cascade本身的onChange参数
    loadProvinces: PropTypes.func.isRequired,
    loadNextRegionList: PropTypes.func.isRequired,
  }
  static defaultProps = {
    withCountry: false,
    uncontrolled: false,
  }
  constructor(...args) {
    super(...args);
    this.state = {
      disableCascader: false,
      country: CHINA_CODE,
      chinaRegions: [],
      areaItems: !this.props.uncontrolled && this.props.region && this.props.region.province ?
        [this.props.region.province, this.props.region.city, this.props.region.district]
        : [],
    };
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
    if (!nextProps.uncontrolled && nextProps.region) {
      const propsAsState = {};
      if (nextProps.region.country !== this.props.region.country) {
        propsAsState.country = nextProps.region.country;
      }
      if (!nextProps.region.province) {
        // 清空
        propsAsState.areaItems = [];
      } else if (
        isPropsChange(nextProps.region, this.props.region, 'province') ||
        isPropsChange(nextProps.region, this.props.region, 'city') ||
        isPropsChange(nextProps.region, this.props.region, 'district')
      ) {
        propsAsState.areaItems = [
          nextProps.region.province,
          nextProps.region.city,
          nextProps.region.district,
          nextProps.region.street,
        ];
      } else {
        propsAsState.areaItems = this.state.areaItems;
      }
      this.setState(propsAsState);
    }
    if (nextProps.region) {
      let province;
      let city;
      let district;
      if (Array.isArray(nextProps.region)) {
        province = nextProps.region[0];
        city = nextProps.region[1];
        district = nextProps.region[2];
      } else {
        province = nextProps.region.province;
        city = nextProps.region.city;
        district = nextProps.region.district;
      }
      nextProps.loadNextRegionList(
        province, city, district
      ).then(result => {
        const chinaRegions = nextProps.provinces.map(prov => ({
          value: prov.code,
          label: prov.name,
          id: prov.id,
          children: [],
        }));
        let regions = chinaRegions;
        for (let i = 0; i < regions.length; i++) {
          const provRg = regions[i];
          if (provRg.label === province) {
            provRg.children = result.data.cities.map(cit => ({
              value: cit.code,
              label: cit.name,
              id: cit.id,
              children: [],
            }));
            regions = provRg.children;
            break;
          }
        }
        for (let i = 0; i < regions.length; i++) {
          const cityRg = regions[i];
          if (cityRg.label === city) {
            cityRg.children = result.data.districts.map(distr => ({
              value: distr.code,
              label: distr.name,
              id: distr.id,
              children: [],
            }));
            regions = cityRg.children;
            break;
          }
        }
        for (let i = 0; i < regions.length; i++) {
          const distrRg = regions[i];
          if (distrRg.label === district) {
            distrRg.children = result.data.streets.map(str => ({
              value: str.code,
              label: str.name,
              id: str.id,
            }));
            break;
          }
        }
        console.log(chinaRegions);
        this.setState({ chinaRegions });
      });
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
    if ('setFormValue' in this.props) {
      this.props.setFormValue('country', value);
      this.props.setFormValue('province', undefined);
      this.props.setFormValue('city', undefined);
      this.props.setFormValue('district', undefined);
      this.props.setFormValue('street', undefined);
      this.props.setFormValue('code', undefined);
    }
  }
  handleCascaderChange = (areas) => {
    this.setState({ areaItems: areas });
    if (this.props.onCascadeChange) {
      this.props.onCascadeChange(areas);
    }
    const originRegions = [...this.state.chinaRegions];
    let region = {
      children: originRegions,
    };
    let regionCode;
    for (let i = 0; i < areas.length; i++) {
      for (let j = 0; j < region.children.length; j++) {
        region = region.children[j];
        console.log(areas[i], region);
        if (region.value === areas[i]) {
          regionCode = region.value;
          break;
        }
      }
    }
    this.props.loadRegionChildren(regionCode).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        region.children = result.data.map(rg => ({
          value: rg.code,
          label: rg.name,
          parentId: rg.parentId,
          children: [],
        }));
        this.setState({ chinaRegions: originRegions });
        const [province, city, district, street] = areas;
        if ('setFormValue' in this.props) {
          this.props.setFormValue('province', province);
          this.props.setFormValue('city', city);
          this.props.setFormValue('district', district);
          this.props.setFormValue('street', street);
          this.props.setFormValue('code', regionCode);
        }
      }
    });
  }
  render() {
    const { areaItems, country, disableCascader, chinaRegions } = this.state;
    const { intl, region, uncontrolled } = this.props;
    let valueProps = { value: areaItems };
    if (uncontrolled) {
      valueProps = { defaultValue: region };
    }
    return (
      <Row>
        {
          this.props.withCountry &&
          <Select size="large" value={country} style={{ width: '100%', marginBottom: 8 }} onChange={this.handleCountryChange}>
            <OptGroup label={formatMsg(intl, 'selectCountry')}>
            {
              world.countries.map(ctry => <Option value={ctry.code} key={ctry.code}>{ctry.zh_cn}</Option>)
            }
            </OptGroup>
          </Select>
        }
        <Cascader size="large" options={chinaRegions} onChange={this.handleCascaderChange} changeOnSelect
          placeholder={formatMsg(intl, 'defaultCascaderRegion')} disabled={disableCascader}
          {...valueProps}
        />
      </Row>
    );
  }
}
