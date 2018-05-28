import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Row, Col, Button, DatePicker } from 'antd';
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
export default class RouteForm extends React.Component {
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
  handleSubmit = () => {
    const {
      dispId, shipmtNo, parentNo, tenantId,
    } = this.props;
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
        }
      ).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          this.handleClear();
        }
      });
    }
  }
  handleClear = () => {
    this.props.form.resetFields();
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
    const {
      province, city, district, street,
    } = this.state;
    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="上报时间">
              {getFieldDecorator('locationTime', {
                initialValue: moment(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                rules: [{
                  type: 'object',
                  required: true,
                  message: '请选择时间',
                }],
              })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="上报位置">
              <RegionCascader region={[province, city, district, street]} onChange={this.handleRegionChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="备注">
              {getFieldDecorator('address', {
                rules: [{
                  type: 'string',
                  message: '请填写详细地址',
                }],
              })(<Input placeholder="请填写详细地址" />)}
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" onClick={this.handleSubmit}>提交</Button>
      </Form>
    );
  }
}
