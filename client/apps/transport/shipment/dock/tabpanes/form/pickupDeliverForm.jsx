import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, DatePicker, message, Button, Alert, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { savePickOrDeliverDate, reportLoc } from 'common/reducers/trackingLandStatus';
import { TRACKING_POINT_FROM_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../../../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantName: state.account.tenantName,
    dispId: state.shipment.previewer.dispatch.id,
    shipmtNo: state.shipment.previewer.shipmt.shipmt_no,
    parentNo: state.shipment.previewer.shipmt.parent_no || '',
  }),
  { savePickOrDeliverDate, reportLoc }
)
@Form.create()
export default class PickupDeliverForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    parentNo: PropTypes.string.isRequired,
    estDate: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    savePickOrDeliverDate: PropTypes.func.isRequired,
    reportLoc: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
  }
  state = {
    warningMessage: '',
  }

  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleSubmit = () => {
    const {
      form, type, shipmtNo, parentNo, dispId, loginId, loginName, tenantId, tenantName, location,
    } = this.props;
    const { actDate } = form.getFieldsValue();
    if (actDate) {
      this.props.savePickOrDeliverDate({
        type, shipmtNo, dispId, actDate: actDate.toString(), loginId, tenantId, loginName, tenantName,
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          // 上报位置
          location.location_time = actDate.toString();
          location.from = TRACKING_POINT_FROM_TYPE.manual;
          this.props.reportLoc(tenantId, shipmtNo, parentNo, dispId, location);
          form.resetFields();
        }
      });
    } else {
      message.warn('请选择日期');
    }
  }
  handleDateChange = (date) => {
    if (date) {
      const daysDiff = date.diff(new Date(this.props.estDate), 'days');
      if (daysDiff <= -3 || daysDiff >= 3) {
        this.setState({ warningMessage: `所选时间和预计时间${moment(this.props.estDate).format('YYYY.MM.DD')}相差较大， 请注意是否选错日期！` });
      } else {
        this.setState({ warningMessage: '' });
      }
    } else {
      this.setState({ warningMessage: '' });
    }
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { warningMessage } = this.state;
    return (
      <Form layout="vertical">
        <Alert message={warningMessage} type="warning" showIcon style={{ display: warningMessage === '' ? 'none' : '' }} />
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="实际时间">
              {getFieldDecorator('actDate', {
                rules: [{
                  type: 'object',
                }],
              })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={this.handleDateChange} style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" onClick={this.handleSubmit}>提交</Button>
      </Form>
    );
  }
}
