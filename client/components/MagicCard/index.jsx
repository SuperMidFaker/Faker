import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, Tabs } from 'antd';
import ButtonToggle from '../ButtonToggle';
import './style.less';

const { TabPane } = Tabs;

export default class MagicCard extends React.Component {
  static defaultProps = {
    // baseCls: 'welo-magic-card',
  }
  static propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string,
      content: PropTypes.node,
    })),
    activeTab: PropTypes.string,
  }
  static childContextTypes = {
    fullscreen: PropTypes.bool,
  }
  state = {
    fullscreen: false,
    activeTab: this.props.activeTab,
  }
  getChildContext() {
    return { fullscreen: !this.state.fullscreen };
  }
  handleTabChange = (key) => {
    this.setState({ activeTab: key });
  }
  toggleFullscreen = () => {
    this.setState({
      fullscreen: !this.state.fullscreen,
    });
  }
  render() {
    const { tabs, children } = this.props;
    const { fullscreen } = this.state;
    const classes = classNames('welo-magic-card', {
      'welo-magic-card-fullscreen': fullscreen,
    });
    return (
      <Card {...this.props} className={classes} >
        <div className="welo-magic-card-toggle">
          <ButtonToggle
            size="default"
            iconOff="arrows-alt"
            iconOn="shrink"
            state={this.state.fullscreen}
            onClick={this.toggleFullscreen}
          />
        </div>
        {tabs &&
          <Tabs activeKey={this.state.activeTab} onChange={this.handleTabChange}>
            {tabs.map(tab => <TabPane tab={tab.title} key={tab.key} >{tab.content}</TabPane>)}
          </Tabs>
        }
        {children}
      </Card>
    );
  }
}
