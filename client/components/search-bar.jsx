import React,{ PropTypes } from 'react';
import { Input, Icon } from 'ant-ui';
import './search-bar.less';
export default class SearchBar extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onInputSearch: PropTypes.func.isRequired
  }
  state = {
    value: ''
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.setState({ value: nextProps.value });
    }
  }
  handleChange = (ev) => {
    if (!('value' in this.props)) {
      this.setState({ value: ev.target.value });
    }
    this.props.onInputSearch(ev.target.value);
  }
  render() {
    const { placeholder } = this.props;
    return (
      <div className="search-bar">
        <input placeholder={placeholder} className="ant-input ant-input-lg"
          onChange={this.handleChange} value={this.state.value}
        />
        <Icon type="search" />
      </div>);
  }
}
