import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Row, Col, Table } from 'ant-ui';
import { format } from 'universal/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    shipmt: state.shipment.previewer.shipmt,
  })
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  render() {
    const { shipmt } = this.props;
    return (
      <div className="panel-body">
        <Row>
          <Col span="14">
            <Col span="4" offset="2">
              <label>{this.msg('paneClient')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.sr_name }
            </Col>
            <Col span="4" offset="2">
              <label>{this.msg('paneLsp')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.sp_name }
            </Col>
          </Col>
          <Col span="10">
            <Col span="4" offset="2">
              <label>{this.msg('paneSource')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.sr_name }
            </Col>
            <Col span="4" offset="2">
              <label>{this.msg('paneCarrier')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.sp_name }
            </Col>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <div className="subform-heading">
              <div className="subform-title">{this.msg('consignerInfo')}</div>
            </div>
            <Col span="4" offset="2">
              <label>{this.msg('consigner')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.consigner_name }
            </Col>
            <Col span="4" offset="2">
              <label>{this.msg('departurePort')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.consigner_province }
            </Col>
            <Col span="4" offset="2">
              <label>{this.msg('pickupAddr')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.consigner_addr }
            </Col>
            <Col span="4" offset="2">
              <label>{this.msg('contact')}</label>
            </Col>
            <Col span="14" offset="4">
              { shipmt.consigner_contact }
            </Col>
          </Col>
        </Row>
      </div>
    );
  }
}
