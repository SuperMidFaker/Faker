import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Row, Col, Table } from 'ant-ui';
import { format } from 'universal/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
import './pane.less';

function getColCls(col) {
  if (col) {
    const { span, offset } = col;
    const spanCls = span ? `col-${span}` : '';
    const offsetCls = offset ? `col-offset-${offset}` : '';
    return `${spanCls} ${offsetCls}`;
  }
  return '';
}
function PaneFormItem(props) {
  const { label, labelCol, field, fieldCol } = props;
  const labelCls = getColCls(labelCol);
  const fieldCls = `pane-field ${getColCls(fieldCol)}`;
  return (
    <div className="pane-form-item">
      <label className={labelCls}>{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}
PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  field: PropTypes.string,
  fieldCol: PropTypes.object,
};
@injectIntl
@connect(
  state => ({
    shipmt: state.shipment.previewer.shipmt,
  })
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    shipmt: PropTypes.object.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('goodsCode'),
    dataIndex: 'goods_no',
  }, {
    title: this.msg('goodsName'),
    dataIndex: 'name',
  }, {
    title: this.msg('goodsPackage'),
    dataIndex: 'package',
  }, {
    title: this.msg('goodsCount'),
    dataIndex: 'count',
  }, {
    title: this.msg('goodsWeight'),
    dataIndex: 'weight',
  }, {
    title: this.msg('goodsVolume'),
    dataIndex: 'volume',
  }, {
    title: this.msg('goodsLength'),
    dataIndex: 'length',
  }, {
    title: this.msg('goodsWidth'),
    dataIndex: 'width',
  }, {
    title: this.msg('goodsHeight'),
    dataIndex: 'height',
  }, {
    title: this.msg('goodsRemark'),
    dataIndex: 'remark',
  }]
  renderConsignPort(province, city, district) {
    if (city === '市辖区' || city === '县') {
      return `${province},${district}`;
    } else {
      return `${province},${city}`;
    }
  }
  render() {
    const { shipmt } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Row className="pane-section">
        <Col span="12">
          <div className="subform-heading">
            <h3 className="subform-title">{this.msg('consignerInfo')}</h3>
          </div>
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('consigner')}
            field={ shipmt.consigner_name } fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('departurePort')}
            field={ this.renderConsignPort(
              shipmt.consigner_province, shipmt.consigner_city,
              shipmt.consigner_district
            )} fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('pickupAddr')}
            field={ shipmt.consigner_addr } fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('contact')}
            field={ shipmt.consigner_contact } fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('mobile')}
            field={ shipmt.consigner_mobile } fieldCol={{ span: 18 }}
          />
        </Col>
        <Col span="12">
          <div className="subform-heading">
            <h3 className="subform-title">{this.msg('consigneeInfo')}</h3>
          </div>
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('consignee')}
            field={ shipmt.consignee_name } fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('arrivalPort')}
            field={ this.renderConsignPort(
              shipmt.consignee_province, shipmt.consignee_city,
              shipmt.consignee_district
            )} fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('deliveryAddr')}
            field={ shipmt.consignee_addr } fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('contact')}
            field={ shipmt.consignee_contact } fieldCol={{ span: 18 }}
          />
          <PaneFormItem labelCol={{ span: 6 }} label={this.msg('mobile')}
            field={ shipmt.consignee_mobile } fieldCol={{ span: 18 }}
          />
        </Col>
        </Row>
        <Row className="pane-section">
          <div className="subform-heading">
            <h3 className="subform-title">{this.msg('scheduleInfo')}</h3>
          </div>
          <Col span="8">
            <PaneFormItem labelCol={{ span: 8 }} label={this.msg('pickupDate')}
              field={ moment(shipmt.pickup_est_date).format('YYYY-MM-DD') } fieldCol={{ span: 16 }}
            />
          </Col>
          <Col span="8">
            <PaneFormItem labelCol={{ span: 8 }} label={this.msg('shipmtTransit')}
              field={ `${shipmt.transit_time || 0}${this.msg('day')}` } fieldCol={{ span: 16 }}
            />
          </Col>
          <Col span="8">
            <PaneFormItem labelCol={{ span: 8 }} label={this.msg('deliveryDate')}
              field={ moment(shipmt.deliver_est_date).format('YYYY-MM-DD') } fieldCol={{ span: 16 }}
            />
          </Col>
        </Row>
        <Row className="pane-section">
          <div className="subform-heading">
            <h3 className="subform-title">{this.msg('transitModeInfo')}</h3>
          </div>
          <Col span="8">
            <PaneFormItem labelCol={{ span: 8 }} label={this.msg('transitModeInfo')}
              field={ shipmt.transport_mode } fieldCol={{ span: 16 }}
            />
          </Col>
          <Col span="8">
            <PaneFormItem labelCol={{ span: 8 }} label={this.msg('vehicleType')}
              field={ shipmt.vehicle_type } fieldCol={{ span: 16 }}
            />
          </Col>
          <Col span="8">
            <PaneFormItem labelCol={{ span: 8 }} label={this.msg('vehicleLength')}
              field={shipmt.vehicle_length} fieldCol={{ span: 16 }}
            />
          </Col>
          <Col span="24">
            <PaneFormItem labelCol={{ span: 3 }} label={this.msg('remark')}
              field={ shipmt.remark } fieldCol={{ span: 21 }}
            />
          </Col>
        </Row>
        <Row className="pane-section">
          <div className="subform-heading">
            <h3 className="subform-title">{this.msg('goodsInfo')}</h3>
          </div>
          <Table size="middle" bordered columns={this.columns} pagination={false}
            dataSource={shipmt.goodslist}
          />
        </Row>
      </div>
    );
  }
}
