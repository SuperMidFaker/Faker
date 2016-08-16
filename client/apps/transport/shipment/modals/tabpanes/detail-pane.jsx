import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Table, Collapse, Timeline, Icon } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { renderConsignLoc } from '../../../common/consignLocation';
import { PRESET_TRANSMODES } from 'common/constants';
import messages from '../../message.i18n';
import './pane.less';
const formatMsg = format(messages);
const Panel = Collapse.Panel;

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
      <label className={labelCls} htmlFor="pane">{label}：</label>
      <div className={fieldCls}>{field}</div>
    </div>
  );
}
PaneFormItem.propTypes = {
  label: PropTypes.string.isRequired,
  labelCol: PropTypes.object,
  field: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
        <Collapse defaultActiveKey={['customer', 'trans_schedule', 'trans_mode']}>
          <Panel header={this.msg('customerInfo')} key="customer">
            <Col span="24">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('client')}
                field={shipmt.customer_name} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refExternalNo')}
                field={shipmt.ref_external_no} fieldCol={{ span: 16 }}
              />
            </Col>
          </Panel>
          <Panel header={`${this.msg('shipmtSchedule')}  ${shipmt.transit_time || '当'}${this.msg('day')}`} key="trans_schedule">
            <Timeline>
              <Timeline.Item color="blue" dot={<Icon type="circle-o-up" style={{ fontSize: '16px' }} />}>
                <p><strong>{this.msg('pickupEstDate')} {moment(shipmt.pickup_est_date).format('YYYY-MM-DD')}</strong></p>
                <p><strong>{shipmt.consigner_name || ''}</strong></p>
                <p>{`${renderConsignLoc(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`}</p>
                <p>{`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`}</p>
              </Timeline.Item>
              <Timeline.Item color="green" dot={<Icon type="circle-o-down" style={{ fontSize: '16px' }} />}>
                <p><strong>{this.msg('deliveryEstDate')} {moment(shipmt.deliver_est_date).format('YYYY-MM-DD')}</strong></p>
                <p><strong>{shipmt.consignee_name}</strong></p>
                <p>{`${renderConsignLoc(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`}</p>
                <p>{`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`}</p>
              </Timeline.Item>
            </Timeline>
          </Panel>
          <Panel header={`${this.msg('transitModeInfo')} ${shipmt.transport_mode}`} key="trans_mode">
            <Col span="24">
              <PaneFormItem labelCol={{ span: 3 }} label={this.msg('remark')}
                field={shipmt.remark} fieldCol={{ span: 21 }}
              />
            </Col>
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('vehicleType')}
                field={shipmt.vehicle_type} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ftl &&
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('vehicleLength')}
                field={shipmt.vehicle_length} fieldCol={{ span: 16 }}
              />
            </Col>
            }
            {shipmt.transport_mode_code === PRESET_TRANSMODES.ctn &&
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('containerNo')}
                field={shipmt.container_no} fieldCol={{ span: 16 }}
              />
            </Col>
            }
          </Panel>
          <Panel header={`${this.msg('goodsInfo')}  ${this.msg('totalCount')}: ${shipmt.total_count || ''} / ${this.msg('totalWeight')}: ${shipmt.total_weight || ''}${this.msg('kilogram')} / ${this.msg('totalVolume')}: ${shipmt.total_volume || ''}${this.msg('cubicMeter')}`} key="cargo">
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('goodsType')}
                field={shipmt.goods_type} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('insuranceValue')}
                field={shipmt.insure_value} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="24">
              <Table size="small" columns={this.columns} pagination={false}
                dataSource={shipmt.goodslist}
              />
            </Col>
          </Panel>
        </Collapse>
      </div>
    );
  }
}
