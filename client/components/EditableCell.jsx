import React, { PropTypes } from 'react';
import { Input, Icon, Select } from 'antd';

export default class EditableCell extends React.Component {
  static propTypes = {
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    type: PropTypes.string,
    value: PropTypes.any,
    placeholder: PropTypes.string,
    cellTrigger: PropTypes.bool,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  }
  state = {
    value: this.props.value,
    editMode: false,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }
  check = () => {
    setTimeout(() => {
      this.setState({ editMode: false });
    }, 10);
    if (this.props.onSave) {
      this.props.onSave(this.state.value);
    }
  }
  close = () => {
    setTimeout(() => {
      this.setState({ editMode: false });
    }, 10);
  }
  edit = () => {
    setTimeout(() => {
      this.setState({ editMode: true });
    }, 10);
  }
  cellEdit = () => {
    if (this.props.cellTrigger) {
      setTimeout(() => {
        this.setState({ editMode: true });
      }, 10);
    }
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
            <div className="editable-cell-text-wrapper" onClick={this.cellEdit}>
              {this.renderText()}
              <Icon type="edit" className="editable-cell-icon" onClick={this.edit} />
            </div>
        }
      </div>
    );
  }
}
