import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Select, DatePicker, Form, Modal, Input } from 'antd';
import { CMS_DECL_MOD_TYPE } from 'common/constants';
import { toggleDeclModModal, modDecl } from 'common/reducers/cmsCustomsDeclare';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    visible: state.cmsCustomsDeclare.declModModal.visible,
    customs: state.cmsCustomsDeclare.declModModal.customs,
  }),
  { toggleDeclModModal, modDecl }
)
@Form.create()
export default class DeclModModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    reload: PropTypes.func.isRequired,
  }
  handleCancel = () => {
    this.props.toggleDeclModModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((errors, values) => {
      if (!errors) {
        this.props.modDecl(
          this.props.customs.entryId,
          values.revise_type,
          values.revise_datetime,
        ).then((result) => {
          if (!result.error) {
            this.props.reload();
            this.handleCancel();
          }
        });
      }
    });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { visible, customs, form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        maskClosable={false}
        title={this.msg('declMod')}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <FormItem label="海关编号" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} >
            {getFieldDecorator('entry_id', {
              initialValue: customs.entryId,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label="修撤业务类型" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('revise_type', {
              initialValue: Number(customs.reviseType),
              rules: [{ required: true, message: '业务类型必选' }],
            })(<Select
              allowClear
              style={{ width: '100%' }}
            >
              {CMS_DECL_MOD_TYPE.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.text}
                </Option>))}
            </Select>)}
          </FormItem>
          <FormItem label="操作日期" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
            {getFieldDecorator('revise_datetime', {
              initialValue: moment(customs.reviseDatetime),
            })(<DatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
