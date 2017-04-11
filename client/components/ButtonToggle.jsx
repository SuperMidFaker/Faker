import React, { PropTypes } from 'react';
import { Button } from 'antd';

export default class ButtonToggle extends React.Component {
  static defaultProps = {
    toggle: false,
  };

  static propTypes = {
    type: PropTypes.string,
    shape: PropTypes.oneOf(['circle', 'circle-outline']),
    size: PropTypes.oneOf(['large', 'default', 'small']),
    onClick: PropTypes.func,
    iconOn: PropTypes.string,
    iconOff: PropTypes.string,
    toggle: PropTypes.bool,
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
      onClick(e);
    }
  }

  render() {
    const {
      type, shape, size = '', children, iconOn, iconOff,
    } = this.props;
    const toggleCls = this.state.toggle ? 'btn-toggle-on' : 'btn-toggle-off';
    const toggleIcon = this.state.toggle ? iconOn : iconOff;
    return (<Button type={type} shape={shape} size={size} icon={toggleIcon} className={toggleCls} onClick={this.handleClick}>{children}</Button>
    );
  }
}
