import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Input, Tabs, Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import SearchBox from 'client/components/SearchBox';
import { loadLimitLocations, loadAdviceLocations } from 'common/reducers/cwmWhseLocation';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const { TabPane } = Tabs;


@injectIntl
@connect(
  () => ({
  }),
  { loadLimitLocations, loadAdviceLocations }
)
export default class LocationPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    whseCode: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    index: PropTypes.string.isRequired,
    value: PropTypes.string,
  }
  state = {
    visible: false,
    locations: [],
    adviceLocations: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible) {
      this.props.loadLimitLocations(this.props.whseCode, '').then((result) => {
        if (!result.error) {
          this.setState({
            locations: result.data,
          });
        }
      });
      this.props.loadAdviceLocations(this.props.productNo, this.props.whseCode).then((result) => {
        if (!result.error) {
          this.setState({ adviceLocations: result.data });
        }
      });
    }
  }
  handleMenuClick = (item) => {
    const { index } = this.props;
    let location = this.state.locations.find(lc => lc.location === item.key);
    if (!location) {
      location = this.state.adviceLocations.find(lc => lc.location === item.key);
    }
    this.props.onChange(index, item.key, location);
    this.setState({
      visible: false,

    });
  }
  handleChange = (value) => {
    this.props.loadLimitLocations(this.props.whseCode, '', value).then((result) => {
      if (!result.error) {
        this.setState({
          locations: result.data,
        });
      }
    });
  }
  render() {
    const { locations, adviceLocations } = this.state;
    const content = (
      <div>
        <Tabs defaultActiveKey="1" >
          <TabPane tab="全部库位" key="1">
            <SearchBox width={216} onSearch={this.handleChange} />
            <Menu
              style={{ width: 216 }}
              mode="vertical"
              onClick={this.handleMenuClick}
            >
              {locations.map(option =>
                <Menu.Item key={option.location} >{option.location}</Menu.Item>)}
            </Menu>
          </TabPane>
          <TabPane tab="推荐库位" key="2">
            <Menu
              style={{ width: 216 }}
              mode="inline"
              onClick={this.handleMenuClick}
            >
              {adviceLocations.map(option =>
                <Menu.Item key={option.location} >{option.location}</Menu.Item>)}
            </Menu>
          </TabPane>
        </Tabs>
      </div>
    );
    return (
      <Popover content={content} trigger="click" placement="bottom" visible={this.state.visible} onVisibleChange={this.handleVisibleChange} overlayStyle={{ width: 248 }}>
        <Input {...this.props} value={this.props.value} placeHolder="请选择库位" />
      </Popover>
    );
  }
}
