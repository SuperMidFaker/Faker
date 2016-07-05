import React, { PropTypes } from 'react';
import WeUI from 'react-weui';
import '../../weui.less';

const {Msg, Button} = WeUI;

export default class UploadSucceed extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  render() {
    return (
      <div className="panel-body">
        <Msg type="success" title="上传成功" description=""/>
        <div className="button" style={{marginTop: '50px'}}>
          <Button type="primary" onClick={() => {this.context.router.push({ pathname: '/weixin/tms/pod/' }); }}>
            继续上传
          </Button>
          <Button type="default" onClick={() => {window.close(); }}>
            退出
          </Button>
        </div>
      </div>
    );
  }
}
