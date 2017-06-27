import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Badge, Card, Col, Row, Steps, Tag } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { CMS_DECL_STATUS } from 'common/constants';

const Step = Steps.Step;

export default class CustomsDeclSheetCard extends React.Component {
  static propTypes = {
    customsDecl: PropTypes.object.isRequired,
  }

  render() {
    const { customsDecl } = this.props;
    const declkey = Object.keys(CMS_DECL_STATUS).filter(stkey => CMS_DECL_STATUS[stkey].value === customsDecl.status)[0];
    const decl = declkey ? CMS_DECL_STATUS[declkey] : null;
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
            <InfoItem label="进出口岸" field={customsDecl.i_e_port_text} />
          </Col>
          <Col span="8">
            <InfoItem label="监管方式" field={customsDecl.trade_mode_text} />
          </Col>
          <Col span="8">
            <InfoItem label="海关查验" field={inspectFlag} />
          </Col>
        </Row>
        <div className="card-footer">
          <Steps progressDot current={decl ? decl.step : 0}>
            {Object.keys(CMS_DECL_STATUS).map((dekey) => {
              const declST = CMS_DECL_STATUS[dekey];
              const stepDate = customsDecl[declST.date] ? moment(customsDecl[declST.date]).format('MM.DD HH:MM') : '';
              return (<Step description={`${declST.stepDesc} ${stepDate}`} key={dekey} />);
            })}
          </Steps>
        </div>
      </Card>
    );
  }
}
