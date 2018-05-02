import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';
import './style.less';

const { Search } = Input;

export default class SearchBox extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
  }
  state = { value: null }
  componentDidMount() {
    const propsHasValue = Object.keys(this.props).filter(key => key === 'value').length > 0;
    if (propsHasValue) {
      this.setState({ value: this.props.value });
    }
  }
  componentWillReceiveProps(nextProps) {
    const propsHasValue = Object.keys(nextProps).filter(key => key === 'value').length > 0;
    if (propsHasValue && !nextProps.value) {
      this.setState({ value: nextProps.value });
    }
  }
  handleFocus = (ev) => {
    ev.target.select();
  }
  handleChange = (ev) => {
    const { onSearch } = this.props;
    if (ev.target.value === '' && onSearch) {
      onSearch('');
    }
    this.setState({ value: ev.target.value });
  }
  render() {
    const { placeholder, onSearch } = this.props;
    const { value } = this.state;
    return (
      <Search
        placeholder={placeholder}
        onChange={this.handleChange}
        onSearch={onSearch}
        onFocus={this.handleFocus}
        enterButton
        value={value}
      />
    );
  }
}
