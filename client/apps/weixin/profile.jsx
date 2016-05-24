import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { loadWelogixProfile, unbindAccount } from 'common/reducers/weixin';
import connectFetch from 'client/common/decorators/connect-fetch';

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
        <form onSubmit={this.handleSubmit} className="form-horizontal">
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="icon s7-user" />
              </span>
              <input type="text" className="form-control" value={name} disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="icon s7-phone" />
              </span>
              <input type="text" className="form-control" value={phone} disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="icon s7-mail" />
              </span>
              <input className="form-control" placeholder="email" value={email} disabled />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="icon s7-link" />
              </span>
              <input className="form-control" placeholder="职位" value={position} disabled />
            </div>
          </div>
          <div className="form-group login-submit">
            <button data-dismiss="modal" type="submit" className="btn btn-primary btn-lg">
            解除绑定
            </button>
          </div>
        </form>
      </div>
    );
  }
}
