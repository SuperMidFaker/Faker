import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from 'antd';
import ButtonToggle from '../ButtonToggle';
import './style.less';

export default class MagicCard extends React.Component {
  static defaultProps = {
    // baseCls: 'welo-magic-card',
  }
  static childContextTypes = {
    fullscreen: PropTypes.bool,
  }
  state = {
    fullscreen: false,
  }
  getChildContext() {
    return { fullscreen: !this.state.fullscreen };
  }
  toggleFullscreen = () => {
    this.setState({
      fullscreen: !this.state.fullscreen,
    });
  }
  render() {
    const { children } = this.props;
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
        {children}
      </Card>
    );
  }
}
