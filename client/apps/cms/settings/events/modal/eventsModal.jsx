import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { toggleEventsModal, createPref, getPrefEventFees } from 'common/reducers/cmsPrefEvents';
import { loadAllFeeElements } from 'common/reducers/bssFeeSettings';
import { Form, Modal, Select } from 'antd';
import { CMS_EVENTS } from 'common/constants';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    visible: state.cmsPrefEvents.eventsModal.visible,
    event: state.cmsPrefEvents.eventsModal.event,
    feeCodes: state.cmsPrefEvents.eventsModal.feeCodes,
    allFeeElements: state.bssFeeSettings.allFeeElements,
  }),
  {
    toggleEventsModal, loadAllFeeElements, createPref, getPrefEventFees,
  }
)
@Form.create()
export default class InspectModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  componentDidMount() {
    this.props.loadAllFeeElements();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.props.getPrefEventFees(nextProps.event);
    }
    if (nextProps.feeCodes !== this.props.feeCodes) {
      this.props.form.setFieldsValue({ fee_codes: nextProps.feeCodes });
    }
  }
  handleCancel = () => {
    this.props.toggleEventsModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.createPref(this.props.event, values.fee_codes).then((result) => {
          if (!result.error) {
            this.handleCancel();
          }
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, form: { getFieldDecorator }, allFeeElements } = this.props;
    const event = CMS_EVENTS.find(item => item.key === this.props.event) &&
     CMS_EVENTS.find(item => item.key === this.props.event).text;
    return (
      <Modal
        maskClosable={false}
        title={this.msg(`${event}费用配置`)}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
      >
        <Form>
          <FormItem label="费用项" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('fee_codes', {
            })(<Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="选择费用项"
            >
              {allFeeElements.map(fee =>
                (<Option key={fee.fee_code} value={fee.fee_code}>
                  {fee.fee_name}
                </Option>))
              }
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
