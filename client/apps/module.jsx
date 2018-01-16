import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Layout } from 'antd';
import { locationShape } from 'react-router';
import HeaderNavBar from 'client/components/HeaderNavBar';
import NotificationDockPanel from './home/notificationDockPanel';
import PreferenceDockPanel from './home/preferenceDockPanel';
import ActivitiesDockPanel from './home/activitiesDockPanel';

const { Header } = Layout;

export default class Module extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
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
      <Layout className="welo-layout-wrapper">
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
