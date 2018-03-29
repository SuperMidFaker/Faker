import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Form, Modal, message, Select, Radio, DatePicker, Input } from 'antd';
import { toggleNewBillModal, createBill } from 'common/reducers/bssBill';
import { loadAllBillTemplates } from 'common/reducers/bssBillTemplate';
import { BILL_TYPE, PARTNER_ROLES } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../message.i18n';


const { Option } = Select;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    visible: state.bssBill.visibleNewBillModal,
    partners: state.partner.partners,
    allBillTemplates: state.bssBillTemplate.billTemplates,
  }),
  {
    toggleNewBillModal, createBill, loadAllBillTemplates,
  }
)
@Form.create()
export default class NewBill extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    partners: [],
    partnerLabel: '客户',
    billTemplates: [],
    beginDate: new Date(),
    endDate: new Date(),
  }
  componentDidMount() {
    this.props.loadAllBillTemplates();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      const firstDay = new Date();
      const month = firstDay.getMonth();
      firstDay.setMonth(month - 1, 1);
      firstDay.setHours(0, 0, 0, 0);
      const endDay = new Date();
      endDay.setDate(0);
      endDay.setHours(0, 0, 0, 0);
      this.setState({ beginDate: firstDay, endDate: endDay });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleNewBillModal(false);
  }
  handleDateChange = (dates) => {
    this.setState({
      beginDate: dates[0].toDate(),
      endDate: dates[1].toDate(),
    });
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { beginDate, endDate } = this.state;
        const begin = moment(beginDate).format('YYYY-MM-DD HH:mm:ss');
        const end = moment(endDate).format('YYYY-MM-DD HH:mm:ss');
        const formVal = this.props.form.getFieldsValue();
        const templateId = Number.isNaN(formVal.template_id) ? null : Number(formVal.template_id);
        this.props.createBill({
          bill_title: formVal.bill_title,
          bill_type: formVal.bill_type,
          template_id: templateId,
          partner_id: Number(formVal.partner_id),
          start_date: begin,
          end_date: end,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 5);
          } else {
            this.props.toggleNewBillModal(false);
          }
        });
      }
    });
  }
  handleTypeSelect = (ev) => {
    this.props.form.setFieldsValue({
      partner_id: null,
      template_id: null,
    });
    this.setState({ billTemplates: [] });
    const billType = ev.target.value;
    if (billType === 'buyerBill') {
      const client = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.CUS);
      this.setState({ partners: client, partnerLabel: this.gmsg('CUS') });
    } else if (billType === 'sellerBill') {
      const service = this.props.partners.filter(pt => pt.role === PARTNER_ROLES.SUP);
      this.setState({ partners: service, partnerLabel: this.gmsg('SUP') });
    }
  }
  handlePartnerChange = (value) => {
    const templates = this.props.allBillTemplates.filter(tp =>
      (tp.settle_partner_id === Number(value) || tp.settle_partner_id === null));
    this.setState({ billTemplates: templates });
  }

  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const {
      partners, billTemplates, beginDate, endDate,
    } = this.state;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('newBill')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label={this.msg('billName')} {...formItemLayout} >
            {getFieldDecorator('bill_title', {
              rules: [{ required: true, message: '账单名称必填' }],
            })(<Input />)}
          </FormItem>
          <FormItem label={this.msg('billType')} {...formItemLayout}>
            {getFieldDecorator('bill_type', {
              rules: [{ required: true, message: '账单类型必选' }],
            })(<RadioGroup onChange={this.handleTypeSelect}>
              {
                BILL_TYPE.map(qt =>
                  <RadioButton value={qt.key} key={qt.key}>{qt.text}</RadioButton>)
              }
            </RadioGroup>)}
          </FormItem>
          <FormItem label={this.state.partnerLabel} {...formItemLayout}>
            {getFieldDecorator('partner_id', {
              rules: [{ required: true, message: '结算对象必选' }],
            })(<Select
              showSearch
              showArrow
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={this.handlePartnerChange}
            >
              { partners.map(pt => (
                <Option
                  value={String(pt.id)}
                  key={String(pt.id)}
                >{pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
                </Option>))
              }
            </Select>)}
          </FormItem>
          <FormItem label={this.msg('billTemplates')} {...formItemLayout} >
            {getFieldDecorator('template_id', {
              rules: [{ required: true, message: '账单模板必选' }],
            })(<Select showSearch optionFilterProp="children">
              {billTemplates.map(data => (
                <Option key={String(data.id)} value={String(data.id)}>{data.name}</Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="账期" {...formItemLayout} >
            <RangePicker
              value={[moment(beginDate), moment(endDate)]}
              onChange={this.handleDateChange}
            />
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
