import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Form, Row, Col, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import InfoItem from 'client/components/InfoItem';
import {
  RelationAutoCompSelect, IEPort, IEDate, DeclDate, Transport, LicenseNo, TermConfirm,
  TradeRemission, CountryAttr, TradeMode, Fee, ContainerNo, PackWeight,
  RaDeclManulNo, StoreYard,
} from '../../form/headFormItems';
import { fillEntryId } from 'common/reducers/cmsManifest';
import { updateMark } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import { CMS_DECL_STATUS } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    formRequire: state.cmsManifest.params,
  }),
  { fillEntryId, updateMark }
)
export default class CustomsDeclHeadPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    formRequire: PropTypes.object.isRequired,
    fillEntryId: PropTypes.func.isRequired,
    updateMark: PropTypes.func.isRequired,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)

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
  handleMarkFill = (val, field) => {
    const change = {};
    change[field] = val;
    this.props.updateMark(change, this.props.formData.id);
  }
  render() {
    const { form, formData, formRequire, ietype, intl } = this.props;
    const formProps = {
      getFieldDecorator: form.getFieldDecorator,
      getFieldValue: form.getFieldValue,
      disabled: true,
      formData,
      required: false,
    };
    const editable = formData.status < CMS_DECL_STATUS.sent.value;
    return (
      <div className="pane">
        <Form layout="horizontal">
          <div className="panel-header">
            <Row>
              <Col span="6">
                <InfoItem size="small" field={formData.pre_entry_id}
                  addonBefore={this.msg('preEntryId')}
                />
              </Col>
              <Col span="6">
                <InfoItem size="small" field={formData.entry_id} placeholder="点击回填"
                  addonBefore={this.msg('formEntryId')} editable={!formData.entry_id} onEdit={this.handleEntryFill}
                />
              </Col>
            </Row>
          </div>
          <div className="pane-content form-layout-multi-col">
            <Card bodyStyle={{ padding: 16 }} noHovering>
              <Row>
                <Col span="8">
                  <RelationAutoCompSelect label={this.msg('forwardName')} intl={intl}
                    codeField="trade_co" nameField="trade_name" custCodeField="trade_custco"
                    codeRules={[{ required: true }]} nameRules={[{ required: true }]}
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
                    codeRules={[{ required: true }]} nameRules={[{ required: true }]}
                    {...formProps} options={formRequire.owners}
                  />
                </Col>
                <Transport {...formProps} intl={intl} formRequire={formRequire} />
              </Row>
              <Row>
                <Col span="8">
                  <RelationAutoCompSelect label={this.msg('agentName')}
                    codeField="agent_code" custCodeField="agent_custco" nameField="agent_name" intl={intl}
                    codeRules={[{ required: true }]} nameRules={[{ required: true }]}
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
                <Col span={8}>
                  <ContainerNo {...formProps} intl={intl} formRequire={formRequire} />
                </Col>
                <PackWeight {...formProps} intl={intl} formRequire={formRequire} ietype={ietype} />
              </Row>
              <Row>
                <Col span="5">
                  <InfoItem size="small" field={formData.contr_no} placeholder="点击输入" dataIndex="contr_no"
                    addonBefore={this.msg('contractNo')} editable={editable} onEdit={this.handleMarkFill}
                  />
                </Col>
                <Col span="3">
                  <InfoItem size="small" field={formData.pack_count} placeholder="点击输入" dataIndex="pack_count"
                    addonBefore={this.msg('packCount')} editable={editable} onEdit={this.handleMarkFill}
                  />
                </Col>
                <Col span={15} offset={1}>
                  <InfoItem size="small" field={formData.cert_mark} placeholder="点击输入" dataIndex="cert_mark"
                    addonBefore={this.msg('certMark')} editable={editable} onEdit={this.handleMarkFill}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={15} offset={9}>
                  <InfoItem size="small" field={formData.note} placeholder="点击输入" dataIndex="note"
                    addonBefore={this.msg('markNotes')} editable={editable} onEdit={this.handleMarkFill}
                  />
                </Col>
              </Row>
            </Card>
            <Card noHovering>
              <Row>
                <TermConfirm {...formProps} intl={intl} formRequire={formRequire} />
              </Row>
              <Row>
                <RaDeclManulNo {...formProps} intl={intl} formRequire={formRequire} />
                <StoreYard {...formProps} intl={intl} formRequire={formRequire} />
              </Row>
            </Card>

          </div>
        </Form>
      </div>
    );
  }
}
