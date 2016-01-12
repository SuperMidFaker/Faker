import React, { PropTypes } from 'react';
import {Modal} from '../../reusable/ant-ui';

export default class DelWarningModal extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired
  }
  render() {
    const {visible} = this.props;
    return (
      <Modal visible={visible} title="删除确认" onOk={this.handleOk} onCancel={this.handleCancel}
              footer={[
                          <Button key="back" type="ghost" size="large" onClick={this.handleCancel}>返 回</Button>,
                                      <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
                                      确认</Button> ]}>
                                      <span>{text}</span>
         <Input text="" onChange={} />
         </Modal>
  }
}
