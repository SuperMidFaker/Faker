import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Alert, Button, Calendar, Card, Modal, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeDateModal, savePickOrDeliverDate } from 'common/reducers/trackingLandStatus';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    visible: state.trackingLandStatus.dateModal.visible,
    type: state.trackingLandStatus.dateModal.type,
    dispId: state.trackingLandStatus.dateModal.dispId,
    shipmtNo: state.trackingLandStatus.dateModal.shipmtNo,
  }),
  { closeDateModal, savePickOrDeliverDate }
)
export default class ExcpEventsModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    onOK: PropTypes.func,
    closeDateModal: PropTypes.func.isRequired,
    savePickOrDeliverDate: PropTypes.func.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
  }
  handleCancel = () => {
    this.props.closeDateModal();
  }
  render() {
    return (
      <Modal title={this.msg('trackingEventsModalTitle')} onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} width="80%" maskClosable={false}
      >
        <Row>
          <Col span="8" style={{ paddingRight: 16 }}>
            <Card bodyStyle={{ padding: 0 }}>
              <Calendar fullscreen={false} />
            </Card>
          </Col>
          <Col span="16">
            <div style={{ marginBottom: 8, textAlign: 'right' }}>
              <h2 style={{ float: 'left' }}>8月11日</h2>
              <Button>添加异常</Button> <Button>添加特殊费用</Button>
            </div>
            <Card>
              <Alert message="已准时提货"
                description="成功提示的辅助性文字介绍成功提示的辅助性文字介绍成功提示的辅助性文字介绍成功提示的辅助性文字介绍"
                type="success"
                showIcon
              />
              <Alert message="运输计划已变更"
                description="消息提示的辅助性文字介绍消息提示的辅助性文字介绍消息提示的辅助性文字介绍"
                type="info"
                showIcon
              />
              <Alert
                message="特殊费用"
                description="警告提示的辅助性文字介绍警告提示的辅助性文字介绍"
                type="warning"
                showIcon
              />
              <Alert
                message="货损"
                description="错误提示的辅助性文字介绍错误提示的辅助性文字介绍错误提示的辅助性文字介绍错误提示的辅助性文字介绍错误提示的辅助性文字介绍错误提示的辅助性文字介绍"
                type="error"
                showIcon
              />
            </Card>
          </Col>
        </Row>
      </Modal>
    );
  }
}
