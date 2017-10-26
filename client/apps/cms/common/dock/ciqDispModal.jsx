import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Select, Form, message } from 'antd';
import { ciqDispSave, setDispStatus } from 'common/reducers/cmsDelegation';
import { showPreviewer, loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

const Option = Select.Option;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    ciqSups: state.cmsDelegation.assign.ciqSups,
    ciqDispShow: state.cmsDelegation.assign.ciqDispShow,
    dispatch: state.cmsDelgInfoHub.previewer.delgDispatch,
    tabKey: state.cmsDelgInfoHub.tabKey,
  }),
  { ciqDispSave, setDispStatus, showPreviewer, loadDeclCiqPanel }
)
@Form.create()
export default class CiqDispModal extends Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    ciqSups: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    ciqDispShow: PropTypes.bool.isRequired,
    dispatch: PropTypes.object.isRequired,
    tabKey: PropTypes.string,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    const { dispatch, ciqSups } = this.props;
    const recv = this.props.form.getFieldsValue();
    let ciqSup = {};
    const sup = ciqSups.filter(pt => pt.partner_id === recv.ciq_name);
    if (sup.length === 1) {
      ciqSup = sup[0];
    }
    this.props.ciqDispSave(dispatch, ciqSup).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.setDispStatus({ ciqDispShow: false });
        this.props.showPreviewer(dispatch.delg_no, this.props.tabKey);
        this.props.loadDeclCiqPanel(dispatch.delg_no, this.props.tenantId);
      }
    });
  }
  handleCancel = () => {
    this.props.setDispStatus({ ciqDispShow: false });
  }
  render() {
    const { form: { getFieldDecorator }, ciqSups, ciqDispShow } = this.props;
    return (
      <Modal maskClosable={false} visible={ciqDispShow} title="报检分配" onOk={this.handleSave} onCancel={this.handleCancel} >
        <Form layout="vertical">
          <FormItem label="报检供应商" {...formItemLayout} >
            {getFieldDecorator('ciq_name',
              )(<Select
                showSearch
                showArrow
                optionFilterProp="searched"
                placeholder={this.msg('ciqDispMessage')}
                style={{ width: '80%' }}
              >
                {
                ciqSups.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >
                    {pt.name}
                  </Option>)
                )
              }
              </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
