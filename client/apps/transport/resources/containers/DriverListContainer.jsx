import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList.jsx';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadDriverList, editDriver } from 'common/reducers/transportResources';
import { transformRawDriverDataToDisplayData } from '../utils/dataMapping';

function fetchData({dispatch, state}) {
  return dispatch(loadDriverList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  drivers: state.transportResources.drivers,
}), { editDriver })
export default class DriverListContainer extends Component {
  static propTypes = {
    drivers: PropTypes.array.isRequired,              // 服务器返回的司机数组
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
    const { drivers } = this.props;
    const dataSource = drivers.map(transformRawDriverDataToDisplayData);
    return (
      <DriverList dataSource={dataSource}
                  onStopDriverBtnClick={this.handleStopDriverBtnClick}
                  onResumeDriverBtnClick={this.handleResumeDriverBtnClick}
                  onAddDriverBtnClicked={this.handleAddDriverBtnClicked} />
    );
  }
}
