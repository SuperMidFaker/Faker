import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, message, Cascader, Input, Row, Button } from 'antd';
import { createException } from 'common/reducers/trackingLandException';
import { TRANSPORT_EXCEPTIONS } from 'common/constants';
import '../../../index.less';

@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
    loginName: state.account.username,
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    shipmtNo: state.shipment.previewer.dispatch.shipmt_no,
    dispId: state.shipment.previewer.dispatch.id,
  }),
  { createException }
)
@Form.create()
export default class CreateExceptionPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    tenantName: PropTypes.string.isRequired,
    dispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    createException: PropTypes.func.isRequired,
  }
  handleOk = () => {
    const { form, dispId, loginName } = this.props;
    const fieldsValue = form.getFieldsValue();
    if (fieldsValue && fieldsValue.type && fieldsValue.type[1]) {
      this.props.form.setFieldsValue({ type: '', excp_event: '' });
      const type = fieldsValue.type[1];
      let excpLevel = '';
      let typeName = '';
      for (let i = 0; i < TRANSPORT_EXCEPTIONS.length; i++) {
        if (TRANSPORT_EXCEPTIONS[i].code === type) {
          excpLevel = TRANSPORT_EXCEPTIONS[i].level;
          typeName = TRANSPORT_EXCEPTIONS[i].name;
          break;
        }
      }
      this.props.createException({
        dispId,
        excpLevel,
        type,
        typeName,
        excpEvent: fieldsValue.excp_event,
        submitter: loginName,
      }).then((result) => {
        if (result.error) {
          message.error(result.error);
        } else {
          message.info('添加成功');
        }
      });
    } else {
      message.error('请选择异常类型');
    }
  }
  render() {
    const { form: { getFieldDecorator } } = this.props;
    const options = [];
    for (let i = 0; i < TRANSPORT_EXCEPTIONS.length; i++) {
      if (TRANSPORT_EXCEPTIONS[i].key.indexOf('_SYS_') < 0 && TRANSPORT_EXCEPTIONS[i].key !== 'SHIPMENT_EXCEPTION_SPECIAL_COST') {
        if (options.length === 0) {
          options.push({
            value: TRANSPORT_EXCEPTIONS[i].code,
            label: TRANSPORT_EXCEPTIONS[i].category,
            children: [{
              value: TRANSPORT_EXCEPTIONS[i].code,
              label: TRANSPORT_EXCEPTIONS[i].name,
            }],
          });
        } else {
          let flag = false;
          for (let j = 0; j < options.length; j++) {
            if (options[j].label === TRANSPORT_EXCEPTIONS[i].category) {
              options[j].children.push({
                value: TRANSPORT_EXCEPTIONS[i].code,
                label: TRANSPORT_EXCEPTIONS[i].name,
              });
              flag = true;
              break;
            }
          }
          if (flag === false) {
            options.push({
              value: TRANSPORT_EXCEPTIONS[i].code,
              label: TRANSPORT_EXCEPTIONS[i].category,
              children: [{
                value: TRANSPORT_EXCEPTIONS[i].code,
                label: TRANSPORT_EXCEPTIONS[i].name,
              }],
            });
          }
        }
      }
    }
    return (
      <Form className="row" style={{ width: '100%' }}>
        <Row>
          {getFieldDecorator('type', {
          })(<Cascader options={options} placeholder="请选择异常类型" />)}
        </Row>
        <Row style={{ marginTop: 20 }}>
          {getFieldDecorator('excp_event', {
            initialValue: '',
          })(
            <Input type="textarea" id="control-textarea" rows="5" placeholder="请输入对异常的描述" />
          )}
        </Row>
        <Row style={{ marginTop: 20 }}>
          <Button htmlType="submit" onClick={this.handleOk}>提交</Button>
        </Row>
      </Form>
    );
  }
}
