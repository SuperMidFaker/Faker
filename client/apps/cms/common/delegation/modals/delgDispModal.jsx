import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Select, Form, Popconfirm, message, Switch, Radio } from 'antd';
import { clearingOption } from 'common/constants';
import { delgDispSave, delDisp, setSavedStatus, setDispStatus, loadPartners, showDispModal } from 'common/reducers/cmsDelegation';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

const Option = Select.Option;
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
function ButtonSelect(props) {
  const { saved, onconfirm, onclick } = props;
  let button = '';
  if (saved) {
    button = (
      <Popconfirm title="你确定撤回分配吗?" onConfirm={onconfirm} >
        <Button size="large">撤销</Button>
      </Popconfirm>
      );
  } else {
    button = (
      <Button size="large" type="primary" onClick={onclick}>
          分配
      </Button>
      );
  }
  return (
    button
  );
}
ButtonSelect.PropTypes = {
  saved: PropTypes.bool.isRequired,
  onconfirm: PropTypes.func,
  onclick: PropTypes.func,
};

function getFieldInits(delgDisp, dispatch) {
  const init = {};
  init.appointed = false;
  init.customs_name = dispatch.customs_name;
  init.appointed_option = 1;
  if (delgDisp.appointed_option > 0) {
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
    assign: state.cmsDelegation.assign,
    delgDisp: state.cmsDelegation.assign.delgDisp,
    dispatch: state.cmsDelegation.assign.dispatch,
    partners: state.cmsDelegation.assign.partners,
    ciqSups: state.cmsDelegation.assign.ciqSups,
    saved: state.cmsDelegation.assign.saved,
    delgDispShow: state.cmsDelegation.assign.delgDispShow,
    fieldInits: getFieldInits(state.cmsDelegation.assign.delgDisp, state.cmsDelegation.assign.dispatch),
  }),
  { delgDispSave, delDisp, setSavedStatus, setDispStatus, loadPartners, showDispModal }
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
    saved: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    delgDispSave: PropTypes.func.isRequired,
    delDisp: PropTypes.func.isRequired,
    setSavedStatus: PropTypes.func.isRequired,
    delgDispShow: PropTypes.bool.isRequired,
  }
  state = {
    appointed: false,
  }
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.delgNo !== this.props.delgNo) {
  //     this.props.showDispModal(nextProps.delgNo, this.props.tenantId);
  //   }
  // }
  msg = key => formatMsg(this.props.intl, key);
  handleConfirm = () => {
    const { delgDisp, dispatch, tenantId } = this.props;
    this.props.delDisp(delgDisp, dispatch, tenantId
    ).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          this.props.setSavedStatus({ saved: false });
          this.props.setDispStatus({ delgDispShow: false });
        }
      }
    );
  }
  handleSave = () => {
    const { delgDisp, dispatch, partners, ciqSups } = this.props;
    const recv = this.props.form.getFieldsValue();
    let partner = {};
    const pts = partners.filter(pt => pt.partner_id === recv.customs_name);
    if (pts.length === 1) {
      partner = pts[0];
    }
    let ciqSup = {};
    if (this.state.appointed) {
      const sup = ciqSups.filter(pt => pt.partner_id === recv.ciq_name);
      if (pts.length === 1) {
        ciqSup = sup[0];
      }
    }
    const delegation = { ...delgDisp, ...{ appointed_option: recv.appointed_option } };
    this.props.delgDispSave(delegation, dispatch, partner, ciqSup
    ).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.props.setSavedStatus({ saved: true });
        this.props.setDispStatus({ delgDispShow: false });
      }
    });
  }
  handleCancel = () => {
    this.props.setDispStatus({ delgDispShow: false });
  }
  handleOnChange = (checked) => {
    if (checked) {
      const recv = this.props.form.getFieldsValue();
      let delgSup = {};
      const pts = this.props.partners.filter(pt => pt.partner_id === recv.customs_name);
      if (pts.length === 1) {
        delgSup = pts[0];
      }
      this.props.loadPartners(this.props.tenantId, 'CIB', delgSup).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
    }
    this.setState({ appointed: checked });
  }
  render() {
    const { form: { getFieldDecorator }, partners, ciqSups, delgDispShow, saved, fieldInits } = this.props;
    const { appointed } = this.state;
    const footer = (
      <div>
        <Button type="ghost" onClick={this.handleCancel} style={{ marginRight: 10 }}>取消</Button>
        <ButtonSelect saved={saved} onconfirm={this.handleConfirm} onclick={this.handleSave} />
      </div>
    );
    let appointLabel = '';
    if (fieldInits.appointed) {
      appointLabel = '指定报检供应商';
    } else {
      appointLabel = appointed ? '指定报检供应商' : '不指定报检供应商';
    }
    return (
      <Modal visible={delgDispShow} title="分配" footer={footer} >
        <Form vertical>
          <FormItem label="供应商" {...formItemLayout}>
            {getFieldDecorator('customs_name', { initialValue: fieldInits.customs_name }
              )(<Select
                showSearch
                showArrow
                optionFilterProp="searched"
                placeholder={this.msg('dispatchMessage')}
                style={{ width: '80%' }}
              >
                {
                partners.map(pt => (
                  <Option searched={`${pt.partner_code}${pt.name}`}
                    value={pt.partner_id} key={pt.partner_id}
                  >
                    {pt.name}
                  </Option>)
                )
              }
              </Select>)}
          </FormItem>
          <FormItem label={appointLabel} {...formItemLayout} >
            <Switch defaultChecked={fieldInits.appointed} onChange={this.handleOnChange} disabled={fieldInits.appointed} />
          </FormItem>
          {(appointed || fieldInits.appointed) &&
            <FormItem label="报检商结算对象" {...formItemLayout}>
              {getFieldDecorator('appointed_option', { initialValue: fieldInits.appointed_option })(<RadioGroup>
                <RadioButton value={clearingOption.clearSup.key}>{clearingOption.clearSup.value}</RadioButton>
                <RadioButton value={clearingOption.clearAppoint.key}>{clearingOption.clearAppoint.value}</RadioButton>
              </RadioGroup>)}
            </FormItem>
          }
          {(appointed || fieldInits.appointed) &&
            <FormItem label="报检供应商" {...formItemLayout} >
              {getFieldDecorator('ciq_name', { initialValue: fieldInits.ciq_name }
                )(<Select
                  showSearch
                  showArrow
                  optionFilterProp="searched"
                  placeholder={this.msg('dispatchMessage')}
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
          }
        </Form>
      </Modal>
    );
  }
}
