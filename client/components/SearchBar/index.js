import React from 'react';
import PropTypes from 'prop-types';
import { Input, Icon } from 'antd';
import './index.less';

export default class SearchBar extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    size: PropTypes.string,
    extraParams: PropTypes.object,
    onInputSearch: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
    };
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
    this.props.onInputSearch(ev.target.value, this.props.extraParams);
  }
  render() {
    const { placeholder, size } = this.props;
    return (
      <div className="search-bar">
        <Input placeholder={placeholder} size={size}
          onChange={this.handleChange} value={this.state.value}
          suffix={<Icon type="search" />}
        />
      </div>
    );
  }
}
