import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Input, Row, Button } from 'antd';
import { createException } from 'common/reducers/trackingLandException';
import '../../../index.less';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    shipmtNo: state.shipment.previewer.dispatch.shipmt_no,
    dispId: state.shipment.previewer.dispatch.id,
  }),
  { createException }
)
@Form.create()
export default class CreateMessagePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    createException: PropTypes.func.isRequired,
  }
  handleOk = () => {
    message.warn('此功能开发中');
    // const { form, dispId, loginName } = this.props;
    // const fieldsValue = form.getFieldsValue();
    // if (fieldsValue && fieldsValue.type && fieldsValue.type[1]) {
    //   this.props.form.setFieldsValue({ type: '', excp_event: '' });
    //   const type = fieldsValue.type[1];
    //   let excpLevel = '';
    //   let typeName = '';
    //   this.props.createException({
    //     dispId,
    //     excpLevel,
    //     type,
    //     typeName,
    //     excpEvent: fieldsValue.excp_event,
    //     submitter: loginName,
    //   }).then((result) => {
    //     if (result.error) {
    //       message.error(result.error);
    //     } else {
    //       message.info('添加成功');
    //     }
    //   });
    // } else {
    //   message.error('请选择异常类型');
    // }
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form className="row" style={{ width: '100%' }}>
        <Row >
          {getFieldDecorator('message', {
            initialValue: '',
          })(
            <Input type="textarea" id="control-textarea" rows="5" placeholder="" />
          )}
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Button htmlType="submit" onClick={this.handleOk}>提交</Button>
        </Row>
      </Form>
    );
  }
}
