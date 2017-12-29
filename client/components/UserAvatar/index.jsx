import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar } from 'antd';

@connect(
  state => ({
    avatar: state.account.profile.avatar,
    name: state.account.profile.name,
    userMembers: state.account.userMembers,
  }),
  { }
)
export default class UserAvatar extends React.Component {
  static defaultProps = {
    size: 'default',
    shape: 'circle',
  }
  static propTypes = {
    currentUser: PropTypes.bool,
    loginId: PropTypes.number,
    size: PropTypes.string,
    shape: PropTypes.string,
    showName: PropTypes.bool,
  }
  renderAvatar(avatar, name) {
    if (avatar) {
      return <Avatar size={this.props.size} shape={this.props.shape} src={avatar} />;
    } else if (name) {
      return <Avatar size={this.props.size} shape={this.props.shape}>{name}</Avatar>;
    }
    return <Avatar size={this.props.size} shape={this.props.shape} icon="user" />;
  }
  render() {
    const {
      currentUser, avatar, name, loginId, showName,
    } = this.props;
    if (!currentUser) {
      const user = this.props.userMembers.filter(usm => usm.login_id === loginId)[0];
      if (user) {
        return showName ?
          <span>{this.renderAvatar(user.avatar, user.name)}
            <span style={{ marginLeft: 8 }}>{user.name}</span></span> :
          this.renderAvatar(user.avatar, user.name);
      }
      return this.renderAvatar();
    }
    return showName ? <span>{this.renderAvatar(avatar, name)}
      <span style={{ marginLeft: 8 }}>{name}</span></span> :
      this.renderAvatar(avatar, name);
  }
}
