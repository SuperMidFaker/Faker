import React, { PureComponent } from 'react';
import { Input, Icon } from 'antd';
import './index.less';


export default class EditableItem extends PureComponent {
  state = {
    prefixCls: 'welo-editable-item',
    value: this.props.value,
    editable: false,
  };
  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  edit = () => {
    this.setState({ editable: true });
  }
  render() {
    const { prefixCls, value, editable } = this.state;
    return (
      <div className={prefixCls}>
        {
          editable ?
            <div className={`${prefixCls}-wrapper`}>
              <Input
                value={value}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className="icon"
                onClick={this.check}
              />
            </div>
            :
            <div className={`${prefixCls}-wrapper`}>
              <span>{value || ' '}</span>
              <Icon
                type="edit"
                className="icon"
                onClick={this.edit}
              />
            </div>
        }
      </div>
    );
  }
}
