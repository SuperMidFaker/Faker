import React, { PropTypes } from 'react';
import { Input, Icon } from 'antd';

export default class EditableCell extends React.Component {
  static propTypes = {
    prefix: PropTypes.node,
    suffix: PropTypes.node,
    type: PropTypes.string,
    placeholder: PropTypes.string,
  }
  state = {
    value: this.props.value,
    editable: false,
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  close = () => {
    this.setState({ editable: false });
  }
  edit = () => {
    this.setState({ editable: true });
  }
  render() {
    const { type, placeholder } = this.props;
    const { value, editable } = this.state;
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              {type === 'textarea' ?
                <div>
                  <Input
                    type="textarea"
                    autosize
                    value={value}
                    onChange={this.handleChange}
                  />
                  <div><Icon type="check" onClick={this.check} /> <Icon type="close" onClick={this.close} /></div>
                </div> :
                <Input
                  size="large"
                  value={value}
                  onChange={this.handleChange}
                  onPressEnter={this.check}
                  suffix={<span><Icon type="check" onClick={this.check} /> <Icon type="close" onClick={this.close} /></span>}
                />}
            </div>
            :
            <div className="editable-cell-text-wrapper" onClick={this.edit}>
              {(value && value.length > 0) ? value : <span className="editable-cell-placeholder">{placeholder}</span>}
              <Icon type="edit" className="editable-cell-icon" />
            </div>
        }
      </div>
    );
  }
}
