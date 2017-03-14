import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from '../../form/formInput';
import {
  RelationAutoCompSelect, PortDate, Transport, DeclCustoms, DelVoyageNo, TermConfirm,
  TradeRemission, CountryAttr, DestInvoice, UsageTrade, Fee, ContainerNo, PackWeight,
  RaDeclManulNo, StroeYard,
} from '../../form/headFormItems';
import { loadSearchedParam, saveBillHead } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

const CODE_AS_STATE = {
  trade_co: 'trades',
  owner_code: 'owners',
  agent_code: 'agents',
};

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
  }),
  { loadSearchedParam, saveBillHead }
)
export default class CDFHeadPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    type: PropTypes.oneOf(['bill', 'entry']),
    ruleRequired: PropTypes.bool,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadSearchedParam: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleSheetSave = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.props.onSave();
  }
  handleRelationSel = (codeField, nameField, value) => {
    const rels = this.props.formRequire[CODE_AS_STATE[codeField]].filter(rel => rel.code === value);
    if (rels.length === 1) {
      this.props.form.setFieldsValue({
        [codeField]: rels[0].code,
        [nameField]: rels[0].name,
      });
    }
  }
  handleRelationChange = (codeField, nameField, value) => {
    if (value === undefined || value === '') {
      this.props.form.setFieldsValue({
        [codeField]: '',
        [nameField]: '',
      });
    }
  }
  handlePortSearch = (field, search) => {
    this.props.loadSearchedParam({ paramType: 'port', search });
  }
  render() {
    const { form, readonly, formData, formRequire, ietype, intl, type, ruleRequired } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      disabled: true,
      formData,
      required: ruleRequired,
    };
    const entryFormProps = {
      getFieldDecorator: form.getFieldDecorator,
      disabled: readonly,
      formData,
    };
    return (
      <div className="pane">
        <div className="pane-content">
          <Form layout="horizontal">
            <Row>
              <FormInput field="pre_entry_id" outercol={9} col={6}
                label={this.msg('preEntryId')} {...entryFormProps}
              />
              <Col span="15">
                <FormInput field="entry_id" outercol={16} col={4}
                  label={this.msg('formEntryId')} {...entryFormProps}
                />
              </Col>
            </Row>
            <Row>
              <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
                codeField="trade_co" nameField="trade_name"
                codeRules={[{ required: true }]} nameRules={[{ required: true }]}
                onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                {...formProps} options={formRequire.trades}
              />
              <PortDate {...formProps} ietype={ietype} intl={intl} formRequire={formRequire}
                onSearch={this.handlePortSearch}
              />
            </Row>
            <Row>
              <RelationAutoCompSelect label={
                ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName')
              } codeField="owner_code" nameField="owner_name" intl={intl}
                codeRules={[{ required: true }]} nameRules={[{ required: true }]}
                onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                {...formProps} options={formRequire.owners}
              />
              <DeclCustoms {...formProps} intl={intl} formRequire={formRequire} />
            </Row>
            <Row>
              <RelationAutoCompSelect label={this.msg('agentName')}
                codeField="agent_code" nameField="agent_name" intl={intl}
                codeRules={[{ required: true }]} nameRules={[{ required: true }]}
                onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                {...formProps} options={formRequire.agents}
              />
              <TradeRemission {...formProps} intl={intl} formRequire={formRequire} />
            </Row>
            <Row>
              <Transport {...formProps} intl={intl} formRequire={formRequire} />
              <DelVoyageNo {...formProps} intl={intl} formRequire={formRequire} />
            </Row>
            <Row>
              <CountryAttr {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
              <DestInvoice {...formProps} intl={intl} formRequire={formRequire}
                ietype={ietype} type={type} onSearch={this.handlePortSearch}
              />
            </Row>
            <Row>
              <UsageTrade {...formProps} intl={intl} formRequire={formRequire} />
              <Fee {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
            </Row>
            <Row>
              <ContainerNo {...formProps} intl={intl} formRequire={formRequire} />
              <PackWeight {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
            </Row>
            <Row>
              <Col span={9}>
                <FormInput field="cert_mark" outercol={24} col={4}
                  label={this.msg('certMark')} {...entryFormProps}
                />
              </Col>
              <TermConfirm {...formProps} intl={intl} formRequire={formRequire} />
            </Row>
            <Row>
              <RaDeclManulNo {...formProps} intl={intl} formRequire={formRequire} />
              <StroeYard {...formProps} intl={intl} formRequire={formRequire} />
            </Row>
            <Row>
              <FormInput field="note" outercol={9} col={4} type="textarea"
                label={this.msg('markNotes')} {...entryFormProps}
              />
            </Row>
          </Form>
        </div>
      </div>
    );
  }
}
