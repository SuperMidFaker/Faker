import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const { Search } = Input;

export default class SearchBox extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
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
        enterButton={enterButton}
      />
    );
  }
}
