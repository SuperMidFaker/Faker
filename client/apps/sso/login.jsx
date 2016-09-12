import React, { PropTypes } from 'react';
import { Button, Spin } from 'antd';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { submit, setValue, systemLoading } from '../../../common/reducers/auth';
import NavLink from '../../components/nav-link';
import { getFormatMsg } from 'client/util/react-ant';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    code: state.corpDomain.code,
    auth: state.auth,
    loading: state.auth.loading,
  }),
  { submit, setValue, systemLoading }
)
export default class Login extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    auth: PropTypes.object,
    code: PropTypes.string.isRequired,
    setValue: PropTypes.func,
    submit: PropTypes.func,
    loading: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    this.props.systemLoading(false);
  }
  handleTextChange(ev, field) {
    this.props.setValue(field, ev.target.value);
  }
  handleCheckboxChange(ev, field) {
    this.props.setValue(field, ev.target.checked);
  }
  handleSubmit(ev) {
    this.props.systemLoading(true);
    ev.preventDefault();
    if (this.props.auth.nonTenant) {
      return;
    }
    const { code, auth: { username, password, remember } } = this.props;
    // todo xss
    const form = {
      code,
      username,
      password,
      remember,
    };
    this.props.submit(form).then(() => {
      this.props.systemLoading(false);
    });
  }

  render() {
    const { auth: { error, username, remember }, intl } = this.props;
    return (
      <Spin spinning={this.props.loading}>
      <div className="panel-body">
        {error ? <div>{
          `C${error.code}:
            ${getFormatMsg(error.message, (key, values) => formatMsg(intl, key, values))}`
        }</div> : null}
        <form onSubmit={::this.handleSubmit} className="form-horizontal">
          <div className="login-form">
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="icon s7-user" />
                </span>
                <input type="text" placeholder={formatMsg(intl, 'userPlaceholder')}
                  autoComplete="off" className="form-control" value={username}
                  onChange={ev => this.handleTextChange(ev, 'username')}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="icon s7-lock" />
                </span>
                <input type="password" placeholder={formatMsg(intl, 'pwdPlaceholder')}
                  className="form-control" onChange={ev => this.handleTextChange(ev, 'password')}
                />
              </div>
            </div>
            <div className="form-group login-submit">
              <Button type="primary" className="btn btn-block btn-lg" size="large" htmlType="submit">{formatMsg(intl, 'login')}</Button>
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
                    onChange={ev => this.handleCheckboxChange(ev, 'remember')}
                  />
                  <label htmlFor="remember"></label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      </Spin>
    );
  }
}
