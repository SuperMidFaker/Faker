import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Avatar, Select } from 'antd';
import { formatMsg } from './message.i18n';

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    avatar: state.account.profile.avatar,
    loginName: state.account.username,
  }),
  { }
)
export default class CreatorSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    onInitialize: PropTypes.func,
    size: PropTypes.string,
  }
  state = {
    fieldsValue: {},
  }
  componentDidMount() {
    this.initializeFieldsValue();
  }
  msg = formatMsg(this.props.intl)
  initializeFieldsValue = () => {
    if (window.localStorage) {
      const fieldsValue = JSON.parse(window.localStorage.scofAdvancedSearchFieldsValue || '{"creator": "all"}');
      if (this.props.onInitialize) {
        this.props.onInitialize(fieldsValue);
        this.saveFieldsValue(fieldsValue);
      }
      this.setState({ fieldsValue });
    }
  }
  saveFieldsValue = (fieldsValue) => {
    if (window.localStorage) {
      const fv = { ...JSON.parse(window.localStorage.scofAdvancedSearchFieldsValue || '{"creator": "all"}'), ...fieldsValue };
      window.localStorage.scofAdvancedSearchFieldsValue = JSON.stringify(fv);
      this.setState({ fieldsValue: fv });
    }
  }

  handleChange = (value) => {
    const fieldsValue = { creator: value };
    this.props.onChange(fieldsValue);
    this.saveFieldsValue(fieldsValue);
  }

  render() {
    const { avatar, loginName } = this.props;
    const { fieldsValue } = this.state;
    return (
      <Select
        value={fieldsValue.creator ? fieldsValue.creator : ''}
        onChange={this.handleChange}
        style={{ width: 160 }}
        size={this.props.size}
      >
        <Option value="all"><Avatar size="small" icon="team" /> {this.msg('allOperators')}</Option>
        <Option value="me">{avatar ? <Avatar size="small" src={avatar} /> : <Avatar size="small" icon="user" />} {loginName}</Option>
      </Select>
    );
  }
}
