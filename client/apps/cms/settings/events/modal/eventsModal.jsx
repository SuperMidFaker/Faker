import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { toggleEventsModal, createPref, getPref } from 'common/reducers/cmsEvents';
import { loadAllFeeElements } from 'common/reducers/bssFeeSettings';
import { Form, Modal, Select } from 'antd';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    visible: state.cmsEvents.eventsModal.visible,
    event: state.cmsEvents.eventsModal.event,
    allFeeElements: state.bssFeeSettings.allFeeElements,
  }),
  {
    toggleEventsModal, loadAllFeeElements, createPref, getPref,
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
      this.props.getPref(nextProps.event).then((result) => {
        if (!result.error) {
          const data = result.data.map(item => item.fee_code);
          this.props.form.setFieldsValue({ fee_codes: data });
        }
      });
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
    return (
      <Modal
        maskClosable={false}
        title={this.msg('查验')}
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
              placeholder="Please select"
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
