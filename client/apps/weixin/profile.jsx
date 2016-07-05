import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadWelogixProfile, unbindAccount } from 'common/reducers/weixin';
import connectFetch from 'client/common/decorators/connect-fetch';

import WeUI from 'react-weui';
import './weui.less';

const {Form, FormCell, CellHeader, CellFooter, Label, CellBody, Button, Input} = WeUI;


function fetchData({ state, dispatch, cookie }) {
  if (!state.weixin.profile.loaded) {
    return dispatch(loadWelogixProfile(cookie));
  }
}

@connectFetch()(fetchData)
@connect(
  state => ({
    profile: state.weixin.profile
  }),
  { unbindAccount }
)
export default class WxProfile extends React.Component {
  static propTypes = {
    profile: PropTypes.object.isRequired,
    unbindAccount: PropTypes.func.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  state = {
    error: ''
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.unbindAccount().then(result => {
      if (result.error) {
        this.setState({ error: result.error.msg });
      } else {
        this.context.router.replace('/weixin/bind');
      }
    });
  }

  render() {
    const { name, phone, email, position } = this.props.profile;
    return (
      <div className="panel-body">
        { this.state.error }
        <Form>
          <FormCell>
              <CellHeader>
                  <Label>姓名</Label>
              </CellHeader>
              <CellBody>
                  <Input type="text" defaultValue={name} disabled />
              </CellBody>
          </FormCell>
          <FormCell vcode={true}>
              <CellHeader>
                  <Label>手机号</Label>
              </CellHeader>
              <CellBody>
                  <Input type="tel" defaultValue={phone} disabled />
              </CellBody>
              <CellFooter>
                  <img />
              </CellFooter>
          </FormCell>
          <FormCell>
              <CellHeader>
                  <Label>邮箱</Label>
              </CellHeader>
              <CellBody>
                  <Input type="email" defaultValue={email} disabled />
              </CellBody>
          </FormCell>
          <FormCell>
              <CellHeader>
                  <Label>职位</Label>
              </CellHeader>
              <CellBody>
                  <Input type="text" defaultValue={position} disabled />
              </CellBody>
          </FormCell>
        </Form>
        <Button style={{position: 'fixed', bottom: '5%', left: '5%', width: '90%', backgroundColor: 'rgba(255, 102, 0, 1)'}}
        onClick={this.handleSubmit}>
              解除绑定
        </Button>
      </div>
    );
  }
}
