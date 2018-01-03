import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Col, Card, Form, Modal, Row, Spin } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { closeTransitionModal, loadTransitionTraceDetail } from 'common/reducers/cwmTransition';
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
    detail: state.cwmTransition.transitionModal.detail,
    trace_id: state.cwmTransition.transitionModal.trace_id,
    visible: state.cwmTransition.transitionModal.visible,
    needReload: state.cwmTransition.transitionModal.needReload,
    loading: state.cwmTransition.transitionModal.loading,
  }),
  { closeTransitionModal, loadTransitionTraceDetail }
)
@Form.create()
export default class TransitionModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    closeTransitionModal: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && (nextProps.trace_id !== this.props.trace_id || nextProps.needReload)) {
      this.props.loadTransitionTraceDetail(nextProps.trace_id);
    }
  }
  handleClose = () => {
    this.props.form.resetFields();
    this.props.closeTransitionModal();
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)

  render() {
    const { visible, form, loading } = this.props;
    const title = (<div>
      <span>库存调整 {this.props.trace_id}</span>
      <div className="toolbar-right">
        <Button onClick={this.handleClose}>关闭</Button>
      </div>
    </div>);
    return (
      <Modal
        maskClosable={false}
        title={title}
        width="100%"
        wrapClassName="fullscreen-modal"
        closable={false}
        visible={visible}
        footer={null}
      >
        <Spin spinning={loading}>
          <Form>
            <Row gutter={24}>
              <Col span={12}>
                <Card title="属性调整" >
                  <TransitPane form={form} />
                </Card>
              </Col>
              <Col span={6}>
                <Card title="数量调整" >
                  <AdjustPane />
                </Card>
                <Card title="状态调整" >
                  <FreezePane />
                </Card>
              </Col>
              <Col span={6}>
                <Card title="库存事务记录" >
                  <LogsPane traceId={this.props.detail.trace_id} />
                </Card>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
