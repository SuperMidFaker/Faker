import React, { PropTypes } from 'react';
import moment from 'moment';
import { Badge, Card, Col, Row, Steps, Tag } from 'antd';
import { CMS_DECL_STATUS } from 'common/constants';
import InfoItem from 'client/components/InfoItem';

const Step = Steps.Step;

export default class CustomsDeclSheetCard extends React.Component {
  static propTypes = {
    customsDecl: PropTypes.object.isRequired,
  }

  render() {
    const { customsDecl } = this.props;
    const decl = CMS_DECL_STATUS.filter(st => st.value === customsDecl.status)[0];
    const declStatus = decl && <Badge status={decl.badge} text={decl.text} />;
    const sheetType = customsDecl.sheet_type === 'CDF' ? <Tag color="blue">报关单</Tag> : <Tag color="green">备案清单</Tag>;
    const declNo = (customsDecl.entry_id) ?
      <span>海关编号# {customsDecl.entry_id} {sheetType}</span> :
      <span className="mdc-text-grey">预报关编号# {customsDecl.pre_entry_seq_no} {sheetType}</span>;
    let inspectFlag = <Tag>否</Tag>;
    if (customsDecl.customs_inspect === 1) {
      inspectFlag = <Tag color="#F04134">是</Tag>;
    } else if (customsDecl.customs_inspect === 2) {
      inspectFlag = <Tag color="rgba(39, 187, 71, 0.65)">通过</Tag>;
    }
    let step = 0;
    if (customsDecl.status === CMS_DECL_STATUS[0].value) {
      step = 0;
    } else if (customsDecl.status === CMS_DECL_STATUS[1].value) {
      step = 1;
    } else if (customsDecl.status === CMS_DECL_STATUS[2].value) {
      step = 2;
    } else if (customsDecl.status === CMS_DECL_STATUS[3].value) {
      step = 3;
    } else if (customsDecl.passed) {
      step = 4;
    }
    return (
      <Card title={<span>{declNo}</span>} extra={declStatus} bodyStyle={{ paddingBottom: 56 }}>
        <Row gutter={8}>
          <Col span="12">
            <InfoItem label="收发货人" field={customsDecl.trade_name} />
          </Col>
          <Col span="12">
            <InfoItem label="申报单位" field={customsDecl.agent_name} />
          </Col>
          <Col span="8">
            <InfoItem label="进出口岸" field={customsDecl.i_e_port} />
          </Col>
          <Col span="8">
            <InfoItem label="监管方式" field={customsDecl.trade_mode} />
          </Col>
          <Col span="8">
            <InfoItem label="海关查验" field={inspectFlag} />
          </Col>
        </Row>
        <div className="card-footer">
          <Steps progressDot current={step}>
            <Step description={`生成 ${customsDecl.created_date
                    ? moment(customsDecl.created_date).format('MM.DD HH.MM') : ''}`}
            />
            <Step description={`复核 ${customsDecl.reviewed_date
                    ? moment(customsDecl.reviewed_date).format('MM.DD HH.MM') : ''}`}
            />
            <Step description={`发送 ${customsDecl.epsend_date
                    ? moment(customsDecl.epsend_date).format('MM.DD HH.MM') : ''}`}
            />
            <Step description={`回执 ${customsDecl.epsend_date
                    ? moment(customsDecl.epsend_date).format('MM.DD HH.MM') : ''}`}
            />
            <Step description={`放行 ${customsDecl.clear_date
                    ? moment(customsDecl.clear_date).format('MM.DD HH.MM') : ''}`}
            />
          </Steps>
        </div>
      </Card>
    );
  }
}
