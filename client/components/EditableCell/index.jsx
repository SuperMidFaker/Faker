import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Icon, Select, DatePicker } from 'antd';
import RegionCascader from 'client/components/RegionCascader';
import moment from 'moment';
import * as Location from 'client/util/location';
import './index.less';

const { Option } = Select;

export default class EditableCell extends React.Component {
  static defaultProps = {
    editable: true,
  }
  static propTypes = {
    addonBefore: PropTypes.node,
    addonAfter: PropTypes.node,
    type: PropTypes.string,
    value: PropTypes.any,
    field: PropTypes.string,
    placeholder: PropTypes.string,
    cellTrigger: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    editable: PropTypes.bool,
  }
  state = {
    value: this.props.value,
    field: this.props.field,
    editMode: false,
    region: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value, region: nextProps.value });
    }
  }
  handleChange = (e) => {
    const { value } = e.target;
    this.setState({ value });
  }
  check = () => {
    setTimeout(() => {
      this.setState({ editMode: false });
    }, 10);
    if (this.props.onSave) {
      this.props.onSave(this.state.value, this.state.field);
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
  handleSelectChange = (value) => {
    this.setState({ value });
    if (this.props.onSave) {
      this.props.onSave(value, this.state.field);
    }
  }
  handleDateChange = (date) => {
    this.setState({ value: date && date.valueOf() });
    if (this.props.onSave) {
      this.props.onSave(date && date.valueOf(), this.state.field);
    }
  }
  handleRegionValueChange = (region) => {
    const [code, province, city, district, street] = region; // eslint-disable-line no-unused-vars
    this.setState({ value: region, region: [province, city, district, street] });
  }
  renderActions() {
    return (<span className="editable-cell-actions">
      <Button size="small" shape="circle" icon="check" onClick={this.check} />
      <Button size="small" shape="circle" icon="close" onClick={this.close} />
    </span>);
  }
  renderControl() {
    const {
      type, placeholder, options, addonBefore, addonAfter,
    } = this.props;
    const { value, region } = this.state;
    switch (type) {
      case 'textarea':
        return (<div className="editable-cell-outer">
          <div className="editable-cell-inner">
            <Input.TextArea autosize value={value} onChange={this.handleChange} />
          </div>
          {this.renderActions()}
        </div>);
      case 'select':
        return (<div className="editable-cell-outer">
          <div className="editable-cell-inner">
            <Select
              showSearch
              {...this.props}
              placeholder={placeholder}
              value={value}
              style={{ width: '100%' }}
              onChange={this.handleSelectChange}
            >
              {options && options.map(opt =>
                <Option key={opt.key} value={opt.key}>{opt.text}</Option>)}
            </Select>
          </div>
          {this.renderActions()}
        </div>);
      case 'date':
        return (<div className="editable-cell-outer">
          <div className="editable-cell-inner">
            <DatePicker
              {...this.props}
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              value={value && moment(value)}
              onChange={this.handleDateChange}
            />
          </div>
          {this.renderActions()}
        </div>);
      case 'regionCascade':
        return (<div className="editable-cell-outer">
          <div className="editable-cell-inner">
            <RegionCascader
              region={region}
              onChange={this.handleRegionValueChange}
            />
          </div>
          {this.renderActions()}
        </div>);
      default:
        return (<div className="editable-cell-outer">
          <div className="editable-cell-inner">
            <Input
              {...this.props}
              type={type}
              value={value}
              addonBefore={addonBefore}
              addonAfter={addonAfter}
              onChange={this.handleChange}
              onPressEnter={this.check}
            />
          </div>
          {this.renderActions()}
        </div>);
    }
  }
  renderText() {
    const {
      type, options, placeholder, addonBefore, addonAfter,
    } = this.props;
    const { value } = this.state;
    if (type === 'select' && options) {
      const option = options.filter(opt => opt.key === value)[0];
      return (option ? <span>{addonBefore}{option.text}{addonAfter}</span> :
      <span style={{ display: 'inline-block' }} className="editable-cell-placeholder">{placeholder}</span>);
    } else if (type === 'regionCascade') {
      return value ?
        <span>{addonBefore}{Location.renderLoc({
          province: value[0],
          city: value[1],
          district: value[2],
        }, 'province', 'city', 'district')}{addonAfter}
        </span> :
        <span style={{ display: 'inline-block' }}>{addonBefore}<span className="editable-cell-placeholder">{placeholder}</span>{addonAfter}</span>;
    } else if (type === 'date') {
      return (value) ?
        <span>{addonBefore}{moment(value).format('YYYY.MM.DD')}{addonAfter}</span> :
        <span style={{ display: 'inline-block' }}>{addonBefore}<span className="editable-cell-placeholder">{placeholder}</span>{addonAfter}</span>;
    }
    return (value && (value.length > 0 || value !== 0)) ?
      <span>{addonBefore}{value}{addonAfter}</span> :
      <span style={{ display: 'inline-block' }}>{addonBefore}<span className="editable-cell-placeholder">{placeholder}</span>{addonAfter}</span>;
  }
  render() {
    const { editMode } = this.state;
    const { editable } = this.props;
    return (
      <div className="editable-cell">
        {
          editMode && editable ?
            <div className="editable-cell-input-wrapper">
              {this.renderControl()}
            </div>
            :
            <div className="editable-cell-text-wrapper" onClick={this.cellEdit}>
              {this.renderText()}
              {editable && <Icon type="edit" className="editable-cell-icon" onClick={this.edit} />}
            </div>
        }
      </div>
    );
  }
}
