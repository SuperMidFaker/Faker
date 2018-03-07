import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const { Search } = Input;

export default class SearchBox extends React.Component {
  static defaultProps = {
    width: 200,
  }
  static propTypes = {
    placeholder: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onSearch: PropTypes.func.isRequired,
    enterButton: PropTypes.bool,
  }
  handleFocus = (ev) => {
    ev.target.select();
  }
  handleChange = (ev) => {
    const { onSearch } = this.props;
    if (ev.target.value === '' && onSearch) {
      onSearch('');
    }
  }
  render() {
    const { placeholder, onSearch, enterButton } = this.props;
    return (
      <Search
        placeholder={placeholder}
        onChange={this.handleChange}
        onSearch={onSearch}
        onFocus={this.handleFocus}
        style={{ width: this.props.width }}
        enterButton={enterButton}
      />
    );
  }
}
