import React from 'react';
import PropTypes from 'prop-types';

import { Card, Col, Row } from 'antd';
import InfoItem from 'client/components/InfoItem';


export default class CusDeclCard extends React.Component {
  static propTypes = {
    ciqDecl: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleView = () => {
    const ioType = this.props.ciqDecl.i_e_type === 0 ? 'in' : 'out';
    const link = `/clearance/ciqdecl/${ioType}/${this.props.ciqDecl.pre_entry_seq_no}`;
    this.context.router.push(`${link}`);
  }

  render() {
    const { ciqDecl } = this.props;
    const declNo = (ciqDecl.ciq_decl_no) ?
      <span>报检号# {ciqDecl.ciq_decl_no} </span> :
      <span className="mdc-text-grey">内部编号# {ciqDecl.pre_entry_seq_no}</span>;
    return (
      <Card
        title={<a onClick={() => this.handleView()}>{declNo}</a>}
        bodyStyle={{ padding: 16 }}
        hoverable
      >
        <Row gutter={16} className="info-group-underline">
          <Col span="12">
            <InfoItem label="收发货人" field={ciqDecl.trade_name} />
          </Col>
          <Col span="12">
            <InfoItem label="申报单位" field={ciqDecl.agent_name} />
          </Col>
        </Row>
      </Card>
    );
  }
}
