import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { requestSms, verifySms, enterForgot } from '../../../universal/redux/reducers/auth';

@connect(
  state => ({
    verified: state.auth.verified,
    smsId: state.auth.smsId,
    userId: state.auth.userId,
    errorMsg: state.auth.error && state.auth.error.message
  }),
  { requestSms, verifySms, enterForgot })
export default class Forgot extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    requestSms: PropTypes.func.isRequired,
    verifySms: PropTypes.func.isRequired,
    enterForgot: PropTypes.func.isRequired,
    smsId: PropTypes.number,
    userId: PropTypes.number,
    verified: PropTypes.bool,
    errorMsg: PropTypes.string
  }
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      smsCode: '',
      newPwd: ''
    };
  }
  componentWillMount() {
    this.props.enterForgot();
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.verified && nextProps.verified) {
      this.props.history.replaceState('/login');
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
    this.props.history.goBack();
  }
  handleSmsVerify(ev) {
    ev.preventDefault();
    this.props.verifySms(this.props.smsId, this.props.userId, this.state.smsCode, this.state.newPwd);
  }
  render() {
    // todo resendSmsCode
    return (
      <div className="panel-body">
        { !this.props.smsId ?
        (<form className="form-horizontal">
          <p className="text-center">点击获取验证码,我们将向该号码发送免费的短信验证码以重置密码.</p>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-phone"></i></span>
              <input name="phone" required="required" placeholder="登录手机号" autoComplete="off"
              className="form-control" type="text" maxlenght="11" value={ this.state.phone}
              onChange={ (ev) => this.handleTextChange(ev, 'phone') } />
            </div>
          </div>
          <button className="btn btn-block btn-primary btn-lg" onClick={ (ev) => this.handleSmsRequest(ev) }>
          获取验证码</button>
          <button className="btn btn-block" onClick={ (ev) => this.handleSmsCancel(ev) }>取消</button>
          {
            this.props.errorMsg && (
            <div className="row text-center">
              <p className="text-warning">{ this.props.errorMsg }</p>
            </div>)
          }
        </form>)
          :
        (<form className="form-horizontal">
          <p className="text-center">验证码已经发送到您的手机:</p>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-phone"></i></span>
              <input name="phone" required="required" placeholder="短信验证码" autoComplete="off"
              className="form-control" type="text" maxlenght="7" value={ this.state.smsCode }
              onChange={ (ev) => this.handleTextChange(ev, 'smsCode') } />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon"><i className="icon s7-lock"></i></span>
              <input name="phone" required="required" placeholder="新密码" autoComplete="off"
              className="form-control" type="password" value={ this.state.newPwd }
              onChange={ (ev) => this.handleTextChange(ev, 'newPwd') } />
            </div>
          </div>
          <button className="btn btn-block btn-primary btn-lg" onClick={ (ev) => this.handleSmsVerify(ev) }>
          完成验证</button>
          <button className="btn btn-block" onClick={ (ev) => this.handleSmsCancel(ev) }>取消</button>
          {
            this.props.errorMsg && (
            <div className="row text-center">
              <p className="text-warning">{ this.props.errorMsg }</p>
            </div>)
          }
        </form>)
        }
      </div>
    );
  }
}
