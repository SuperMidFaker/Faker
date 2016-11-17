import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Col, Table, Collapse, Timeline, Icon, Tabs } from 'antd';
import { format } from 'client/common/i18n/helpers';
import { PRESET_TRANSMODES } from 'common/constants';
import messages from '../../message.i18n';
import './pane.less';
import { renderConsignLoc } from '../../../../transport/common/consignLocation';
import { loadTransportDetail } from 'common/reducers/crmOrders';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const TimelineItem = Timeline.Item;
const TabPane = Tabs.TabPane;

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
  const labelCls = `info-label ${getColCls(labelCol)}`;
  const fieldCls = `info-data ${getColCls(fieldCol)}`;
  return (
    <div className="info-item">
      <div className={labelCls}>{label}：</div>
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
    transports: state.crmOrders.previewer.transports,
    goodsTypes: state.crmOrders.formRequires.goodsTypes,
    packagings: state.crmOrders.formRequires.packagings,
    containerPackagings: state.crmOrders.formRequires.containerPackagings,
    shipmtNos: state.crmOrders.previewer.order.trs_shipmt_no || '',
  }),
  { loadTransportDetail }
)
export default class TransportPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    transports: PropTypes.array.isRequired,
    goodsTypes: PropTypes.array.isRequired,
    packagings: PropTypes.array.isRequired,
    containerPackagings: PropTypes.array.isRequired,
    shipmtNos: PropTypes.string.isRequired,
    loadTransportDetail: PropTypes.func.isRequired,
  }
  state = {
    tabKey: '',
  }

  componentWillMount() {
    const { tenantId, shipmtNos, transports } = this.props;
    if (shipmtNos) {
      this.props.loadTransportDetail({ tenantId, shipmtNos });
    }
    const tabKey = transports[0] ? transports[0].shipmt_no : '';
    this.setState({
      tabKey,
    });
  }
  componentWillReceiveProps(nextProps) {
    const { tenantId, shipmtNos, transports } = nextProps;
    if (shipmtNos && shipmtNos !== this.props.shipmtNos) {
      this.props.loadTransportDetail({ tenantId, shipmtNos });
    }
    const tabKey = transports[0] ? transports[0].shipmt_no : '';
    this.setState({
      tabKey,
    });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
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
  handleChangeTab = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  renderConsignPort(province, city, district) {
    if (city === '市辖区' || city === '县') {
      return `${province},${district}`;
    } else {
      return `${province},${city}`;
    }
  }
  renderShipmt = (shipmt) => {
    const { goodsTypes, packagings, containerPackagings } = this.props;
    const apackagings = shipmt.transport_mode_code === 'CTN' ? containerPackagings : packagings.map(pk => ({
      key: pk.package_code,
      value: pk.package_name,
    }));
    const pckg = apackagings.find(item => item.key === shipmt.package);
    const goodsType = goodsTypes.find(item => item.value === shipmt.goods_type);
    const clientInfo = this.msg('customerInfo');
    const shipmtSchedule = `${this.msg('shipmtSchedule')} ${shipmt.transit_time || '当'}${this.msg('day')}`;
    const transitModeInfo = `${this.msg('transitModeInfo')} ${shipmt.transport_mode}`;
    const goodsInfo = `${this.msg('goodsInfo')}  ${this.msg('totalCount')}: ${shipmt.total_count || ''} / ${this.msg('totalWeight')}: ${shipmt.total_weight || ''}${this.msg('kilogram')} / ${this.msg('totalVolume')}: ${shipmt.total_volume || ''}${this.msg('cubicMeter')}`;

    return (
      <div className="pane-content tab-pane">
        <Collapse defaultActiveKey={['customer', 'trans_schedule', 'trans_mode']}>
          <Panel header={clientInfo} key="customer">
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('client')}
                field={shipmt.customer_name} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refExternalNo')}
                field={shipmt.ref_external_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refWaybillNo')}
                field={shipmt.ref_waybill_no} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="12">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('refEntryNo')}
                field={shipmt.ref_entry_no} fieldCol={{ span: 16 }}
              />
            </Col>
          </Panel>
          <Panel header={shipmtSchedule} key="trans_schedule">
            <Timeline>
              <TimelineItem color="blue" dot={<Icon type="circle-o-up" style={{ fontSize: '16px' }} />}>
                <p><strong>{this.msg('pickupEstDate')} {moment(shipmt.pickup_est_date).format('YYYY-MM-DD')}</strong></p>
                <p><strong>{shipmt.consigner_name || ''}</strong></p>
                <p>{`${renderConsignLoc(shipmt, 'consigner')} ${shipmt.consigner_addr || ''}`}</p>
                <p>{`${shipmt.consigner_contact || ''} ${shipmt.consigner_mobile || ''}`}</p>
              </TimelineItem>
              <TimelineItem color="blue" dot={<Icon type="retweet" style={{ fontSize: '16px' }} />}>
                <p>中转地</p>
              </TimelineItem>
              <TimelineItem color="green" dot={<Icon type="circle-o-down" style={{ fontSize: '16px' }} />}>
                <p><strong>{this.msg('deliveryEstDate')} {moment(shipmt.deliver_est_date).format('YYYY-MM-DD')}</strong></p>
                <p><strong>{shipmt.consignee_name}</strong></p>
                <p>{`${renderConsignLoc(shipmt, 'consignee')} ${shipmt.consignee_addr || ''}`}</p>
                <p>{`${shipmt.consignee_contact || ''} ${shipmt.consignee_mobile || ''}`}</p>
              </TimelineItem>
            </Timeline>
          </Panel>
          <Panel header={transitModeInfo} key="trans_mode">
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
          <Panel header={goodsInfo} key="cargo">
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('goodsType')}
                field={goodsType ? goodsType.text : shipmt.goods_type} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
              <PaneFormItem labelCol={{ span: 8 }} label={this.msg('goodsPackage')}
                field={pckg ? pckg.value : shipmt.package} fieldCol={{ span: 16 }}
              />
            </Col>
            <Col span="8">
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
  render() {
    const { transports } = this.props;
    return (
      <div>
        <Tabs activeKey={this.state.tabKey} tabPosition="left" onChange={this.handleChangeTab}>
          {transports.map((item) => {
            return (
              <TabPane tab={item.shipmt_no} key={item.shipmt_no}>
                {this.renderShipmt(item)}
              </TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }
}
