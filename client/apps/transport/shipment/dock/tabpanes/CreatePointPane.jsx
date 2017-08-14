import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Row, Button, DatePicker } from 'antd';
import RegionCascader from 'client/components/RegionCascader';

import { TRACKING_POINT_FROM_TYPE } from 'common/constants';
import { reportLoc } from 'common/reducers/trackingLandStatus';
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    shipmtNo: state.shipment.previewer.dispatch.shipmt_no,
    parentNo: state.shipment.previewer.shipmt.parent_no,
    dispId: state.shipment.previewer.dispatch.id,
  }),
  { reportLoc }
)
@Form.create()
export default class CreatePointPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    parentNo: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    reportLoc: PropTypes.func.isRequired,
  }
  state = {
    region_code: '',
    province: '',
    city: '',
    district: '',
    street: '',
  }
  handleOk = () => {
    const { dispId, shipmtNo, parentNo, tenantId } = this.props;
    const { province, city, district } = this.state;
    const { locationTime, address } = this.props.form.getFieldsValue();
    if (!locationTime) {
      message.warn('请选择时间');
    } else {
      this.props.reportLoc(
        tenantId, shipmtNo, parentNo, dispId,
        {
          province,
          city,
          district,
          location_time: locationTime,
          address,
          from: TRACKING_POINT_FROM_TYPE.manual,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.clearForm();
          }
        });
    }
  }
  clearForm = () => {
    this.props.form.setFieldsValue({ locationTime: '', address: '' });
    this.setState({
      region_code: '',
      province: '',
      city: '',
      district: '',
      street: '',
    });
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
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { province, city, district, street } = this.state;
    return (
      <Form className="row" style={{ width: '100%' }}>
        <Row >
          {getFieldDecorator('locationTime', {
            rules: [{
              type: 'object',
              required: true,
              message: '请选择时间',
            }],
          })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />)}
        </Row>
        <Row style={{ marginTop: 20 }}>
          <RegionCascader region={[province, city, district, street]} onChange={this.handleRegionChange} />
        </Row>
        <Row style={{ marginTop: 20 }}>
          {getFieldDecorator('address', {
            rules: [{
              type: 'string',
              message: '请填写详细地址',
            }],
          })(<Input placeholder="请填写详细地址" />)}
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Button onClick={this.handleOk}>提交</Button>
        </Row>
      </Form>
    );
  }
}
