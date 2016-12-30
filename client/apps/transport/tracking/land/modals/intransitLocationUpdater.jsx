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
    region_code: '',
    province: '',
    city: '',
    district: '',
    street: '',
  }
  handleRegionChange = (values) => {
    const [code, province, city, district, street] = values;
    this.setState({
      region_code: code,
      province,
      city,
      district,
      street,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleCancel = () => {
    this.props.closeLocModal();
  }
  handleOk = () => {
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { province, city, district } = this.state;
        const { tenantId, transit } = this.props;
        const { location_time, address } = this.props.form.getFieldsValue();
        this.props.reportLoc(
          tenantId, transit.shipmt_no, transit.parent_no, transit.disp_id,
          {
            province, city, district,
            location_time, address,
            from: TRACKING_POINT_FROM_TYPE.manual,
          }).then((result) => {
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
    const { form: { getFieldDecorator }, transit } = this.props;
    return (
      <Modal title={`${this.msg('reportTransitLoc')} ${transit.shipmt_no}`} onCancel={this.handleCancel}
        onOk={this.handleOk} visible={this.props.visible}
      >
        <Form horizontal>
          <FormItem labelCol={{ span: 6 }} label={this.msg('reportTime')}
            wrapperCol={{ span: 18 }} required
          >
            {getFieldDecorator('location_time', {
              rules: [{
                type: 'object',
                required: true, message: this.msg('reportTimeMust'),
              }],
            })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
          </FormItem>
          <FormItem labelCol={{ span: 6 }} label={this.msg('reportPosition')}
            wrapperCol={{ span: 18 }}
          >
            <RegionCascade onChange={this.handleRegionChange} />
          </FormItem>
          <InputItem colSpan={6} labelName={this.msg('reportLocAddr')}
            formhoc={this.props.form} field="address"
          />
        </Form>
      </Modal>
    );
  }
}
