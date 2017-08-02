import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

const { Content } = Layout;

export default class MainContent extends React.Component {

  static propTypes = {
    children: PropTypes.any,
    offset: PropTypes.number,
    key: PropTypes.string,
  }
  state = {
    contentWidth: 1620,
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({ contentWidth: window.innerWidth - 64 });
    }
  }

  render() {
    const { key, children } = this.props;
    const { contentWidth } = this.state;
    return (
      <Content className="main-content" key={key} style={{ width: contentWidth }}>
        {children}
      </Content>
    );
  }
}
