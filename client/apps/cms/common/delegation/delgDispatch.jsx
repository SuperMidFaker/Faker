import React, { PropTypes, Component } from 'react';
import QueueAnim from 'rc-queue-anim';
import { Icon, Button, Select, Form, Popconfirm, message, Card } from 'antd';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
function noop() {}
@Form.create()
export default class DelgDispatch extends Component {
  static PropTypes = {
    onClose: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired,
  }
  constructor(props) {
    super(props);
    this.onClose = this.props.onClose || noop;
  }
  handleConfirm = () => {
    message.success('点击了确定');
  }
  handleCancel = () => {
    message.error('点击了取消');
  }

  render() {
    const { show } = this.props;
    let dock = '';
    if (show) {
      dock = (
        <div className="dock-panel inside">
          <div className="panel-content">
            <div className="header">
              <span className="title">分配报关委托</span>
              <div className="pull-right">
                <Button type="ghost" shape="circle-outline" onClick={this.onClose}>
                  <Icon type="cross" />
                </Button>
              </div>
            </div>
            <Card>
              <FormItem label="分配给：" {...formItemLayout} >
                  <Select style={{ width: '80%' }}>
                  </Select>
              </FormItem>
            </Card>
            <div>
                <Popconfirm title="你确定撤回分配吗?" onConfirm={() => this.handleConfirm} onCancel={() => this.handleCancel}>
                  <Button>撤销</Button>
                </Popconfirm>
            </div>
          </div>
        </div>
      );
    }
    return (
      <QueueAnim key="dock" animConfig={{ translateX: [0, 600], opacity: [1, 1] }}>{dock}</QueueAnim>
    );
  }
}
