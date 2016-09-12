import React, { PropTypes } from 'react';
import { Button } from 'antd';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { requestSms, verifySms } from 'common/reducers/auth';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);

@injectIntl
@connect(
  state => ({
    smsId: state.auth.smsId,
    userId: state.auth.userId,
  }),
  { requestSms, verifySms })
export default class Forgot extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    smsId: PropTypes.number,
    userId: PropTypes.number,
    requestSms: PropTypes.func.isRequired,
    verifySms: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    error: null, // { message: {}},
    phone: '',
    smsCode: '',
    newPwd: '',
  }
  handleTextChange(ev, field) {
    this.setState({ [field]: ev.target.value });
  }
  handleSmsRequest(ev) {
    ev.preventDefault();
    this.props.requestSms(this.state.phone).then((result) => {
      if (result.error) {
        this.setState({ error: result.error });
      }
    });
  }
  handleSmsCancel(ev) {
    ev.preventDefault();
    this.context.router.goBack();
  }
  handleSmsVerify(ev) {
    ev.preventDefault();
    this.props.verifySms(
      this.props.smsId, this.props.userId,
      this.state.smsCode, this.state.newPwd
    ).then((result) => {
      if (result.error) {
        this.setState({ error: result.error });
      } else {
        this.context.router.replace('/login');
      }
    });
  }
  render() {
    // todo resendSmsCode
    const { intl } = this.props;
    const error = this.state.error;
    return (
      <div className="panel-body">
        {!this.props.smsId ?
        (<form className="form-horizontal">
          <p className="text-center">{formatMsg(intl, 'verifyCodeGuide')}</p>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-phone"></i></span>
              <input name="phone" required="required" autoComplete="off" maxlenght="11"
                placeholder={formatMsg(intl, 'phonePlaceholder')}
                className="form-control" type="text" value={this.state.phone}
                onChange={ev => this.handleTextChange(ev, 'phone')}
              />
            </div>
          </div>
          <div className="form-group login-submit">
            <Button type="primary" className="btn btn-block btn-lg" size="large" onClick={ev => this.handleSmsRequest(ev)}>
            {formatMsg(intl, 'verifyObtatin')}
            </Button>
            <Button type="ghost" className="btn btn-block" size="large" onClick={ev => this.handleSmsCancel(ev)}>
            {formatGlobalMsg(intl, 'cancel')}
            </Button>
          </div>
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
                value={this.state.smsCode} onChange={ev => this.handleTextChange(ev, 'smsCode')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-lock"></i></span>
              <input name="phone" required="required" autoComplete="off" type="password"
                placeholder={formatMsg(intl, 'newPwdPlaceholder')} className="form-control"
                value={this.state.newPwd} onChange={ev => this.handleTextChange(ev, 'newPwd')}
              />
            </div>
          </div>
          <div className="form-group login-submit">
            <Button type="primary" className="btn btn-block btn-lg" size="large" onClick={ev => this.handleSmsVerify(ev)}>
            {formatMsg(intl, 'finishVerify')}
            </Button>
            <Button type="ghost" className="btn btn-block" size="large" onClick={ev => this.handleSmsCancel(ev)}>
            {formatGlobalMsg(intl, 'cancel')}
            </Button>
          </div>
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
