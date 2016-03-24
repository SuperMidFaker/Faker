import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { submit, setValue } from '../../../universal/redux/reducers/auth';
import NavLink from '../../../reusable/components/nav-link';
import { getFormatMsg } from 'reusable/browser-util/react-ant';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    code: state.corpDomain.code,
    auth: state.auth
  }),
  { submit, setValue }
)
export default class Login extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    auth: PropTypes.object,
    code: PropTypes.string.isRequired,
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
    if (this.props.auth.nonTenant) {
      return;
    }
    const { code, auth: { username, password, remember } } = this.props;
    const form = {
      code,
      username,
      password,
      remember
    };
    this.props.submit(form);
  }

  render() {
    const { auth: { error, username, remember }, intl } = this.props;
    return (
      <div className="panel-body">
        { error ? <div>{
          `C${error.code}:
            ${getFormatMsg(error.message, (key, values) => formatMsg(intl, key, values))}`
        }</div> : null }
        <form onSubmit={::this.handleSubmit} className="form-horizontal">
          <div className="login-form">
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="icon s7-user" />
                </span>
                <input type="text" placeholder={formatMsg(intl, 'userPlaceholder')}
                  autoComplete="off" className="form-control" value={username}
                  onChange={(ev) => this.handleTextChange(ev, 'username')}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="icon s7-lock" />
                </span>
                <input type="password" placeholder={formatMsg(intl, 'pwdPlaceholder')}
                  className="form-control" onChange={(ev) => this.handleTextChange(ev, 'password')}
                />
              </div>
            </div>
            <div className="form-group login-submit">
              <button data-dismiss="modal" type="submit" className="btn btn-primary btn-lg">
              {formatMsg(intl, 'login')}
              </button>
            </div>
            <div className="form-group footer row">
              <div className="col-xs-6">
                <NavLink to="/forgot">
                {formatMsg(intl, 'forgotPwd')}?
                </NavLink>
              </div>
              <div className="col-xs-6 remember">
                <label htmlFor="remember">{formatMsg(intl, 'remembered')}</label>
                <div className="am-checkbox">
                  <input type="checkbox" id="remember" checked={remember}
                    onChange={(ev) => this.handleCheckboxChange(ev, 'remember')}
                  />
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
