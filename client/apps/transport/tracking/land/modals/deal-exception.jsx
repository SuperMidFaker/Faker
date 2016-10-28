import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, message, Card, Input, Modal, Icon } from 'antd';
import { showDealExcpModal, loadExceptions, dealException } from 'common/reducers/trackingLandException';
import { TRANSPORT_EXCEPTIONS } from 'common/constants';
import '../../../index.less';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    dealExcpModal: state.trackingLandException.dealExcpModal,
    visible: state.trackingLandException.dealExcpModal.visible,
    shipmtNo: state.trackingLandException.dealExcpModal.shipmtNo,
    exceptions: state.trackingLandException.exceptions,
  }),
  { showDealExcpModal, loadExceptions, dealException }
)
@Form.create()
export default class DealException extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    showDealExcpModal: PropTypes.func.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    dealExcpModal: PropTypes.object.isRequired,
    dealException: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    exceptions: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.dealExcpModal.exception.solution !== nextProps.dealExcpModal.exception.solution) {
      this.props.form.setFieldsValue({ solution: nextProps.dealExcpModal.exception.solution });
    }
  }
  handleOk = () => {
    const { shipmtNo, form, loginName, dealExcpModal: { exception } } = this.props;
    const fieldsValue = form.getFieldsValue();
    const solution = fieldsValue.solution;
    const excpId = exception.id;
    this.props.dealException({ excpId, solution, solver: loginName }).then((result) => {
      if (result.error) {
        message.error(result.error);
      } else {
        this.handleCancel();
        this.props.loadExceptions({
          shipmtNo,
          pageSize: this.props.exceptions.pageSize,
          currentPage: this.props.exceptions.current,
        });
      }
    });
  }
  handleCancel = () => {
    this.props.showDealExcpModal({ visible: false });
  }
  renderException() {
    const { dealExcpModal: { exception } } = this.props;
    const t = TRANSPORT_EXCEPTIONS.find(item => item.code === exception.type);
    const type = t ? t.name : '';
    let description = '';
    if (exception.charge === null || exception.charge === 0) {
      description = exception.excp_event;
    } else if (exception.charge) {
      description = `费用金额 ${exception.charge.toFixed(2)}元, ${exception.excp_event}`;
    }
    if (exception.excp_level === 'INFO') {
      return (<div><Icon type="info-circle" className="sign-info" /> {type} : {description}</div>);
    } else if (exception.excp_level === 'WARN') {
      return (<div><Icon type="exclamation-circle" className="sign-warning" /> {type} : {description}</div>);
    } else if (exception.excp_level === 'ERROR') {
      return (<div><Icon type="cross-circle" className="sign-error" /> {type} : {description}</div>);
    }
    return (<span />);
  }
  render() {
    const { form: { getFieldDecorator }, dealExcpModal: { exception } } = this.props;
    return (
      <Modal title="处理异常" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible} maskClosable={false}
      >
        <Card>
          {this.renderException()}
        </Card>
        <Form className="row">
          <strong style={{ lineHeight: 2.4, fontSize: 14 }}>解决方案:</strong>
          {getFieldDecorator('solution', {
            initialValue: '',
          })(
            <Input type="textarea" id="control-textarea" rows="5" placeholder="请输入解决方案" />
          )}
        </Form>
        {exception.resolved === 1 ? (<div style={{ marginTop: 15 }}>上次处理时间：<span>{moment(exception.solve_date).format('YYYY-MM-DD HH:mm')}</span> 处理人: <span>{exception.solver}</span></div>) : (<span />)}
      </Modal>

    );
  }
}
