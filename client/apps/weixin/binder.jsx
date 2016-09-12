import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loginBind } from 'common/reducers/weixin';
import { Form, FormCell, CellHeader, CellFooter, Label, CellBody, Button, Input } from 'react-weui';
import './weui.less';

@connect(
  state => ({
    errorMsg: state.weixin.error,
  }),
  { loginBind }
)
export default class Binder extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    errorMsg: PropTypes.string.isRequired,
    loginBind: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    username: '',
    password: '',
  }
  handleTextChange(ev, field) {
    this.setState({ [field]: ev.target.value });
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    const { username, password } = this.state;
    const form = { username, password };
    this.props.loginBind(form).then((result) => {
      if (!result.error) {
        this.context.router.replace(
          this.props.location.query.next || '/weixin/account'
        );
      }
    });
  }

  render() {
    const { username, password } = this.state;
    return (
      <div className="panel-body">
        {this.props.errorMsg}
        <Form>
          <FormCell>
            <CellHeader>
              <Label>手机号</Label>
            </CellHeader>
            <CellBody>
              <Input type="tel" placeholder="请输入手机号" defaultValue={username} onChange={ev => this.handleTextChange(ev, 'username')} />
            </CellBody>
          </FormCell>
          <FormCell vcode>
            <CellHeader>
              <Label>密码</Label>
            </CellHeader>
            <CellBody>
              <Input type="password" placeholder="请输入密码" defaultValue={password}
                onChange={ev => this.handleTextChange(ev, 'password')}
              />
            </CellBody>
            <CellFooter>
              <img role="presentation" />
            </CellFooter>
          </FormCell>
        </Form>
        <Button className="button" style={{ marginTop: '30px', width: '90%' }} onClick={this.handleSubmit}>
          登录绑定
        </Button>
      </div>
    );
  }
}
