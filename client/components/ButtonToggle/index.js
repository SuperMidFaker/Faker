import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';

export default class ButtonToggle extends React.Component {
  static defaultProps = {
    toggle: false,
    size: 'default',
  };

  static propTypes = {
    type: PropTypes.string,
    shape: PropTypes.oneOf(['circle', 'circle-outline']),
    size: PropTypes.oneOf(['large', 'default', 'small']),
    onClick: PropTypes.func,
    iconOn: PropTypes.string,
    iconOff: PropTypes.string,
    tooltip: PropTypes.string,
    toggle: PropTypes.bool,
    disabled: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      toggle: props.toggle,
    };
  }
  handleClick = (e) => {
    this.setState({ toggle: !this.state.toggle });
    const onClick = this.props.onClick;
    if (onClick) {
      onClick(e, !this.state.toggle);
    }
  }

  render() {
    const {
      type, shape, size = '', children, iconOn, iconOff, tooltip, disabled,
    } = this.props;
    const toggleCls = this.state.toggle ? 'btn-toggle-on' : 'btn-toggle-off';
    const toggleIcon = this.state.toggle ? iconOn : iconOff;
    const toggleTip = this.state.toggle ? `收起${tooltip}` : `打开${tooltip}`;
    return (
      tooltip ? <Tooltip title={toggleTip} placement="bottom" mouseEnterDelay={1}>
        <Button type={type} shape={shape} size={size} icon={toggleIcon} className={toggleCls} onClick={this.handleClick} disabled={disabled}>
          {children}
        </Button>
      </Tooltip> :
      <Button type={type} shape={shape} size={size} icon={toggleIcon} className={toggleCls} onClick={this.handleClick} disabled={disabled}>
        {children}
      </Button>
    );
  }
}
