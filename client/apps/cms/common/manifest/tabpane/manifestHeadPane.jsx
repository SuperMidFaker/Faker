import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadSearchedParam, resetBillHead } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import FormInput from '../../form/formInput';
import FormDatePicker from '../../form/formDatePicker';
import {
  RelationAutoCompSelect, IEPort, IEDate, DeclDate, Transport, DeclCustoms,
  Pieces, ContractNo, LicenseNo, TermConfirm,
  TradeRemission, CountryAttr, TradeMode, Fee, ContainerNo, PackWeight,
  RaDeclManulNo, StoreYard,
} from '../../form/headFormItems';
import messages from '../message.i18n';

const formatMsg = format(messages);

const CODE_AS_STATE = {
  trade_co: 'trades',
  owner_code: 'owners',
  agent_code: 'agents',
  trade_custco: 'trades',
  owner_custco: 'owners',
  agent_custco: 'agents',
};

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
    billHeadFieldsChangeTimes: state.cmsManifest.billHeadFieldsChangeTimes,
  }),
  { loadSearchedParam, resetBillHead }
)
export default class ManifestHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadSearchedParam: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    billHeadFieldsChangeTimes: PropTypes.number.isRequired,
  }
  componentDidMount() {
    // document.addEventListener('keydown', this.handleKeyDown);
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.stopPropagation();
      event.preventDefault();
      const inputs = document.forms[0].elements;
      for (let i = 0; i < inputs.length; i++) {
        if (i === (inputs.length - 1)) {
          inputs[0].focus();
          inputs[0].select();
          break;
        } else if (event.target === inputs[i]) {
          inputs[i + 1].focus();
          inputs[i + 1].select();
          break;
        }
      }
    } else if (event.keyCode === 8) {
      event.target.select();
    }
  }
  handleSheetSave = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.props.onSave();
  }
  handleRelationSel = (codeField, custCodeField, nameField, value) => {
    let rels = this.props.formRequire[CODE_AS_STATE[codeField]].filter(rel => rel.code === value);
    if (rels.length === 0) {
      rels = this.props.formRequire[CODE_AS_STATE[custCodeField]].filter(rel =>
        rel.custcode === value);
    }
    if (rels.length > 0) {
      this.props.form.setFieldsValue({
        [codeField]: rels[0].code,
        [custCodeField]: rels[0].custcode,
        [nameField]: rels[0].name,
      });
    }
  }
  handleRelationChange = (codeField, custCodeField, nameField, value) => {
    if (value === undefined || value === '') {
      this.props.form.setFieldsValue({
        [codeField]: '',
        [custCodeField]: '',
        [nameField]: '',
      });
    }
  }
  handlePortSearch = (field, search) => {
    this.props.loadSearchedParam({ paramType: 'port', search });
  }

  render() {
    const {
      form, readonly, formData, formRequire, ietype, intl,
    } = this.props;
    if (!formData.bill_seq_no) {
      return null;
    }
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      disabled: readonly,
      formData,
      required: true,
    };
    const entryFormProps = {
      getFieldDecorator: form.getFieldDecorator,
      disabled: readonly,
      formData,
    };
    const tradesOpt = formRequire.trades.filter(data =>
      data.customer_partner_id === formData.owner_cuspartner_id);
    return (
      <FormPane fullscreen={this.props.fullscreen} hideRequiredMark>
        <Card hoverable={false}>
          <Row>
            <Col span="6">
              <DeclCustoms {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            {ietype === 'import' && (formData.traf_mode === '2' || formData.traf_mode === '5') &&
            <Col span="6">
              <FormDatePicker
                field="act_arrival_date"
                outercol={24}
                col={8}
                label={this.msg('实际到港日')}
                {...entryFormProps}
              />
            </Col>}
            {ietype === 'import' && formData.traf_mode === '2' &&
            <Col span="6">
              <FormDatePicker
                field="exchange_bl_date"
                outercol={24}
                col={8}
                label={this.msg('换单日')}
                {...entryFormProps}
              />
            </Col>}
            {ietype === 'import' && formData.traf_mode === '2' &&
            <Col span="6">
              <FormInput
                field="delivery_order"
                outercol={24}
                col={8}
                label={this.msg('提货单号')}
                {...entryFormProps}
              />
            </Col>
            }
          </Row>
        </Card>
        <Card hoverable={false}>
          <Row>
            <Col span="8">
              <RelationAutoCompSelect
                label={this.msg('forwardName')}
                intl={intl}
                codeField="trade_co"
                custCodeField="trade_custco"
                nameField="trade_name"
                codeRules={[{ required: false }]}
                nameRules={[{ required: true }]}
                onSelect={this.handleRelationSel}
                onChange={this.handleRelationChange}
                {...formProps}
                options={tradesOpt}
              />
            </Col>
            <Col span="16">
              <Col span="8">
                <IEPort {...formProps} ietype={ietype} intl={intl} formRequire={formRequire} />
              </Col>
              <Col span="8">
                <IEDate {...formProps} ietype={ietype} intl={intl} formRequire={formRequire} />
              </Col>
              <Col span="8">
                <DeclDate {...formProps} ietype={ietype} intl={intl} formRequire={formRequire} />
              </Col>
            </Col>
          </Row>
          <Row>
            <Col span="8">
              <RelationAutoCompSelect
                label={
                  ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName')
                }
                codeField="owner_code"
                custCodeField="owner_custco"
                nameField="owner_name"
                intl={intl}
                codeRules={[{ required: false }]}
                nameRules={[{ required: true }]}
                onSelect={this.handleRelationSel}
                onChange={this.handleRelationChange}
                {...formProps}
                options={tradesOpt}
              />
            </Col>
            <Transport {...formProps} intl={intl} formRequire={formRequire} />
          </Row>
          <Row>
            <Col span="8">
              <RelationAutoCompSelect
                label={this.msg('agentName')}
                codeField="agent_code"
                custCodeField="agent_custco"
                nameField="agent_name"
                intl={intl}
                codeRules={[{ required: false }]}
                nameRules={[{ required: true }]}
                onSelect={this.handleRelationSel}
                onChange={this.handleRelationChange}
                {...formProps}
                options={formRequire.agents}
              />
            </Col>
            <TradeRemission {...formProps} intl={intl} formRequire={formRequire} />
          </Row>
          <CountryAttr {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} onSearch={this.handlePortSearch} />
          <Row>
            <Col span="5">
              <LicenseNo {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            <Col span="3">
              <TradeMode {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            <Fee {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
          </Row>
          <Row>
            <Col span="5">
              <ContractNo {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            <Col span="3">
              <Pieces {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            <PackWeight {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
          </Row>
          <Row>
            <Col span={8}>
              <ContainerNo {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            <Col span={16}>
              <FormInput
                field="cert_mark"
                outercol={24}
                col={3}
                label={this.msg('certMark')}
                {...entryFormProps}
              />
            </Col>
          </Row>
          <Row>
            <Col span="8" />
            <Col span={16}>
              <FormInput
                field="note"
                outercol={24}
                col={3}
                label={this.msg('markNotes')}
                {...entryFormProps}
              />
            </Col>
          </Row>
        </Card>
        <Card hoverable={false}>
          <Row>
            <TermConfirm {...formProps} intl={intl} formRequire={formRequire} />
          </Row>
          <Row>
            <RaDeclManulNo {...formProps} intl={intl} formRequire={formRequire} />
            <StoreYard {...formProps} intl={intl} formRequire={formRequire} />
          </Row>
        </Card>
      </FormPane>
    );
  }
}
