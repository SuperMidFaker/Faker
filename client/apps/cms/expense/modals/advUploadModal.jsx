import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Select, Modal, Radio, Checkbox, Upload, Button, Icon, Row, Col, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { advExpImport } from 'common/reducers/cmsExpense';

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
    partners: state.cmsExpense.partners,
  }),
  { advExpImport }
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
    const params = {
      ...fieldsValue,
      importMode: this.state.importMode,
      tenantId: this.props.tenantId,
      file: this.state.attachments[0],
    };
    this.props.advExpImport(params).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.toggle();
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
            {getFieldDecorator('partnerId')(
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
          <Row>
            <Col offset={6}>
              <FormItem>
                {getFieldDecorator('calculateAll', { initialValue: false })(
                  <Checkbox>同时计算付款方应收代垫费用</Checkbox>
                )}
              </FormItem>
            </Col>
          </Row>
        </div>
      );
    } else {
      return (
        <div>
          <FormItem label={this.msg('recipient')} {...formItemLayout} >
            {getFieldDecorator('partnerId')(
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
          <Row>
            <Col offset={6}>
              <FormItem>
                {getFieldDecorator('calculateAll', { initialValue: false })(
                  <Checkbox>同时计算收款方应收代垫费用</Checkbox>
                )}
              </FormItem>
            </Col>
          </Row>
        </div>
      );
    }
  }
  render() {
    const { visible } = this.props;
    const footer = [
      <Button key="cancel" type="ghost" size="large" onClick={this.handleCancel} style={{ marginRight: 10 }}>取消</Button>,
      <Button key="next" type="primary" size="large" onClick={this.handleOk} disabled={this.state.attachments.length === 0}>确定</Button>,
    ];
    return (
      <Modal visible={visible} title="上传代垫" footer={footer} onCancel={this.handleCancel} >
        <Form>
          <FormItem label={this.msg('importMode')} {...formItemLayout} >
            <RadioGroup onChange={this.handleRadioChange} value={this.state.importMode}>
              <Radio value="recpt">按应收</Radio>
              <Radio value="pay">按应付</Radio>
            </RadioGroup>
          </FormItem>
          {this.renderForm()}
        </Form>
        <Upload accept=".xls,.xlsx" onChange={this.handleImport} onRemove={this.handleRemove}
          fileList={this.state.attachments} action={`${API_ROOTS.default}v1/upload/excel/`} withCredentials
        >
          <Button type="ghost">
            <Icon type="upload" /> 导入数据
          </Button>
        </Upload>
      </Modal>
    );
  }
}
