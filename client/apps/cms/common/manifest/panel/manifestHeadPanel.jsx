import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Card, Form, Row, Col, Popconfirm, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import FormInput from '../../form/formInput';
import {
  RelationAutoCompSelect, IEPort, IEDate, DeclDate, Transport, DeclCustoms, Pieces, ContractNo, LicenseNo, TermConfirm,
  TradeRemission, CountryAttr, TradeMode, Fee, ContainerNo, PackWeight,
  RaDeclManulNo, StoreYard,
} from '../../form/headFormItems';
import { loadSearchedParam, saveBillHead, resetBillHead } from 'common/reducers/cmsManifest';
import { format } from 'client/common/i18n/helpers';
import globalMessage from 'client/common/root.i18n';
import messages from '../message.i18n';

const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessage);

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
  { loadSearchedParam, saveBillHead, resetBillHead }
)
export default class ManifestHeadPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    readonly: PropTypes.bool,
    form: PropTypes.object.isRequired,
    ruleRequired: PropTypes.bool,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    loadSearchedParam: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    billHeadFieldsChangeTimes: PropTypes.number.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleSheetSave = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    this.props.onSave();
  }
  handleRelationSel = (codeField, custCodeField, nameField, value) => {
    let rels = this.props.formRequire[CODE_AS_STATE[codeField]].filter(rel => rel.code === value);
    if (rels.length === 0) {
      rels = this.props.formRequire[CODE_AS_STATE[custCodeField]].filter(rel => rel.custcode === value);
    }
    if (rels.length === 1) {
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
  handleBillHeadReset = () => {
    this.props.resetBillHead(this.props.formData).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.props.form.resetFields();
      }
    });
  }

  render() {
    const { form, readonly, formData, formRequire, ietype, intl, ruleRequired, billHeadFieldsChangeTimes } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      disabled: readonly,
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
        <div className="panel-header">
          <div>
            {!readonly &&
              <Button type="primary" onClick={this.handleSheetSave} icon="save" disabled={billHeadFieldsChangeTimes === 0}>
                {formatGlobalMsg(this.props.intl, 'save')}
              </Button>}
            {!readonly &&
              <Popconfirm title={'是否确认重置表头数据?'} onConfirm={this.handleBillHeadReset}>
                <Button icon="reload" style={{ marginLeft: 15 }}>重置</Button>
              </Popconfirm>}
          </div>
        </div>
        <div className="pane-content">
          <Form layout="horizontal">
            <Card>
              <Row>
                <Col span="8">
                  <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
                    codeField="trade_co" custCodeField="trade_custco" nameField="trade_name"
                    codeRules={[{ required: false }]} nameRules={[{ required: true }]}
                    onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                    {...formProps} options={formRequire.trades}
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
                  <RelationAutoCompSelect label={
                  ietype === 'import' ? this.msg('ownerConsumeName') : this.msg('ownerProduceName')
                } codeField="owner_code" custCodeField="owner_custco" nameField="owner_name" intl={intl}
                    codeRules={[{ required: false }]} nameRules={[{ required: true }]}
                    onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                    {...formProps} options={formRequire.owners}
                  />
                </Col>
                <Transport {...formProps} intl={intl} formRequire={formRequire} />
              </Row>
              <Row>
                <Col span="8">
                  <RelationAutoCompSelect label={this.msg('agentName')}
                    codeField="agent_code" custCodeField="agent_custco" nameField="agent_name" intl={intl}
                    codeRules={[{ required: false }]} nameRules={[{ required: true }]}
                    onSelect={this.handleRelationSel} onChange={this.handleRelationChange}
                    {...formProps} options={formRequire.agents}
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
                  <FormInput field="cert_mark" outercol={24} col={4}
                    label={this.msg('certMark')} {...entryFormProps}
                  />
                </Col>
              </Row>
              <Row>
                <Col span="8">
                  <DeclCustoms {...formProps} intl={intl} formRequire={formRequire} />
                </Col>
                <Col span={16}>
                  <FormInput field="note" outercol={24} col={4}
                    label={this.msg('markNotes')} {...entryFormProps}
                  />
                </Col>
              </Row>
            </Card>
            <Card>
              <Row>
                <TermConfirm {...formProps} intl={intl} formRequire={formRequire} />
              </Row>
              <Row>
                <RaDeclManulNo {...formProps} intl={intl} formRequire={formRequire} />
                <StoreYard {...formProps} intl={intl} formRequire={formRequire} />
              </Row>
            </Card>
          </Form>
        </div>
      </div>
    );
  }
}
