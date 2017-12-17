import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Row, Col, Card, Table, Menu, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { loadCarriers } from 'common/reducers/cwmWarehouse';
import { updateSoHead } from 'common/reducers/cwmShippingOrder';
import { CWM_SO_TYPES, CWM_SO_BONDED_REGTYPES, DELIVER_TYPES, COURIERS } from 'common/constants';
// import Strip from 'client/components/Strip';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(state => ({
  loginId: state.account.loginId,
  order: state.crmOrders.dock.order,
  defaultWhse: state.cwmContext.defaultWhse,
  carriers: state.cwmWarehouse.carriers,
}), { loadCarriers, updateSoHead })
export default class SOPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    soHead: PropTypes.object.isRequired,
    soBody: PropTypes.array.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    tabKey: '',
  }
  componentWillMount() {
    this.props.loadCarriers(this.props.defaultWhse.code);
  }
  columns = [{
    title: '行号',
    dataIndex: 'so_seq_no',
    width: 50,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 200,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '订单数量',
    width: 100,
    dataIndex: 'order_qty',
    align: 'right',
  }, {
    title: '计量单位',
    dataIndex: 'unit_name',
    align: 'center',
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
  }]
  handleDeliveryTypeUpdate = (ev) => {
    const { soHead } = this.props;
    const value = ev.key;
    this.props.updateSoHead(soHead.so_no, {
      delivery_type: value,
      carrier_code: '',
      carrier_name: '',
    }).then((result) => {
      if (!result.error) {
        this.props.reload(soHead.so_no);
        message.success('修改成功');
      }
    });
  }
  handleCarrierUpdate = (ev) => {
    const { carriers, soHead } = this.props;
    if (!soHead.delivery_type) {
      message.error('先选择配送方式');
      return;
    }
    const value = ev.value;
    let carrier;
    if (soHead.delivery_type !== 3) {
      carrier = carriers.filter(item => item.owner_partner_id === soHead.owner_partner_id).find(item => item.code === value);
    } else {
      carrier = COURIERS.find(item => item.code === value);
    }
    if (carrier) {
      this.props.updateSoHead(soHead.so_no, { carrier_name: carrier.name, carrier_code: carrier.code }).then((result) => {
        if (!result.error) {
          this.props.reload(soHead.so_no);
          message.success('修改成功');
        }
      });
    }
  }
  handleExpressNoUpdate = (value) => {
    this.props.updateSoHead(this.props.soHead.so_no, { express_no: value }).then((result) => {
      if (!result.error) {
        this.props.reload(this.props.soHead.so_no);
        message.success('修改成功');
      }
    });
  }
  render() {
    const { soHead, carriers } = this.props;
    const contactNumber = `${soHead.receiver_phone || ''} ${soHead.receiver_number || ''}`;
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }} hoverable={false}>
          <Collapse bordered={false} defaultActiveKey={['main', 'receiver', 'carrier']}>
            <Panel header="主信息" key="main">
              <Row gutter={16} className="info-group-underline">
                <Col span="8">
                  <InfoItem label="货主" field={soHead.owner_name} />
                </Col>
                <Col span="8">
                  <InfoItem label="SO编号" field={soHead.so_no} />
                </Col>
                <Col span="8">
                  <InfoItem label="SO类型" field={soHead.so_type && CWM_SO_TYPES.find(item => item.value === soHead.so_type).text} />
                </Col>
                <Col span="8">
                  <InfoItem label="客户单号" field={soHead.cust_order_no} />
                </Col>
                <Col span="8">
                  <InfoItem label="货物属性" field={soHead.bonded ? '保税' : '非保税'} />
                </Col>
                <Col span="8">
                  <InfoItem label="保税监管方式" field={(soHead.bonded_intype || soHead.bonded_intype === 0) && CWM_SO_BONDED_REGTYPES.find(item => item.value === soHead.bonded_intype).text} />
                </Col>
                <Col span="8">
                  <InfoItem label="预期发货日期" field={moment(soHead.expect_shipping_date).format('YYYY.MM.DD')} />
                </Col>
              </Row>
            </Panel>
            <Panel header="收货人" key="receiver">
              <Row gutter={16} className="info-group-underline">
                <Col span="8">
                  <InfoItem label="收货人" field={soHead.receiver_name} />
                </Col>
                <Col span="8">
                  <InfoItem label="联系人" field={soHead.receiver_contact} />
                </Col>
                <Col span="8">
                  <InfoItem label="联系方式" field={contactNumber} />
                </Col>
                <Col span="24">
                  <InfoItem label="地址" field={soHead.receiver_address} />
                </Col>
              </Row>
            </Panel>
            <Panel header="承运人" key="carrier">
              <Row gutter={16} className="info-group-underline">
                <Col span="8">
                  <InfoItem
                    label="配送方式"
                    field={soHead.delivery_type && DELIVER_TYPES.find(item => item.value === soHead.delivery_type).name}
                    editable
                    type="dropdown"
                    overlay={<Menu onClick={this.handleDeliveryTypeUpdate}>
                      {DELIVER_TYPES.map(item => (<Menu.Item key={item.value}>{item.name}</Menu.Item>))}
                    </Menu>}
                  />
                </Col>
                <Col span="8">
                  <InfoItem
                    label="承运人"
                    field={soHead.carrier_name}
                    editable
                    type="dropdown"
                    overlay={<Menu onClick={this.handleCarrierUpdate}>
                      {soHead.delivery_type !== 3 ?
                                carriers.map(c => (<Menu.Item key={c.code}>{c.name}</Menu.Item>)) :
                                COURIERS.map(c => (<Menu.Item key={c.code}>{c.name}</Menu.Item>))}
                    </Menu>}
                  />
                </Col>
                <Col span="8">
                  <InfoItem label="运单号" field={soHead.express_no} editable onEdit={this.handleExpressNoUpdate} />
                </Col>
              </Row>
            </Panel>
            <Panel header="SO明细" key="asnDetails" >
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.columns} dataSource={this.props.soBody} />
              </div>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
