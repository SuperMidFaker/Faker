import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Row, Select, Cascader, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { CHINA_CODE } from '../../common/constants';
import { loadProvinces, loadRegionChildren } from 'common/reducers/chinaRegions';
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

function fetchData({ dispatch, state }) {
  if (!state.chinaRegions.provLoaded) {
    return dispatch(loadProvinces());
  }
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    provinces: state.chinaRegions.provinces,
  }),
  { loadRegionChildren }
)
export default class RegionCascade extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    withCountry: PropTypes.bool,
    uncontrolled: PropTypes.bool, // 值由cascade本身控制, true时region传入数组结构
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
    setFormValue: PropTypes.func, // 'province'/'city'/'district', value
    onCascadeChange: PropTypes.func, // ant-design cascade本身的onChange参数
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
      chinaRegions: this.props.provinces.map(prov => ({
        label: prov.name,
        value: prov.code,
        children: [],
      })),
      areaItems: !this.props.uncontrolled && this.props.region && this.props.region.province ?
        [this.props.region.province, this.props.region.city, this.props.region.district]
        : [],
    };
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
    }
  }
  handleCascaderChange = (areas) => {
    this.setState({ areaItems: areas });
    if (this.props.onCascadeChange) {
      this.props.onCascadeChange(areas);
    }
    let province;
    let city;
    let district;
    let street;
    const regions = [...this.state.chinaRegions];
    if (areas.length === 1) {
      province = areas[0];
      this.props.loadRegionChildren(province).then(result => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (region.code === province) {
              region.children = result.data;
              break;
            }
          }
          this.setState({ chinaRegions: regions });
        }
      });
    }
    if (areas.length === 2) {
    }
    if ('setFormValue' in this.props) {
      this.props.setFormValue('province', province);
      this.props.setFormValue('city', city);
      this.props.setFormValue('district', district);
      this.props.setFormValue('street', street);
    }
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
