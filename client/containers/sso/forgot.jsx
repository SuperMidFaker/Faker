import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { requestSms, verifySms, enterForgot } from '../../../universal/redux/reducers/auth';
import { format } from 'universal/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

@injectIntl
@connect(
  state => ({
    verified: state.auth.verified,
    smsId: state.auth.smsId,
    userId: state.auth.userId,
    error: state.auth.error
  }),
  { requestSms, verifySms, enterForgot })
export default class Forgot extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    requestSms: PropTypes.func.isRequired,
    verifySms: PropTypes.func.isRequired,
    enterForgot: PropTypes.func.isRequired,
    smsId: PropTypes.number,
    userId: PropTypes.number,
    verified: PropTypes.bool,
    error: PropTypes.object
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }
  state = {
    phone: '',
    smsCode: '',
    newPwd: ''
  }
  componentWillMount() {
    this.props.enterForgot();
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.verified && nextProps.verified) {
      this.context.router.replace('/login');
    }
  }
  handleTextChange(ev, field) {
    this.setState({ ...this.state, [field]: ev.target.value });
  }
  handleSmsRequest(ev) {
    ev.preventDefault();
    this.props.requestSms(this.state.phone);
  }
  handleSmsCancel(ev) {
    ev.preventDefault();
    // this.props.leaveForgot();
    this.context.router.goBack();
  }
  handleSmsVerify(ev) {
    ev.preventDefault();
    this.props.verifySms(this.props.smsId, this.props.userId, this.state.smsCode, this.state.newPwd);
  }
  render() {
    // todo resendSmsCode
    const { intl, error } = this.props;
    return (
      <div className="panel-body">
        { !this.props.smsId ?
        (<form className="form-horizontal">
          <p className="text-center">{formatMsg(intl, 'verifyCodeGuide')}</p>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-phone"></i></span>
              <input name="phone" required="required" autoComplete="off" maxlenght="11"
                placeholder={formatMsg(intl, 'phonePlaceholder')}
                className="form-control" type="text" value={this.state.phone}
                onChange={(ev) => this.handleTextChange(ev, 'phone')}
              />
            </div>
          </div>
          <button className="btn btn-block btn-primary btn-lg" onClick={ (ev) => this.handleSmsRequest(ev) }>
            {formatMsg(intl, 'verifyObtatin')}
          </button>
          <button className="btn btn-block" onClick={(ev) => this.handleSmsCancel(ev)}>{formatGlobalMsg(intl, 'cancel')}</button>
          {
            error && (
            <div className="row text-center">
              <p className="text-warning">{formatMsg(intl, error.message.key, error.message.values)}</p>
            </div>)
          }
        </form>)
          :
        (<form className="form-horizontal">
          <p className="text-center">{formatMsg(intl, 'smsCodeSent')} </p>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-phone" /></span>
              <input name="phone" required="required" autoComplete="off" type="text" maxlenght="7"
                placeholder={formatMsg(intl, 'smsCode')} className="form-control"
                value={this.state.smsCode} onChange={(ev) => this.handleTextChange(ev, 'smsCode')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-lock"></i></span>
              <input name="phone" required="required" autoComplete="off" type="password"
                placeholder={formatMsg(intl, 'newPwdPlaceholder')} className="form-control"
                value={this.state.newPwd} onChange={(ev) => this.handleTextChange(ev, 'newPwd')}
              />
            </div>
          </div>
          <button className="btn btn-block btn-primary btn-lg" onClick={(ev) => this.handleSmsVerify(ev)}>
          {formatMsg(intl, 'finishVerify')}
          </button>
          <button className="btn btn-block" onClick={ (ev) => this.handleSmsCancel(ev) }>
          {formatGlobalMsg(intl, 'cancel')}
          </button>
          {
            error && (
            <div className="row text-center">
              <p className="text-warning">{formatMsg(intl, error.message.key, error.message.values)}</p>
            </div>)
          }
        </form>)
        }
      </div>
    );
  }
}
