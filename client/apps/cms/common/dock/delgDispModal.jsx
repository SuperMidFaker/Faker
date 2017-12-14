import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, Modal, Select, Form, message, Switch, Radio } from 'antd';
import { clearingOption } from 'common/constants';
import { delgDispSave, setDispStatus, loadciqSups, reloadDelegationList } from 'common/reducers/cmsDelegation';
import { loadBasicInfo, loadCustPanel, loadDeclCiqPanel } from 'common/reducers/cmsDelgInfoHub';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);
const Option = Select.Option;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function getFieldInits(delgDisp, dispatch) {
  const init = {};
  init.appointed = false;
  init.customs_name = '';
  init.appointed_option = 1;
  if (dispatch.customs_name !== dispatch.recv_name) {
    init.customs_name = dispatch.customs_name;
  }
  if (delgDisp.appointed_option > 0 && delgDisp.appointed_option < 3) {
    init.ciq_name = delgDisp.appointed_ciq_name;
    init.appointed = true;
    init.appointed_option = delgDisp.appointed_option;
  }
  return init;
}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    assign: state.cmsDelegation.assign,
    delgDisp: state.cmsDelegation.assign.delgDisp,
    dispatch: state.cmsDelegation.assign.dispatch,
    partners: state.cmsDelegation.assign.partners,
    ciqSups: state.cmsDelegation.assign.ciqSups,
    delgDispShow: state.cmsDelegation.assign.delgDispShow,
    previewer: state.cmsDelgInfoHub.previewer,
    tabKey: state.cmsDelgInfoHub.tabKey,
    fieldInits: getFieldInits(state.cmsDelegation.assign.delgDisp, state.cmsDelegation.assign.dispatch),
  }),
  {
    delgDispSave, setDispStatus, loadciqSups, loadBasicInfo, loadCustPanel, loadDeclCiqPanel, reloadDelegationList,
  }
)
@Form.create()
export default class DelgDispModal extends Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    assign: PropTypes.object.isRequired,
    delgDisp: PropTypes.object.isRequired,
    dispatch: PropTypes.object.isRequired,
    partners: PropTypes.array.isRequired,
    ciqSups: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    delgDispSave: PropTypes.func.isRequired,
    delgDispShow: PropTypes.bool.isRequired,
    tabKey: PropTypes.string,
    previewer: PropTypes.object,
  }
  state = {
    appoint: false,
    ciqSups: [],
  }
  msg = key => formatMsg(this.props.intl, key);
  handleSave = () => {
    const {
      delgDisp, dispatch, partners, ciqSups, loginId, loginName,
    } = this.props;
    const recv = this.props.form.getFieldsValue();
    const appointedOption = recv.appointed_option || delgDisp.appointed_option;
    let partner = {};
    const pts = partners.filter(pt => pt.partner_id === recv.customs_name);
    if (pts.length === 1) {
      partner = pts[0];
    }
    let ciqSup = {};
    if (this.state.appoint) {
      const sup = ciqSups.filter(pt => pt.partner_id === recv.ciq_name);
      if (sup.length === 1) {
        ciqSup = sup[0];
      }
    }
    const delegation = { ...delgDisp, appointed_option: appointedOption };
    this.props.delgDispSave(delegation, dispatch, partner, ciqSup, loginId, loginName).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.setDispStatus({ delgDispShow: false });
        this.props.form.resetFields();
        this.handleOnChange(this.props.fieldInits.appointed);
        this.props.reloadDelegationList();
        if (this.props.previewer.visible) {
          this.props.loadBasicInfo(this.props.tenantId, dispatch.delg_no, this.props.tabKey);
          if (this.props.tabKey === 'customsDecl') {
            this.props.loadCustPanel({
              delgNo: dispatch.delg_no,
              tenantId: this.props.tenantId,
            });
          } else if (this.props.tabKey === 'ciqDecl') {
            this.props.loadDeclCiqPanel(dispatch.delg_no, this.props.tenantId);
          }
        }
      }
    });
  }
  handleCancel = () => {
    this.props.setDispStatus({ delgDispShow: false });
    this.props.form.resetFields();
    this.handleOnChange(this.props.fieldInits.appointed);
  }
  handleOnChange = (checked) => {
    this.setState({ appoint: checked });
  }
  handleSelectChange = (value) => {
    const sups = this.props.ciqSups.filter(sup => sup.partner_id !== value);
    this.setState({ ciqSups: sups });
  }
  render() {
    const {
      form: { getFieldDecorator }, partners, delgDisp, delgDispShow, fieldInits,
    } = this.props;
    const { appoint, ciqSups } = this.state;
    return (
      <Modal maskClosable={false} visible={delgDispShow} title="分配" onOk={this.handleSave} onCancel={this.handleCancel} >
        <Form layout="vertical">
          <FormItem label="报关代理">
            {getFieldDecorator('customs_name', { initialValue: fieldInits.customs_name })(<Select
              showSearch
              showArrow
              optionFilterProp="searched"
              placeholder={this.msg('dispatchMessage')}
              onChange={this.handleSelectChange}
            >
              {
                partners.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >
                    {pt.name}
                  </Option>))
              }
            </Select>)}
          </FormItem>
          <FormItem label="报检供应商" >
            <Col span={6}>
              <Switch checked={appoint} onChange={this.handleOnChange} checkedChildren="指定" unCheckedChildren="不指定"
                disabled={fieldInits.appointed || delgDisp.appointed_option === 3}
              />
            </Col>
            <Col span={18}>
              {(appoint || fieldInits.appointed) && getFieldDecorator('ciq_name', { initialValue: fieldInits.ciq_name })(<Select showSearch showArrow optionFilterProp="searched"
                placeholder={this.msg('dispatchMessage')}
              >
                {
                  ciqSups.map(pt => (
                    <Option searched={`${pt.partner_code}${pt.name}`}
                      value={pt.partner_id} key={pt.partner_id}
                    >
                      {pt.name}
                    </Option>))
                }
              </Select>)}
            </Col>
          </FormItem>

          {(appoint || fieldInits.appointed) &&
            <FormItem label="报检商结算对象">
              {getFieldDecorator('appointed_option', { initialValue: fieldInits.appointed_option })(<RadioGroup>
                <RadioButton value={clearingOption.clearSup.key}>{clearingOption.clearSup.value}</RadioButton>
                <RadioButton value={clearingOption.clearAppoint.key}>{clearingOption.clearAppoint.value}</RadioButton>
              </RadioGroup>)}
            </FormItem>
          }
        </Form>
      </Modal>
    );
  }
}
