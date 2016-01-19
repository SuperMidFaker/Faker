import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submit, setValue } from '../../../universal/redux/reducers/auth';
import NavLink from '../../../reusable/components/nav-link';

@connect(state => ({
  auth: state.auth
}), { submit, setValue })
export default class Login extends React.Component {
  static propTypes = {
    auth: PropTypes.object,
    setValue: PropTypes.func,
    submit: PropTypes.func
  }

  handleTextChange(ev, field) {
    this.props.setValue(field, ev.target.value);
  }
  handleCheckboxChange(ev, field) {
    this.props.setValue(field, ev.target.checked);
  }
  handleSubmit(ev) {
    ev.preventDefault();
    if (this.props.auth.error && this.props.auth.error.message) {
      return;
    }
    const { auth: { username, password, remember } } = this.props;
    const form = {
      username,
      password,
      remember
    };
    this.props.submit(form);
  }

  render() {
    const { auth: { error, username, remember } } = this.props;
    return (
      <div className="panel-body">
        { error ? <div>{ error.message }</div> : null }
        <form onSubmit={::this.handleSubmit} className="form-horizontal">
          <div className="login-form">
            <div className="form-group">
              <div className="input-group"><span className="input-group-addon"><i className="icon s7-user"></i></span>
                <input ref="username" type="text" placeholder="用户名/手机号" autoComplete="off" className="form-control" value={username}
                  onChange={ (ev) => this.handleTextChange(ev, 'username') }/>
              </div>
            </div>
            <div className="form-group">
              <div className="input-group"><span className="input-group-addon"><i className="icon s7-lock"></i></span>
                <input ref="password" type="password" placeholder="密码" className="form-control"
                onChange={ (ev) => this.handleTextChange(ev, 'password')}/>
              </div>
            </div>
            <div className="form-group login-submit">
              <button data-dismiss="modal" type="submit" className="btn btn-primary btn-lg">登录</button>
            </div>
            <div className="form-group footer row">
              <div className="col-xs-6"><NavLink to="/forgot">忘记密码?</NavLink></div>
              <div className="col-xs-6 remember">
                <label htmlFor="remember">记住我</label>
                <div className="am-checkbox">
                  <input type="checkbox" id="remember" checked={remember} onChange={(ev) => this.handleCheckboxChange(ev, 'remember')}/>
                  <label htmlFor="remember"></label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
