import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { CMS_DECL_STATUS } from 'common/constants';
import { fillEntryId } from 'common/reducers/cmsManifest';
import { updateCustomEntryHead } from 'common/reducers/cmsCustomsDeclare';
import InfoItem from 'client/components/InfoItem';
import FormPane from 'client/components/FormPane';
import EditableCell from 'client/components/EditableCell';
import {
  RelationAutoCompSelect, IEPort, IEDate, DeclDate, Transport, LicenseNo, TermConfirm,
  TradeRemission, CountryAttr, TradeMode, Fee, ContainerNo, PackWeight,
  RaDeclManulNo, StoreYard,
} from '../../common/form/headFormItems';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
  }),
  { fillEntryId, updateCustomEntryHead }
)
export default class CusDeclHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']).isRequired,
    headSave: PropTypes.bool.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    formData: PropTypes.shape({
      status: PropTypes.number.isRequired,
      id: PropTypes.number.isRequired,
    }).isRequired,
    formRequire: PropTypes.shape({
      trades: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string })),
    }).isRequired,
    fillEntryId: PropTypes.func.isRequired,
    updateCustomEntryHead: PropTypes.func.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleEntryFill = (entryNo) => {
    const { formData } = this.props;
    this.props.fillEntryId({
      entryNo,
      entryHeadId: formData.id,
      billSeqNo: formData.bill_seq_no,
      delgNo: formData.delg_no,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleHeadDirectSave = (val, field) => {
    const head = {};
    head[field] = val;
    this.props.updateCustomEntryHead(head, this.props.formData.id);
  }
  render() {
    const {
      form, formData, formRequire, ietype, intl, headSave,
    } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      disabled: !headSave,
      formData,
      required: true,
    };
    const editable = formData.status < CMS_DECL_STATUS.sent.value;
    const header = (<Row>
      <Col span="6">
        <InfoItem
          size="small"
          field={formData.pre_entry_id}
          addonBefore={this.msg('preEntryId')}
        />
      </Col>
      <Col span="6">
        <InfoItem
          size="small"
          field={formData.entry_id}
          placeholder="点击回填"
          addonBefore={this.msg('formEntryId')}
          editable={!formData.entry_id}
          onEdit={this.handleEntryFill}
        />
      </Col>
    </Row>);
    return (
      <FormPane header={header} hideRequiredMark>
        <Card >
          <Row>
            <Col span="8">
              <RelationAutoCompSelect
                label={this.msg('forwardName')}
                intl={intl}
                codeField="trade_co"
                nameField="trade_name"
                custCodeField="trade_custco"
                codeRules={[{ required: true }]}
                nameRules={[{ required: true }]}
                {...formProps}
                options={formRequire.trades}
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
                codeRules={[{ required: true }]}
                nameRules={[{ required: true }]}
                {...formProps}
                options={formRequire.owners}
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
                codeRules={[{ required: true }]}
                nameRules={[{ required: true }]}
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
            <Col span={5}>
              <FormItem label={this.msg('contractNo')} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false} style={{ marginBottom: 0 }}>
                <EditableCell field="contr_no" value={formData.contr_no} onSave={this.handleHeadDirectSave} editable={editable} disabled={!editable} />
              </FormItem>
            </Col>
            <Col span={3}>
              <FormItem label={this.msg('packCount')} labelCol={{ span: 10 }} wrapperCol={{ span: 14 }} colon={false} style={{ marginBottom: 0 }}>
                <EditableCell field="pack_count" value={formData.pack_count} onSave={this.handleHeadDirectSave} editable={editable} disabled={!editable} />
              </FormItem>
            </Col>
            <PackWeight
              {...formProps}
              intl={intl}
              formRequire={formRequire}
              ietype={ietype}
              packFormEditCell={
                <FormItem label={this.msg('packType')} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false} style={{ marginBottom: 0 }}>
                  <EditableCell
                    field="wrap_type"
                    value={formData.wrap_type}
                    onSave={this.handleHeadDirectSave}
                    editable={editable}
                    type="select"
                    options={formRequire.packs.map(pack => ({
                    key: pack.value,
                    text: pack.text,
                  }))}
                  />
                </FormItem>
            }
            />
          </Row>
          <Row className="info-group info-group-inline">
            <Col span={8}>
              <ContainerNo {...formProps} intl={intl} formRequire={formRequire} />
            </Col>
            <Col span={16}>
              <FormItem label={this.msg('certMark')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} colon={false} style={{ marginBottom: 0 }}>
                <EditableCell field="cert_mark" value={formData.cert_mark} onSave={this.handleHeadDirectSave} editable={editable} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={16} offset={8}>
              <FormItem label={this.msg('markNotes')} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} colon={false} style={{ marginBottom: 0 }}>
                <EditableCell field="note" value={formData.note} onSave={this.handleHeadDirectSave} editable={editable} />
              </FormItem>
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
