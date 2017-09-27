import React, { Component } from 'react';
import { Popover, Input, Tabs, Menu, Avatar } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import InfoItem from 'client/components/InfoItem';
import { loadLimitLocations, loadAdviceLocations } from 'common/reducers/cwmWhseLocation';

const TabPane = Tabs.TabPane;
const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { loadLimitLocations, loadAdviceLocations }
)
export default class LocationPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    visible: false,
    locations: [],
    adviceLocations: [],
    searchText: '',
  }
  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }
  render() {
    const { locations, adviceLocations } = this.state;
    const content = (
      <div>
        <Tabs defaultActiveKey="1" >
          <TabPane tab="全部库位" key="1">
            <Search style={{ width: 216, marginBottom: 8 }} value={this.state.searchText} onChange={this.handleChange} />
            <Menu
              style={{ width: 216 }}
              mode="vertical"
            >
              {locations.map(option =>
                <Menu.Item key={option.location} >{option.location}</Menu.Item>
              )}
            </Menu>
          </TabPane>
          <TabPane tab="推荐库位" key="2">
            <Menu
              style={{ width: 216 }}
              mode="inline"
            >
              {adviceLocations.map(option =>
                <Menu.Item key={option.location} >{option.location}</Menu.Item>
              )}
            </Menu>
          </TabPane>
        </Tabs>
      </div>
    );
    return (
      <Popover content={content} trigger="click" placement="bottom" visible={this.state.visible} onVisibleChange={this.handleVisibleChange} overlayStyle={{ width: 248 }}>
        <InfoItem type="dropdown" label="操作人员" addonBefore={<Avatar size="small">{''}</Avatar>}
          field={''} placeholder="分配操作人员" editable
        />
      </Popover>
    );
  }
}
