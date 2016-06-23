import React, { PropTypes } from 'react';
import { Form } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from './formInput';
import { RelationAutoCompSelect, PortDate, Transport, TradeRemission, CountryAttr } from './headFormItems';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    type: PropTypes.oneOf([ 'bill', 'entry' ]),
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { form, readonly, formData, formRequire, ietype, intl } = this.props;
    const formProps = {
      getFieldProps: form.getFieldProps,
      disabled: readonly,
      formData,
    };
    return (
      <Form form={form}>
        <FormInput field="pre_entry_id" outercol={12} col={4}
          label={this.msg('preEntryId')} {...formProps} />
        <FormInput field="entry_id" outercol={12} col={2}
          label={this.msg('formEntryId')} {...formProps} />
        <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
          codeField="forwarder_code" nameField="forwareder_name"
          {...formProps} options={[]}/>
        <PortDate {...formProps} ietype={ietype} intl={intl} formRequire={formRequire}/>
        <RelationAutoCompSelect label={
          ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName')
        } codeField="owner_code" nameField="owner_name" intl={intl}
          {...formProps} options={[]}/>
        <Transport {...formProps} intl={intl} formRequire={formRequire}/>
        <RelationAutoCompSelect label={this.msg('agentName')}
          codeField="agent_code" nameField="agent_name" intl={intl}
          {...formProps} options={[]}/>
        <TradeRemission {...formProps} intl={intl} formRequire={formRequire}/>
        <CountryAttr {...formProps} intl={intl} formRequire={formRequire} ietype={ietype}/>
      </Form>
    );
  }
}
/*
              {this.renderSelect('进口口岸', '', 'i_e_port', false, [], null)}
              {this.renderSelect('收发货人', '选择收发货人', 'trade_co', true, [], null)}
              {this.renderSelect('消费使用单位', '选择消费使用单位', 'owner_code', false, [], null)}

              {this.renderTextInput('许可证号', '输入许可证号', 'license_no', false, null, null)}

              {this.renderSelect('贸易国', '选择贸易国', '', false, Country, null)}
              <Row>
                <Col span="12">
                  {this.renderSelect1('杂费', '', 'other_mark', false, FEE_TYPE, null)}
                </Col>
                <Col span="6">
                  {this.renderNumberWithoutName('other_rate')}
                </Col>
                <Col span="6">
                  {this.renderSelectWithoutName('other_curr', Curr)}
                </Col>
              </Row>
              <Row>
                <Col span="12">
                  {this.renderNumber1('件数', 'pack_no')}
                </Col>
                <Col span="12">
                  {this.renderSelect1('包装种类', '', 'wrap_type', false, WRAP_TYPE, null)}
                </Col>
              </Row>
            </Col>
            <Col span="6">
              {this.renderTextInput('备案号', '输入备案号', 'ems_no', true, [
                {
                  required: true,
                  message: '输入备案号'
                }
              ])}
              {this.renderSelect('运输方式', '选择运输方式', 'traf_mode', false, Transf, null)}
              {this.renderSelect('监管方式', '选择监管方式', 'trade_mode', true, Trade, [
                {
                  required: true,
                  message: '请选择监管方式'
                }
              ])}
              {this.renderSelect('起运国', '选择起运国', 'trade_country', false, Country, null)}
              <Row>
                <Col span="12">
                  {this.renderSelect1('运费', '', 'fee_mark', false, FEE_TYPE, null)}
                </Col>
                <Col span="6">
                  {this.renderNumberWithoutName('fee_rate')}
                </Col>
                <Col span="6">
                  {this.renderSelectWithoutName('fee_curr', Curr)}
                </Col>
              </Row>
              {this.renderNumber('净重(千克)', 'net_wt')}

            </Col>
            <Col span="6">
              {this.renderSelect('申报地海关', '选择申报地海关', 'master_customs', false, CustomsRel, null)}
              {this.renderDatePicker('进口日期', 'i_e_date')}

              {this.renderTextInput('运输工具名称', '输入运输工具名称', 'traf_name', false, null, null)}
              {this.renderSelect('征免性质', '选择征免性质', 'cut_mode', false, Levytype, null)}
              {this.renderSelect('装货港', '选择装货港', 'distinate_port', false, Port, null)}
              <Row>
                <Col span="12">
                  {this.renderSelect1('保费', '', 'insur_mark', false, FEE_TYPE, null)}
                </Col>
                <Col span="6">
                  {this.renderNumberWithoutName('insur_rate')}
                </Col>
                <Col span="6">
                  {this.renderSelectWithoutName('insur_curr', Curr)}
                </Col>
              </Row>
              {this.renderNumber('毛重(千克)', 'gross_wt')}
            </Col>
            <Col span="6">
              {this.renderDatePicker('申报日期', 'd_date')}
              {this.renderTextInput('提运单号', '输入提运单号', 'bill_no', false, null, null)}
              {this.renderSelect('境内目的地', '选择境内目的地', 'district_code', false, District, null)}
              <Row>
                <Col span="24">
                  {this.renderSelect('成交方式', '', 'trans_mode', false, Transac, null)}
                </Col>
              </Row>
              {this.renderTextInput('合同协议号', '输入合同协议号', 'contr_no', false, null, null)}

            </Col>
          </Row>
          <Row>
            <Col span="6">
              {this.renderTextInput('集装箱号', '输入集装箱号', 'jzxsl', false, null, null)}
            </Col>
            <Col span="18">
              {this.renderTextInput2(22, '随附单证', '输入随附单证', 'cert_mark', false, null, null)}
            </Col>

          </Row>
          <Row>
            <Col span="18">
              {this.renderTextInput2(22, '唛码备注', '输入唛码备注', 'note', false, null, null)}
            </Col>

            <Col span="6">
              {this.renderTextInput('航次号', '输入航次号', 'voyage_no', false, null, null)}
            </Col>
          </Row>
          <Row>
            <Col span="6">
              {this.renderSelect('申报单位', '选择申报单位', 'agent_code', false, [], null)}
            </Col>
            <Col span="6">
              {this.renderTextInput('库号', '输入库号', 'library_no', false, null, null)}
            </Col>
            <Col span="6">
              {this.renderTextInput('货场代码', '输入货场代码', 'prdtid', false, null, null)}
            </Col>
            <Col span="6">
              {this.renderTextInput('监管仓号', '输入监管仓号', 'storeno', false, null, null)}
            </Col>
          </Row>
          <Row>
            <Col span="12">
              {this.renderTextInput2(21, '关联报关单', '输入关联报关单', 'ramanualno', false, null, null)}
            </Col>
            <Col span="12">
              {this.renderTextInput2(21, '关联备案号', '输入关联备案号', 'radeclno', false, null, null)}
            </Col>
          </Row>
          <Row>
            <Col span="6">
              {this.renderNumber('总金额')}
            </Col>
            <Col span="6">
              {this.renderSelect('特殊关系', '', 'agent_code1', false, CONDITION_STATE, null)}
            </Col>
            <Col span="6">
              {this.renderSelect('价格影响', '', 'agent_code2', false, CONDITION_STATE, null)}
            </Col>
            <Col span="6">
              {this.renderSelect('支付特许权使用费', '', 'agent_code3', false, CONDITION_STATE, null)}
              */
