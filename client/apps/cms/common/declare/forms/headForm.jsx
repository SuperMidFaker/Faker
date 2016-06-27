import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Form, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from './formInput';
import {
  RelationAutoCompSelect, PortDate, Transport,
  TradeRemission, CountryAttr, DestInvoice, Fee, PackWeight,
} from './headFormItems';
import { loadCompRelation } from 'common/reducers/cmsDeclare';
import { RELATION_TYPES } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

const CODE_AS_RELATION_TYPE = {
  'forwarder_code': RELATION_TYPES[0].key,
  'owner_code': RELATION_TYPES[1].key,
  'agent_code': RELATION_TYPES[2].key,
};
const CODE_AS_STATE = {
  'forwarder_code': 'forwarders',
  'owner_code': 'owners',
  'agent_code': 'agents',
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billHead: state.cmsDeclare.billHead,
    billBody: state.cmsDeclare.billBody,
    formRequire: state.cmsDeclare.params,
  }),
  { loadCompRelation }
)
export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    type: PropTypes.oneOf([ 'bill', 'entry' ]),
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadCompRelation: PropTypes.object.isRequired,
  }
  state = {
    forwarders: [],
    owners: [],
    agents: [],
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleRelationSearch = (codeField, value) => {
    const type = CODE_AS_RELATION_TYPE[codeField];
    this.props.loadCompRelation(type, this.props.ietype, this.props.tenantId, value).then(result => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        this.setState({ [CODE_AS_STATE[codeField]]: result.data });
      }
    });
  }
  render() {
    const { form, readonly, formData, formRequire, ietype, intl, type } = this.props;
    const { forwarders, owners, agents } = this.state;
    const formProps = {
      getFieldProps: form.getFieldProps,
      disabled: readonly,
      formData,
    };
    return (
      <Form horizontal form={form}>
        <FormInput field="pre_entry_id" outercol={12} col={4}
          label={this.msg('preEntryId')} {...formProps} />
        <FormInput field="entry_id" outercol={12} col={4}
          label={this.msg('formEntryId')} {...formProps} />
        <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
          codeField="forwarder_code" nameField="forwareder_name" onSearch={this.handleRelationSearch}
          {...formProps} options={forwarders}/>
        <PortDate {...formProps} ietype={ietype} intl={intl} formRequire={formRequire}/>
        <RelationAutoCompSelect label={
          ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName')
        } codeField="owner_code" nameField="owner_name" intl={intl}
          {...formProps} options={owners}/>
        <Transport {...formProps} intl={intl} formRequire={formRequire}/>
        <RelationAutoCompSelect label={this.msg('agentName')}
          codeField="agent_code" nameField="agent_name" intl={intl}
          {...formProps} options={agents}/>
        <TradeRemission {...formProps} intl={intl} formRequire={formRequire}/>
        <CountryAttr {...formProps} intl={intl} formRequire={formRequire} ietype={ietype}/>

        <DestInvoice {...formProps} intl={intl} formRequire={formRequire}
          ietype={ietype} type={type}
        />
        <Fee {...formProps} intl={intl} formRequire={formRequire} ietype={ietype}/>
        <PackWeight {...formProps} intl={intl} formRequire={formRequire} ietype={ietype}/>
        <FormInput field="cert_mark" outercol={12} col={4}
          label={this.msg('certMark')} {...formProps} />
        <FormInput field="note" outercol={24} col={2} type="textarea"
          label={this.msg('markNotes')} {...formProps} />
      </Form>
    );
  }
}
