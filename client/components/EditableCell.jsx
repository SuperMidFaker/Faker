import React, { PropTypes } from 'react';
import { Input, Icon, Select } from 'antd';

export default class EditableCell extends React.Component {
  static propTypes = {
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    type: PropTypes.string,
    value: PropTypes.any,
    placeholder: PropTypes.string,
  }
  state = {
    value: this.props.value,
    editMode: false,
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    this.setState({ editMode: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }
  close = () => {
    this.setState({ editMode: false });
  }
  edit = () => {
    this.setState({ editMode: true });
  }
  renderControl() {
    const { type, placeholder, options, addonBefore, addonAfter } = this.props;
    const { value } = this.state;
    switch (type) {
      case 'textarea':
        return (<div>
          <Input
            type="textarea"
            autosize
            value={value}
            onChange={this.handleChange}
          />
          <div>
            <Icon type="check" className="editable-cell-icon-save" onClick={this.check} />
            <span className="ant-divider" />
            <Icon type="close" className="editable-cell-icon-close" onClick={this.close} />
          </div>
        </div>);
      case 'select':
        return (<div>{addonBefore}
          <Select
            showSearch
            placeholder={placeholder}
            defaultValue={value}
            style={{ width: '90%' }}
          >
            {options}
          </Select>
          <Icon type="close" className="editable-cell-icon-close" onClick={this.close} />
        </div>);
      default:
        return (<Input
          size="large"
          type={type}
          value={value}
          addonBefore={addonBefore}
          addonAfter={addonAfter}
          onChange={this.handleChange}
          onPressEnter={this.check}
          suffix={<span>
            <Icon type="check" className="editable-cell-icon-save" onClick={this.check} />
            <span className="ant-divider" />
            <Icon type="close" className="editable-cell-icon-close" onClick={this.close} />
          </span>}
        />);
    }
  }
  renderText() {
    const { placeholder, addonBefore, addonAfter } = this.props;
    const { value } = this.state;
    return (value && (value.length > 0 || value !== 0)) ?
      <span>{addonBefore}{value}{addonAfter}</span> :
      <span>{addonBefore}<span className="editable-cell-placeholder">{placeholder}</span>{addonAfter}</span>;
  }
  render() {
    const { editMode } = this.state;
    return (
      <div className="editable-cell">
        {
          editMode ?
            <div className="editable-cell-input-wrapper">
              {this.renderControl()}
            </div>
            :
            <div className="editable-cell-text-wrapper" onClick={this.edit}>
              {this.renderText()}
              <Icon type="edit" className="editable-cell-icon" />
            </div>
        }
      </div>
    );
  }
}
