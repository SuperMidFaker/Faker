import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Collapse, Form, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from './formInput';
import {
  RelationAutoCompSelect, PortDate, Transport,
  TradeRemission, CountryAttr, DestInvoice, LicenseTrade, Fee, ContractNo, PackWeight, ContainerUsage,
} from './headFormItems';
import { loadSearchedParam, saveBillHead } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import globalMessage from 'client/common/root.i18n';
import messages from './message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessage);
const Panel = Collapse.Panel;

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
  { loadSearchedParam, saveBillHead }
)
export default class SheetHeadPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    type: PropTypes.oneOf(['bill', 'entry']),
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadSearchedParam: PropTypes.func.isRequired,
    saveBillHead: PropTypes.func.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleBillSave = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    // todo bill head save sync with entry head, vice verse
    this.props.form.validateFields((errors) => {
      if (!errors) {
        const { billHead, ietype, loginId, tenantId } = this.props;
        const head = { ...billHead, ...this.props.form.getFieldsValue() };
        this.props.saveBillHead({ head, ietype, loginId, tenantId }).then(
          (result) => {
            if (result.error) {
              message.error(result.error.message);
            } else {
              message.info('更新成功');
            }
          }
        );
      }
    });
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
    const { form, readonly, formData, formRequire, ietype, intl, type } = this.props;
    const billHeadToolbar = (!readonly &&
      <div className="toolbar-right">
        <Button type="ghost">{formatGlobalMsg(this.props.intl, 'cancel')}</Button>
        <span />
        <Button type="primary" onClick={this.handleBillSave} icon="save">
          {formatGlobalMsg(this.props.intl, 'save')}
        </Button>
      </div>);
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      disabled: readonly || type === 'entry',
      formData,
    };
    const entryFormProps = {
      getFieldDecorator: form.getFieldDecorator,
      disabled: readonly,
      formData,
    };
    return (
      <Collapse defaultActiveKey={['header']}>
        <Panel header={billHeadToolbar} key="header">
          <Form horizontal>
            {type === 'entry' &&
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
            }
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
              <Transport {...formProps} intl={intl} formRequire={formRequire} />
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
              <CountryAttr {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
              <DestInvoice {...formProps} intl={intl} formRequire={formRequire}
                ietype={ietype} type={type} onSearch={this.handlePortSearch}
              />
            </Row>
            <Row>
              <LicenseTrade {...formProps} intl={intl} formRequire={formRequire} />
              <Fee {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
            </Row>
            <Row>
              <ContractNo {...formProps} intl={intl} formRequire={formRequire} />
              <PackWeight {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
            </Row>
            <Row>
              <ContainerUsage {...formProps} intl={intl} formRequire={formRequire} />
              <Col md={24} lg={15}>
                <FormInput field="cert_mark" outercol={16} col={4}
                  label={this.msg('certMark')} {...formProps}
                />
              </Col>
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
