import React, { PropTypes } from 'react';
import { Layout } from 'antd';
import { locationShape } from 'react-router';
import HeaderNavBar from '../components/headerNavBar';

const { Header } = Layout;

export default class Module extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    location: locationShape.isRequired,
  }
  static childContextTypes = {
    location: locationShape.isRequired,
  }
  getChildContext() {
    return { location: this.props.location };
  }

  render() {
    return (
      <Layout className="layout-wrapper">
        <Header>
          <HeaderNavBar />
        </Header>
        {this.props.children}
      </Layout>);
  }
}
