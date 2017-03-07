import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Collapse, Form, Row, Col } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from './formInput';
import {
  RelationAutoCompSelect, PortDate, Transport, DeclCustoms, DelVoyageNo,
  TradeRemission, CountryAttr, DestInvoice, UsageTrade, Fee,
} from './headFormItems';
import { loadSearchedParam } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const Panel = Collapse.Panel;

const CODE_AS_STATE = {
  trade_co: 'trades',
  owner_code: 'owners',
  agent_code: 'agents',
};

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
    ietype: state.cmsSettings.template.ietype,
  }),
  { loadSearchedParam }
)
export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
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
    const { form, formData, formRequire, ietype, intl } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      formData,
    };
    return (
      <Collapse defaultActiveKey={['header']} className="content-min-width" style={{ marginBottom: 8 }}>
        <Panel key="header">
          <Form horizontal>
            <Row>
              <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
                codeField="trade_co" nameField="trade_name"
                codeRules={[{ required: false }]} nameRules={[{ required: false }]}
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
                codeRules={[{ required: false }]} nameRules={[{ required: false }]}
                onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                {...formProps} options={formRequire.owners}
              />
              <DeclCustoms {...formProps} intl={intl} formRequire={formRequire} />
            </Row>
            <Row>
              <RelationAutoCompSelect label={this.msg('agentName')}
                codeField="agent_code" nameField="agent_name" intl={intl}
                codeRules={[{ required: false }]} nameRules={[{ required: false }]}
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
                ietype={ietype} onSearch={this.handlePortSearch}
              />
            </Row>
            <Row>
              <UsageTrade {...formProps} intl={intl} formRequire={formRequire} />
              <Fee {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
            </Row>
            <Col span="24">
              <FormInput field="note" outercol={9} col={4} type="textarea"
                label={this.msg('markNotes')} {...formProps}
              />
            </Col>
          </Form>
        </Panel>
      </Collapse>
    );
  }
}
