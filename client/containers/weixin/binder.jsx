import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loginBind } from 'universal/redux/reducers/weixin';

@connect(
  state => ({
    errorMsg: state.weixin.error
  }),
  { loginBind }
)
export default class Binder extends React.Component {
  static propTypes = {
    errorMsg: PropTypes.string.isRequired,
    loginBind: PropTypes.func.isRequired
  }
  state = {
    username: '',
    password: ''
  }
  handleTextChange(ev, field) {
    this.setState({ [field]: ev.target.value });
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    const { username, password } = this.state;
    const form = {
      username,
      password
    };
    this.props.loginBind(form).then((result) => {
      if (result.data.redirect) {
        window.location = result.data.url;
      }
    });
  }

  render() {
    const { username } = this.state;
    return (
      <div className="panel-body">
        <form onSubmit={this.handleSubmit} className="form-horizontal">
         { this.props.errorMsg }
          <div className="login-form">
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="icon s7-user" />
                </span>
                <input type="text" placeholder="手机号" autoComplete="off" className="form-control" value={username}
                  onChange={(ev) => this.handleTextChange(ev, 'username')}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="icon s7-lock" />
                </span>
                <input type="password" placeholder="密码" className="form-control"
                  onChange={(ev) => this.handleTextChange(ev, 'password')}
                />
              </div>
            </div>
            <div className="form-group login-submit">
              <button data-dismiss="modal" type="submit" className="btn btn-primary btn-lg">
              登录绑定
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
