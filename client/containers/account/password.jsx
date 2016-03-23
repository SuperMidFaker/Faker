import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Icon, Button, Form, Input, Row, Col, Select, Tabs, message } from 'ant-ui';
import { changePassword } from 'universal/redux/reducers/auth';

@connect(
  undefined, { changePassword }
)
export default class ChangePassword extends React.Component {
  static propTypes = {
    changePassword: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired // todo
  }
  constructor(props) {
    super(props);
    this.state = {
      oldPwd: '',
      newPwd: '',
      confirm: ''
    };
  }
  handleTextChange(ev, field) {
    const newFv = { [field]: ev.target.value };
    this.setState({ ...this.state, ...newFv });
  }
  handlePasswordChange() {
    const { oldPwd, newPwd, confirm } = this.state;
    if (newPwd !== oldPwd && newPwd === confirm) {
      this.props.changePassword(oldPwd, newPwd, this.props.history);
    }
  }
  handleCancel() {
    this.props.history.goBack();
  }
  renderTextInput(labelName, field) {
    return (
      <div className="form-group">
        <label className="col-sm-3 control-label">{ labelName }</label>
        <div className="col-sm-6">
          <input className="form-control" type="password" value={ this.state[field] } onChange={ (ev) => this.handleTextChange(ev, field) } />
        </div>
      </div>
    );
  }
  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3>密码修改</h3>
        </div>
        <div className="panel-body">
          <div className="form-horizontal group-border-dashed">
            { this.renderTextInput('旧密码', 'oldPwd') }
            { this.renderTextInput('新密码', 'newPwd') }
            { this.renderTextInput('确认密码', 'confirm') }
          </div>
          <div className="spacer text-right">
            <button type="submit" className="btn btn-space btn-primary" onClick={ () => this.handlePasswordChange() }>确定</button>
            <button className="btn btn-space btn-default" onClick={ () => this.handleCancel() }>取消</button>
          </div>
        </div>
      </div>
    );
  }
}
