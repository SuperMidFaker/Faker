import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Select, Form, message } from 'antd';
import { delgDispSave, setDispStatus, loadciqSups, reloadDelegationList } from 'common/reducers/cmsDelegation';
import { loadBasicInfo, loadCustPanel, loadDeclCiqPanel } from 'common/reducers/cmsDelegationDock';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from './message.i18n';

const { Option } = Select;
const FormItem = Form.Item;

function getFieldInits(delgDisp, dispatch) {
  const init = {};
  init.customs_name = '';
  if (dispatch.customs_name !== dispatch.recv_name) {
    init.customs_name = dispatch.customs_name;
  }
  return init;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    delgDisp: state.cmsDelegation.assign.delgDisp,
    dispatch: state.cmsDelegation.assign.dispatch,
    partners: state.cmsDelegation.assign.partners,
    delgDispShow: state.cmsDelegation.assign.delgDispShow,
    fieldInits: getFieldInits(
      state.cmsDelegation.assign.delgDisp,
      state.cmsDelegation.assign.dispatch
    ),
  }),
  {
    delgDispSave,
    setDispStatus,
    loadciqSups,
    loadBasicInfo,
    loadCustPanel,
    loadDeclCiqPanel,
    reloadDelegationList,
  }
)
@Form.create()
export default class DelgDispModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    delgDisp: PropTypes.shape({ customs_name: PropTypes.string }).isRequired,
    partners: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })).isRequired,
    form: PropTypes.shape({ getFieldsValue: PropTypes.func.isRequired }).isRequired,
    delgDispSave: PropTypes.func.isRequired,
    delgDispShow: PropTypes.bool.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    const {
      delgDisp, dispatch, partners, loginId, loginName,
    } = this.props;
    const recv = this.props.form.getFieldsValue();
    const appointedOption = recv.appointed_option || delgDisp.appointed_option;
    let partner = {};
    const pts = partners.filter(pt => pt.partner_id === recv.customs_name);
    if (pts.length === 1) {
      [partner] = pts;
    }
    const ciqSup = {};
    const delegation = { ...delgDisp, appointed_option: appointedOption };
    this.props.delgDispSave(
      delegation, dispatch, partner, ciqSup, loginId,
      loginName
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.setDispStatus({ delgDispShow: false });
        this.props.form.resetFields();
        this.props.reloadDelegationList();
      }
    });
  }
  handleCancel = () => {
    this.props.setDispStatus({ delgDispShow: false });
    this.props.form.resetFields();
  }
  render() {
    const {
      form: { getFieldDecorator }, partners, delgDispShow, fieldInits,
    } = this.props;
    return (
      <Modal maskClosable={false} visible={delgDispShow} title="分配" onOk={this.handleSave} onCancel={this.handleCancel} >
        <Form layout="vertical">
          <FormItem label="报关行">
            {getFieldDecorator('customs_name', { initialValue: fieldInits.customs_name })(<Select
              showSearch
              showArrow
              optionFilterProp="searched"
              placeholder={this.msg('dispatchMessage')}
            >
              {
                partners.map(pt => (
                  <Option
                    searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id}
                    key={pt.partner_id}
                  >
                    {pt.name}
                  </Option>))
              }
            </Select>)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
