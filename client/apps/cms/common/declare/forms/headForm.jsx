import React, { PropTypes } from 'react';
import { Form } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from './formInput';
import {
  RelationAutoCompSelect, PortDate, Transport,
  TradeRemission, CountryAttr, DestInvoice, Fee, PackWeight,
} from './headFormItems';
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
    const { form, readonly, formData, formRequire = {}, ietype, intl, type } = this.props;
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
