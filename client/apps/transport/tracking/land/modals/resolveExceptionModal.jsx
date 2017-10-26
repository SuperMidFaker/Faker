import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, message, Alert, Input, Modal, DatePicker } from 'antd';
import { showDealExcpModal, loadExceptions, dealException } from 'common/reducers/trackingLandException';
import { changeDeliverPrmDate } from 'common/reducers/trackingLandStatus';
import { TRANSPORT_EXCEPTIONS } from 'common/constants';
import '../../../index.less';
const FormItem = Form.Item;
const delay = TRANSPORT_EXCEPTIONS.find(item => item.key === 'SHIPMENT_EXCEPTION_SYS_DELIVER_OVERDUE');
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginName: state.account.username,
    dealExcpModal: state.trackingLandException.dealExcpModal,
    visible: state.trackingLandException.dealExcpModal.visible,
    shipmtNo: state.trackingLandException.dealExcpModal.shipmtNo,
    exceptions: state.trackingLandException.exceptions,
    dispatch: state.shipment.previewer.dispatch,
  }),
  { showDealExcpModal, loadExceptions, dealException, changeDeliverPrmDate }
)
@Form.create()
export default class ResolveExceptionModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    loginName: PropTypes.string.isRequired,
    showDealExcpModal: PropTypes.func.isRequired,
    loadExceptions: PropTypes.func.isRequired,
    dealExcpModal: PropTypes.object.isRequired,
    dealException: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    exceptions: PropTypes.object.isRequired,
    dispatch: PropTypes.object.isRequired,
    changeDeliverPrmDate: PropTypes.func.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.dealExcpModal.exception.solution !== nextProps.dealExcpModal.exception.solution) {
      this.props.form.setFieldsValue({ solution: nextProps.dealExcpModal.exception.solution });
    }
  }
  handleOk = () => {
    const { shipmtNo, form, loginName, loginId, tenantId, tenantName, dealExcpModal: { exception }, dispatch } = this.props;
    const fieldsValue = form.getFieldsValue();
    const solution = fieldsValue.solution;
    const excpId = exception.id;
    form.validateFields((errors) => {
      if (!errors) {
        const data = { dispId: dispatch.id,
          shipmtNo,
          loginName,
          loginId,
          tenantId,
          tenantName,
          deliverPrmDate: moment(fieldsValue.deliver_prm_date).format('YYYY-MM-DD HH:mm:ss'),
        };
        const promises = [this.props.dealException({ shipmtNo, excpId, solution, solver: loginName })];
        if (exception.type === delay.code) {
          promises.push(this.props.changeDeliverPrmDate(data));
        }
        Promise.all(promises).then((result) => {
          if (result[0].error) {
            message.error(result[0].error);
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
    });
  }
  handleCancel = () => {
    this.props.showDealExcpModal({ visible: false });
  }
  renderException() {
    const { dealExcpModal: { exception } } = this.props;
    const t = TRANSPORT_EXCEPTIONS.find(item => item.code === exception.type);
    const type = t ? t.name : '';
    const description = exception.excp_event;
    if (exception.excp_level === 'INFO') {
      return (<Alert showIcon type="info" message={`${type}: ${description}`} />);
    } else if (exception.excp_level === 'WARN') {
      return (<Alert showIcon type="warning" message={`${type}: ${description}`} />);
    } else if (exception.excp_level === 'ERROR') {
      return (<Alert showIcon type="error" message={`${type}: ${description}`} />);
    }
    return (<span />);
  }
  render() {
    const { form: { getFieldDecorator }, dealExcpModal: { exception }, dispatch } = this.props;
    return (
      <Modal maskClosable={false} title="处理异常" onCancel={this.handleCancel} onOk={this.handleOk}
        visible={this.props.visible}
      >
        {this.renderException()}
        <Form className="row">
          <FormItem label="备注">
            {getFieldDecorator('solution', {
              initialValue: '',
              rules: [{ type: 'string', message: '请填写异常原因或解决方案' }],
            })(
              <Input.TextArea id="control-textarea" autosize placeholder="请说明异常原因或解决方案" />
            )}
          </FormItem>
          {exception.type === delay.code && (
            <FormItem label="承诺送货时间">
              {getFieldDecorator('deliver_prm_date', {
                initialValue: dispatch.deliver_prm_date ? moment(dispatch.deliver_prm_date) : '',
                rules: [{ type: 'object', required: true, message: '请填写承诺送货日期' }],
              })(
                <DatePicker allowClear={false} style={{ width: '100%' }} />
              )}
            </FormItem>)}
        </Form>
        {exception.resolved === 1 ? (<div style={{ marginTop: 15 }}>上次处理时间：<span>{moment(exception.solve_date).format('YYYY-MM-DD HH:mm')}</span> 处理人: <span>{exception.solver}</span></div>) : (<span />)}
      </Modal>
    );
  }
}
