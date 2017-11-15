import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Select, Modal, Radio, Checkbox, Upload, Button, Col, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { advExpImport, showAdvImpTempModal } from 'common/reducers/cmsExpense';

const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    tenantCode: state.account.code,
    partners: state.cmsExpense.partners,
  }),
  { advExpImport, showAdvImpTempModal }
)
@Form.create()
export default class AdvUploadModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    partners: PropTypes.shape({
      customer: PropTypes.array,
      supplier: PropTypes.array,
    }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    importMode: 'recpt',
    attachments: [],
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleOk = () => {
    const fieldsValue = this.props.form.getFieldsValue();
    let partner = {};
    if (this.state.importMode === 'recpt') {
      partner = this.props.partners.customer.filter(pt => pt.partner_id === fieldsValue.partnerIdPay)[0];
    } else {
      partner = this.props.partners.supplier.filter(pt => pt.partner_id === fieldsValue.partnerIdRec)[0];
    }
    const params = {
      ...fieldsValue,
      partner,
      importMode: this.state.importMode,
      tenantId: this.props.tenantId,
      tenantCode: this.props.tenantCode,
      file: this.state.attachments[0],
    };
    this.props.advExpImport(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggle();
        this.props.showAdvImpTempModal(true);
      }
    });
  }
  handleCancel = () => {
    this.props.toggle();
  }
  handleRadioChange = (ev) => {
    this.setState({ importMode: ev.target.value });
  }
  handleImport = (info) => {
    if (info.file.status === 'removed') {
      return;
    }
    if (info.file.status === 'uploading') {
      this.setState({
        attachments: [...this.state.attachments, info.file],
      });
      return;
    }
    if (info.file.response.status !== 200) {
      message.error(info.file.response.msg);
      return;
    }
    const file = info.file;
    const nextFile = {
      uid: file.uid,
      name: file.name,
      url: file.response.data,
      status: 'done',
    };
    this.setState({
      attachments: [nextFile],
    });
  }
  handleRemove = () => {
    this.setState({ attachments: [] });
  }
  renderForm() {
    const { form: { getFieldDecorator }, partners, tenantId, tenantName } = this.props;
    if (this.state.importMode === 'recpt') {
      return (
        <div>
          <FormItem label={this.msg('recipient')} {...formItemLayout} >
            <Select value={tenantId} style={{ width: '80%' }} disabled>
              <Option value={tenantId}>{tenantName}</Option>
            </Select>
          </FormItem>
          <FormItem label={this.msg('payer')} {...formItemLayout} >
            {getFieldDecorator('partnerIdPay', { rules: [{ required: true }] })(
              <Select
                showSearch
                showArrow
                optionFilterProp="searched"
                style={{ width: '80%' }}
              >
                {partners.customer.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`} value={pt.partner_id} key={pt.partner_id}>
                    {pt.name}
                  </Option>)
                )}
              </Select>
            )}
          </FormItem>
          <Col offset={6}>
            <FormItem>
              {getFieldDecorator('calculateAll', { initialValue: false })(
                <Checkbox>同时计算付款方应收代垫费用</Checkbox>
                )}
            </FormItem>
          </Col>
        </div>
      );
    } else {
      return (
        <div>
          <FormItem label={this.msg('recipient')} {...formItemLayout} >
            {getFieldDecorator('partnerIdRec', { rules: [{ required: true }] })(
              <Select
                showSearch
                showArrow
                optionFilterProp="searched"
                style={{ width: '80%' }}
              >
                {partners.supplier.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`} value={pt.partner_id} key={pt.partner_id}>
                    {pt.name}
                  </Option>)
                )}
              </Select>
            )}
          </FormItem>
          <FormItem label={this.msg('payer')} {...formItemLayout} >
            <Select value={tenantId} style={{ width: '80%' }} disabled>
              <Option value={tenantId}>{tenantName}</Option>
            </Select>
          </FormItem>
          <Col offset={6}>
            <FormItem>
              {getFieldDecorator('calculateAll', { initialValue: false })(
                <Checkbox>同时计算付款方应收代垫费用</Checkbox>
                )}
            </FormItem>
          </Col>
        </div>
      );
    }
  }
  render() {
    const { visible } = this.props;
    const footer = [
      <Button key="cancel" type="ghost" onClick={this.handleCancel} style={{ marginRight: 10 }}>取消</Button>,
      <Button key="next" type="primary" onClick={this.handleOk} disabled={this.state.attachments.length === 0}>确定</Button>,
    ];
    return (
      <Modal maskClosable={false} visible={visible} title="导入代垫费用" footer={footer} onCancel={this.handleCancel} >
        <Form>
          <Col offset={6}>
            <FormItem {...formItemLayout} >
              <RadioGroup onChange={this.handleRadioChange} value={this.state.importMode}>
                <Radio value="recpt">应收代垫费用</Radio>
                <Radio value="pay">应付代垫费用</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          {this.renderForm()}
          <Col offset={6}>
            <FormItem {...formItemLayout} >
              <Upload accept=".xls,.xlsx" onChange={this.handleImport} onRemove={this.handleRemove}
                fileList={this.state.attachments} action={`${API_ROOTS.default}v1/upload/excel/`} withCredentials
              >
                <Button icon="upload">上传</Button>
              </Upload>
            </FormItem>
          </Col>
        </Form>
      </Modal>
    );
  }
}
