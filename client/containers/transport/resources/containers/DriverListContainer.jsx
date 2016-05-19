import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList.jsx';
import connectFetch from 'reusable/decorators/connect-fetch';
import { loadDriverList, editDriver } from '../../../../../universal/redux/reducers/transportResources';
import { addUniqueKeys, transformRawDriverDataToDisplayData } from '../utils/dataMapping';

function fetchData({dispatch, state}) {
  return dispatch(loadDriverList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  drivers: state.transportResources.drivers,
  selectedMenuItemKey: state.transportResources.selectedMenuItemKey,
  loading: state.transportResources.loading
}), { editDriver })
export default class DriverListContainer extends Component {
  static propTypes = {
    drivers: PropTypes.array.isRequired,              // 服务器返回的司机数组
    selectedMenuItemKey: PropTypes.string.isRequired, // 当先选中的menuItem key
    loading: PropTypes.bool.isRequired,               // 当前组件是否正在加载
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleAddDriverBtnClicked = () => {
    this.context.router.push('/transport/resources/add_driver');
  }
  handleStopDriverBtnClick = (driverId) => {
    this.props.editDriver({driverId, driverInfo: {status: 0}});
  }
  handleResumeDriverBtnClick = (driverId) => {
    this.props.editDriver({driverId, driverInfo: {status: 1}});
  }
  render() {
    const { drivers, selectedMenuItemKey, loading } = this.props;
    const dataSource = drivers.map(transformRawDriverDataToDisplayData);
    return (
      <DriverList dataSource={addUniqueKeys(dataSource)}
                  visible={selectedMenuItemKey === '1'}
                  loading={loading}
                  onStopDriverBtnClick={this.handleStopDriverBtnClick}
                  onResumeDriverBtnClick={this.handleResumeDriverBtnClick}
                  onAddDriverBtnClicked={this.handleAddDriverBtnClicked} />
    );
  }
}
