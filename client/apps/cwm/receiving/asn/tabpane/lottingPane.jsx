/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, Col, Row, DatePicker, Input } from 'antd';
import { loadLotInfo } from 'common/reducers/cwmReceive';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
@connect(
  () => ({
  }),
  { loadLotInfo }
)
export default class LottingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
    asnNo: PropTypes.string.isRequired,
  }
  state = {
    lotInfo: {},
  }
  componentWillMount() {
    this.props.loadLotInfo(this.props.asnNo).then((result) => {
      this.setState({
        lotInfo: result.data || {},
      });
    });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { lotInfo } = this.state;
    return (
      <div style={{ padding: 24 }}>
        <Row gutter={16}>
          <Col lg={6} md={12} sm={24}>
            <FormItem label="外部批次">
              {getFieldDecorator('external_lot_no', {
                initialValue: lotInfo.external_lot_no,
              })(
                <Input />
                )}
            </FormItem>
          </Col>
          <Col xl={{ span: 6, offset: 2 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
            <FormItem label="扩展属性1">
              {getFieldDecorator('attrib_1_string', {
                initialValue: lotInfo.attrib_1_string,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
            <FormItem label="扩展属性2">
              {getFieldDecorator('attrib_2_string', {
                initialValue: lotInfo.attrib_2_string,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xl={{ span: 6, offset: 8 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
            <FormItem label="扩展属性3">
              {getFieldDecorator('attrib_3_string', {
                initialValue: lotInfo.attrib_3_string,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
            <FormItem label="扩展属性4">
              {getFieldDecorator('attrib_4_string', {
                initialValue: lotInfo.attrib_4_string,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xl={{ span: 6, offset: 8 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
            <FormItem label="扩展属性5">
              {getFieldDecorator('attrib_5_string', {
                initialValue: lotInfo.attrib_5_string,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
            <FormItem label="扩展属性6">
              {getFieldDecorator('attrib_6_string', {
                initialValue: lotInfo.attrib_6_string,
              })(
                <Input />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xl={{ span: 6, offset: 8 }} lg={{ span: 8 }} md={{ span: 12 }} sm={24}>
            <FormItem label="扩展属性7">
              {getFieldDecorator('attrib_7_date', {
                initialValue: lotInfo.attrib_7_date && moment(lotInfo.attrib_7_date),
              })(
                <DatePicker />
              )}
            </FormItem>
          </Col>
          <Col xl={{ span: 8, offset: 2 }} lg={{ span: 10 }} md={{ span: 24 }} sm={24}>
            <FormItem label="扩展属性8">
              {getFieldDecorator('attrib_8_date', {
                initialValue: lotInfo.attrib_8_date && moment(lotInfo.attrib_8_date),
              })(
                <DatePicker />
              )}
            </FormItem>
          </Col>
        </Row>
      </div>
    );
  }
}
