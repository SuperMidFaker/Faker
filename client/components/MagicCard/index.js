import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from 'antd';
import ButtonToggle from '../ButtonToggle';
import './index.less';

export default class MagicCard extends React.Component {
  static defaultProps = {
    // baseCls: 'welo-magic-card',
  }
  static propTypes = {
    onSizeChange: PropTypes.func,
  };
  state = {
    fullscreen: false,
  }
  toggleFullscreen = () => {
    this.setState({
      fullscreen: !this.state.fullscreen,
    });
    const onSizeChange = this.props.onSizeChange;
    if (onSizeChange) {
      onSizeChange(this.state.fullscreen);
    }
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
          <ButtonToggle size="default" iconOff="up-square-o" iconOn="down-square-o" onClick={this.toggleFullscreen} />
        </div>
        {children}
      </Card>
    );
  }
}
