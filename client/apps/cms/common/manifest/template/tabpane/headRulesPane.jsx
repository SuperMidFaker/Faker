import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadSearchedParam } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import FormPane from 'client/components/FormPane';
import FormInput from '../../../form/formInput';
import {
  RelationAutoCompSelect, IEPort, IEDate, DeclDate, Transport, DeclCustoms,
  Pieces, ContractNo, LicenseNo, TermConfirm,
  TradeRemission, CountryAttr, TradeMode, Fee, ContainerNo, PackWeight,
  RaDeclManulNo, StoreYard,
} from '../../../form/headFormItems';
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
    ietype: state.cmsManifest.template.ietype,
    template: state.cmsManifest.template,
  }),
  { loadSearchedParam }
)
export default class HeadRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadSearchedParam: PropTypes.func.isRequired,
    template: PropTypes.object.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleSheetSave = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.props.onSave();
  }
  handleRelationSel = (codeField, custCodeField, nameField, value) => {
    let rels = this.props.formRequire[CODE_AS_STATE[codeField]].filter(rel =>
      rel.code === value);
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
      form, formData, formRequire, ietype, intl, ruleRequired, template,
    } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      formData,
      required: ruleRequired,
    };
    const tradesOpt = formRequire.trades.filter(data =>
      data.customer_partner_id === template.customer_partner_id);
    return (
      <FormPane fullscreen={this.props.fullscreen}>
        <Card
          bodyStyle={{ padding: 16 }}

        >
          <Row>
            <Col span="8">
              <RelationAutoCompSelect
                label={this.msg('forwardName')}
                intl={intl}
                codeField="trade_co"
                custCodeField="trade_custco"
                nameField="trade_name"
                codeRules={[{ required: false }]}
                nameRules={[{ required: false }]}
                onSelect={this.handleRelationSel}
                onChange={this.handleRelationChange}
                {...formProps}
                options={tradesOpt}
              />
            </Col>
            <Col span="16">
              <Col span="8">
                <IEPort
                  {...formProps}
                  ietype={ietype}
                  intl={intl}
                  formRequire={formRequire}
                  onSearch={this.handlePortSearch}
                />
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
                    (ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName'))
                  }
                codeField="owner_code"
                custCodeField="owner_custco"
                nameField="owner_name"
                intl={intl}
                codeRules={[{ required: false }]}
                nameRules={[{ required: false }]}
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
                nameRules={[{ required: false }]}
                onSelect={this.handleRelationSel}
                onChange={this.handleRelationChange}
                {...formProps}
                options={formRequire.agents}
              />
            </Col>
            <TradeRemission {...formProps} intl={intl} formRequire={formRequire} />
          </Row>
          <CountryAttr
            {...formProps}
            intl={intl}
            formRequire={formRequire}
            ietype={ietype}
            onSearch={this.handlePortSearch}
          />
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
                col={4}
                label={this.msg('certMark')}
                {...formProps}
                disabled
              />
            </Col>
          </Row>
          <Row>
            <Col span="8">
              <DeclCustoms {...formProps} intl={intl} formRequire={formRequire} disabled />
            </Col>
            <Col span={16}>
              <FormInput
                field="note"
                outercol={24}
                col={4}
                label={this.msg('markNotes')}
                {...formProps}
              />
            </Col>
          </Row>
        </Card>
        <Card >
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
