import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Button, Icon, Tabs } from 'antd';
import { closeSubFlowAuthModal, createProviderFlow, deleteProviderFlow, delFlow, toggleFlowDesigner } from 'common/reducers/scofFlow';
import FlowInfoPane from '../tabpane/flowInfoPane';
import ShareFlowPane from '../tabpane/shareFlowPane';
// import TrackPointsPane from '../tabpane/trackPointsPane';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;
const { confirm } = Modal;

@injectIntl
@connect(
  state => ({
    submitting: state.scofFlow.submitting,
    visible: state.scofFlow.flowProviderModal.visible,
    currentFlow: state.scofFlow.currentFlow,
  }),
  {
    closeSubFlowAuthModal, createProviderFlow, deleteProviderFlow, delFlow, toggleFlowDesigner,
  }
)
export default class FlowSettingModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }

  msg = formatMsg(this.props.intl)

  handleCancel = () => {
    this.props.closeSubFlowAuthModal();
  }
  handleDeleteFlow = () => {
    const self = this;
    confirm({
      title: '确认删除此流程吗?',
      content: '删除流程后将不可恢复',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        self.props.delFlow(self.props.currentFlow.id).then((result) => {
          if (!result.error) {
            self.handleCancel();
            self.props.toggleFlowDesigner(false);
          }
        });
      },
      onCancel() {
      },
    });
  }
  render() {
    const { visible, currentFlow } = this.props;
    return (
      <Modal
        title="流程设置"
        width={800}
        style={{ top: 24 }}
        visible={visible}
        maskClosable={false}
        footer={null}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Tabs
          defaultActiveKey="info"
          tabPosition="left"
          style={{ height: 640 }}
        >
          <TabPane tab={<span><Icon type="profile" />流程信息</span>} key="info">
            <FlowInfoPane />
          </TabPane>
          {!currentFlow.main_flow_id &&
          <TabPane tab={<span><Icon type="key" />共享授权</span>} key="share">
            <ShareFlowPane />
          </TabPane>}
          <TabPane tab={<span><Icon type="ellipsis" />更多</span>} key="more">
            <Button type="danger" icon="delete" onClick={this.handleDeleteFlow}>删除流程</Button>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

