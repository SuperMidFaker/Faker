import React, { Component, PropTypes } from 'react';
import { message } from 'antd';
import { connect } from 'react-redux';
import DriverList from '../components/DriverList.jsx';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadDriverList, editDriver, editDriverLogin } from 'common/reducers/transportResources';
import { transformRawDriverDataToDisplayData } from '../utils/dataMapping';
import connectNav from 'client/common/decorators/connect-nav';

function fetchData({ dispatch, state }) {
  return dispatch(loadDriverList(state.account.tenantId));
}

@connectFetch()(fetchData)
@connect(state => ({
  drivers: state.transportResources.drivers,
}), { editDriver, editDriverLogin })
@connectNav({
  depth: 2,
  muduleName: 'transport',
})
export default class DriverListContainer extends Component {
  static propTypes = {
    drivers: PropTypes.array.isRequired,              // 服务器返回的司机数组
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleAddDriverBtnClicked = () => {
    this.context.router.push('/transport/resources/driver/add');
  }
  handleStopDriverBtnClick = (driverId) => {
    this.props.editDriver({ driverId, driverInfo: { status: 0 } });
  }
  handleResumeDriverBtnClick = (driverId) => {
    this.props.editDriver({ driverId, driverInfo: { status: 1 } });
  }
  handleEditDriverLogin = (driver) => {
    this.props.editDriverLogin(driver).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const { drivers } = this.props;
    const dataSource = drivers.map(transformRawDriverDataToDisplayData);
    return (
      <DriverList dataSource={dataSource}
        onStopDriverBtnClick={this.handleStopDriverBtnClick}
        onResumeDriverBtnClick={this.handleResumeDriverBtnClick}
        onAddDriverBtnClicked={this.handleAddDriverBtnClicked}
        handleEditDriverLogin={this.handleEditDriverLogin}
      />
    );
  }
}
