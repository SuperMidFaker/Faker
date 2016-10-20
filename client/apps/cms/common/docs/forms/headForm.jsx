import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from './formInput';
import {
  RelationAutoCompSelect, PortDate, Transport,
  TradeRemission, CountryAttr, DestInvoice, Fee, PackWeight,
} from './headFormItems';
import { loadSearchedParam } from 'common/reducers/cmsDeclare';
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
    billHead: state.cmsDeclare.billHead,
    billBody: state.cmsDeclare.billBody,
    formRequire: state.cmsDeclare.params,
  }),
  { loadSearchedParam }
)
export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    type: PropTypes.oneOf(['bill', 'entry']),
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadSearchedParam: PropTypes.func.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
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
    const { form, readonly, formData, formRequire, ietype, intl, type } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      disabled: readonly,
      formData,
    };
    return (
      <Form horizontal className="form-compact">
        {type === 'entry' &&
          <FormInput field="pre_entry_id" outercol={9} col={6}
            label={this.msg('preEntryId')} {...formProps}
          />
        }
        {type === 'entry' &&
          <Col span="15">
            <FormInput field="entry_id" outercol={16} col={4}
              label={this.msg('formEntryId')} {...formProps}
            />
          </Col>
        }
        <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
          codeField="trade_co" nameField="trade_name"
          codeRules={[{ required: true }]} nameRules={[{ required: true }]}
          onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
          {...formProps} options={formRequire.trades}
        />
        <PortDate {...formProps} ietype={ietype} intl={intl} formRequire={formRequire}
          onSearch={this.handlePortSearch}
        />
        <RelationAutoCompSelect label={
          ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName')
          } codeField="owner_code" nameField="owner_name" intl={intl}
          codeRules={[{ required: true }]} nameRules={[{ required: true }]}
          onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
          {...formProps} options={formRequire.owners}
        />
        <Transport {...formProps} intl={intl} formRequire={formRequire} />
        <RelationAutoCompSelect label={this.msg('agentName')}
          codeField="agent_code" nameField="agent_name" intl={intl}
          codeRules={[{ required: true }]} nameRules={[{ required: true }]}
          onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
          {...formProps} options={formRequire.agents}
        />
        <TradeRemission {...formProps} intl={intl} formRequire={formRequire} />
        <CountryAttr {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />

        <DestInvoice {...formProps} intl={intl} formRequire={formRequire}
          ietype={ietype} type={type} onSearch={this.handlePortSearch}
        />
        <Fee {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
        <PackWeight {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
        <Col span="15">
          <FormInput field="cert_mark" outercol={16} col={4}
            label={this.msg('certMark')} {...formProps}
          />
        </Col>
        <Col span="24">
          <FormInput field="note" outercol={9} col={4} type="textarea"
            label={this.msg('markNotes')} {...formProps}
          />
        </Col>
      </Form>
    );
  }
}
