import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Col, Card, Form, Modal, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeTransitionModal } from 'common/reducers/cwmTransition';
import { format } from 'client/common/i18n/helpers';
import TransitPane from '../pane/transitPane';
import AdjustPane from '../pane/adjustPane';
import FreezePane from '../pane/freezePane';
import LogsPane from '../pane/logsPane';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    detail: state.cwmTransition.transitionModal.detail,
    visible: state.cwmTransition.transitionModal.visible,
    needReload: state.cwmTransition.transitionModal.needReload,
  }),
  { closeTransitionModal }
)
@Form.create()
export default class TransitionModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    closeTransitionModal: PropTypes.func.isRequired,
  }
  state = {
  }
  handleClose = () => {
    this.props.form.resetFields();
    this.props.closeTransitionModal({ needReload: true });
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { visible, form } = this.props;
    const title = (<div>
      <span>库存变更:{this.props.detail.trace_id}</span>
      <div className="toolbar-right">
        <Button onClick={this.handleClose}>关闭</Button>
      </div>
    </div>);
    return (
      <Modal title={title} width="100%" maskClosable={false} wrapClassName="fullscreen-modal" closable={false}
        visible={visible} footer={null}
      >
        <Form>
          <Row gutter={24}>
            <Col span={12}>
              <Card title="库存转移" noHovering>
                <TransitPane form={form} />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="数量调整" noHovering>
                <AdjustPane />
              </Card>
              <Card title="库存冻结" noHovering>
                <FreezePane />
              </Card>
            </Col>
            <Col span={6}>
              <Card title="变更记录" noHovering>
                <LogsPane />
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
