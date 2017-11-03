import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, Select, DatePicker, Modal } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { createFilename } from 'client/util/dataTransform';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const endDay = new Date();
const firstDay = new Date();
firstDay.setDate(1);
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@Form.create()
export default class BillingForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    beginDate: firstDay,
    endDate: endDay,
    chooseModel: '',
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleOk = () => {
    const fieldsValue = this.props.form.getFieldsValue();
    const { beginDate, endDate } = this.state;
    const begin = moment(beginDate).format('YYYY-MM-DD HH:mm:ss');
    const end = moment(endDate).format('YYYY-MM-DD HH:mm:ss');
    window.open(`${API_ROOTS.default}v1/clearance/expense/exportExpExcel/${createFilename('expenses')}.xlsx?tenantId=${this.props.tenantId}&chooseModel=${fieldsValue.chooseModel}&beginDate=${begin}&endDate=${end}`);
    window.open(`${API_ROOTS.default}v1/clearance/expense/exportDeclExcel/${createFilename('declare_info')}.xlsx?tenantId=${this.props.tenantId}&chooseModel=${fieldsValue.chooseModel}&beginDate=${begin}&endDate=${end}`);
    this.props.toggle();
  }
  handleCancel = () => {
    this.props.toggle();
  }
  handleDateChange = (dates) => {
    this.setState({
      beginDate: dates[0].toDate(),
      endDate: dates[1].toDate(),
    });
  }
  render() {
    const { form: { getFieldDecorator }, visible } = this.props;
    const { beginDate, endDate } = this.state;
    return (
      <Modal maskClosable={false} visible={visible} title={this.msg('eptExp')}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Form>
          <FormItem
            id="select"
            label={this.msg('chooseModel')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            {getFieldDecorator('chooseModel')(
              <Select id="select" >
                <Option value="acptDate">{this.msg('acptDate')}</Option>
                <Option value="cleanDate">{this.msg('cleanDate')}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            id="control-input"
            label={this.msg('range')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            <RangePicker value={[moment(beginDate), moment(endDate)]} onChange={this.handleDateChange} />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
