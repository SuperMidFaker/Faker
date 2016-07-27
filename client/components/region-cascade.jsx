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

function isRegionChanged(nextRegion, region, stateRegionArea) {
  let province;
  let city;
  let district;
  let street;
  let changed = false;
  if (Array.isArray(nextRegion)) {
    province = stateRegionArea[0];
    city = stateRegionArea[1];
    district = stateRegionArea[2];
    street = stateRegionArea[3];
    changed = province !== region[0] ||
      city !== region[1] ||
      district !== region[2];
  } else {
    province = nextRegion.province;
    city = nextRegion.city;
    district = nextRegion.district;
    street = nextRegion.street;
    changed = isPropsChange(nextRegion, region, 'province') ||
      isPropsChange(nextRegion, region, 'city') ||
      isPropsChange(nextRegion, region, 'district');
  }
  return { province, city, district, street, changed: !!changed };
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
      let areaItems;
      if (Array.isArray(this.props.region)) {
        areaItems = this.props.region;
      } else {
        areaItems = [
          this.props.region.province, this.props.region.city,
          this.props.region.district, this.props.region.street,
        ];
      }
      this.setState({ areaItems });
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
    if (nextProps.province !== this.props.provinces) {
      const chinaRegions = nextProps.provinces.map(prov => ({
        value: prov.name,
        label: prov.name,
        code: prov.code,
        isLeaf: false,
      }));
      this.setState({ chinaRegions });
    }
    if (nextProps.region) {
      const propsAsState = {};
      if (nextProps.region.country !== this.props.region.country) {
        propsAsState.country = nextProps.region.country;
      }
      const { province, city, district, street, changed } =
        isRegionChanged(nextProps.region, this.props.region, this.state.areaItems);
      console.log(changed, this.state);
      if (!province && !Array.isArray(nextProps.region)) {
        // 清空
        propsAsState.areaItems = [];
      } else {
        if (changed) {
          propsAsState.areaItems = [province, city, district, street];
        } else {
          propsAsState.areaItems = this.state.areaItems;
        }
        nextProps.loadNextRegionList(province, city, district).then(result => {
          const chinaRegions = nextProps.provinces.map(prov => ({
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
          this.setState({ chinaRegions });
        });
      }
      this.setState(propsAsState);
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
  handleRegionLoad = (selOpts) => {
    const areaItems = [];
    for (let i = 0; i < selOpts.length; i++) {
      areaItems.push(selOpts[i].value);
    }
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
    this.state.areaItems = areaItems;
    console.log('region load', areaItems);
    this.setState({ areaItems });
    if (this.props.onCascadeChange) {
      this.props.onCascadeChange(areaItems);
    }
    if ('setFormValue' in this.props) {
      const [province, city, district, street] = areaItems;
      this.props.setFormValue('province', province);
      this.props.setFormValue('city', city);
      this.props.setFormValue('district', district);
      this.props.setFormValue('street', street);
      this.props.setFormValue('code', selOpts[selOpts.length - 1].code);
    }
  }
  handleRegionChange = (areaItems, selOpts) => {
    if (areaItems.length === 0) {
      // clear
      this.state.areaItems = []; // used in willReceiveProps
      this.setState({ areaItems });
      if (this.props.onCascadeChange) {
        this.props.onCascadeChange(areaItems);
      }
      if ('setFormValue' in this.props) {
        this.props.setFormValue('province', undefined);
        this.props.setFormValue('city', undefined);
        this.props.setFormValue('district', undefined);
        this.props.setFormValue('street', undefined);
        this.props.setFormValue('code', undefined);
      }
    } else if (areaItems.length === 4) {
      this.state.areaItems = areaItems; // used in willReceiveProps
      this.setState({ areaItems });
      if (this.props.onCascadeChange) {
        this.props.onCascadeChange(areaItems);
      }
      if ('setFormValue' in this.props) {
        const [province, city, district, street] = areaItems;
        this.props.setFormValue('province', province);
        this.props.setFormValue('city', city);
        this.props.setFormValue('district', district);
        this.props.setFormValue('street', street);
        this.props.setFormValue('code', selOpts[selOpts.length - 1].code);
      }
    }
  }
  render() {
    const { areaItems, country, disableCascader, chinaRegions } = this.state;
    const { intl } = this.props;
    const valueProps = { value: areaItems };
    console.log('render', this.state);
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
        <Cascader size="large" options={chinaRegions} disabled={disableCascader}
          placeholder={formatMsg(intl, 'defaultCascaderRegion')} onChange={this.handleRegionChange}
          loadData={this.handleRegionLoad} changeOnSelect {...valueProps}
        />
      </Row>
    );
  }
}
