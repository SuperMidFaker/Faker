import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Modal, DatePicker, message } from 'antd';
import RegionCascade from 'client/components/region-cascade';
import InputItem from '../../../shipment/forms/input-item';
import { closeLocModal, reportLoc } from 'common/reducers/trackingLandStatus';
import { TRACKING_POINT_FROM_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const FormItem = Form.Item;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@injectIntl
@connect(
  state => ({
    visible: state.trackingLandStatus.locModal.visible,
    tenantId: state.account.tenantId,
    transit: state.trackingLandStatus.locModal.transit,
  }),
  { closeLocModal, reportLoc }
)
@Form.create()
export default class LocationUpdater extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    transit: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onOK: PropTypes.func,
    closeLocModal: PropTypes.func.isRequired,
    reportLoc: PropTypes.func.isRequired,
  }
  state = {
    province: '',
    city: '',
    district: '',
  }
  setRegionValue = (field, value) => {
    this.setState({ [field]: value });
  }
  disabledDateRange = (current) => {
    return current && (new Date(this.props.transit.pickup_act_date).getTime() - current.getTime() > ONE_DAY_MS
      || Date.now() - current.getTime() > ONE_DAY_MS || Date.now() < current.getTime());
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleCancel = () => {
    this.props.closeLocModal();
  }
  handleOk = () => {
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { province, city, district } = this.state;
        const { tenantId, transit } = this.props;
        const { location_time, address } = this.props.form.getFieldsValue();
        this.props.reportLoc(
          tenantId, transit.shipmt_no, transit.parent_no,
          {
            province, city, district,
            location_time, address,
            from: TRACKING_POINT_FROM_TYPE.manual,
          }).then(result => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              this.props.closeLocModal();
              this.props.onOK();
            }
          });
      }
    });
  }
  render() {
    const { form: { getFieldProps }, intl } = this.props;
    return (
      <Modal title={this.msg('reportTransitLoc')} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form form={this.props.form} horizontal>
          <FormItem labelCol={{ span: 6 }} label={this.msg('reportTime')}
            wrapperCol={{ span: 18 }} required
          >
            <DatePicker showTime format="yyyy-MM-dd HH:mm:ss"
              {...getFieldProps('location_time', {
                rules: [{
                  type: 'date',
                  required: true, message: this.msg('reportTimeMust'),
                }],
              })} disabledDate={this.disabledDateRange}
            />
          </FormItem>
          <FormItem labelCol={{ span: 6 }} label={this.msg('reportPosition')}
            wrapperCol={{ span: 18 }}
          >
            <RegionCascade intl={intl} setFormValue={this.setRegionValue} />
          </FormItem>
          <InputItem colSpan={6} labelName={this.msg('reportLocAddr')}
            formhoc={this.props.form} field="address"
          />
        </Form>
      </Modal>
    );
  }
}
