import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Layout } from 'antd';
import { locationShape } from 'react-router';
import NotificationDockPanel from './home/notificationDockPanel';
import PreferenceDockPanel from './home/preferenceDockPanel';
import ActivitiesDockPanel from './home/activitiesDockPanel';
import HeaderNavBar from 'client/components/HeaderNavBar';

const { Header } = Layout;

export default class Module extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    location: locationShape.isRequired,
    alert: PropTypes.string,
  }
  static childContextTypes = {
    location: locationShape.isRequired,
  }
  getChildContext() {
    return { location: this.props.location };
  }

  render() {
    const { alert } = this.props;
    return (
      <Layout className="layout-wrapper">
        {alert && <Alert message={alert} banner />}
        <Header>
          <HeaderNavBar />
        </Header>
        {this.props.children}
        <NotificationDockPanel />
        <PreferenceDockPanel />
        <ActivitiesDockPanel />
      </Layout>);
  }
}
