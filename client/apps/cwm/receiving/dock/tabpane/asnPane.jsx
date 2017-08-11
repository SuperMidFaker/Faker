import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Row, Col, Card, Table, Button, Popconfirm, Icon, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { CWM_ASN_TYPES, CWM_ASN_BONDED_REGTYPES, CWM_ASN_STATUS } from 'common/constants';
import { cancelAsn, closeAsn } from 'common/reducers/cwmReceive';
// import Strip from 'client/components/Strip';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }), { cancelAsn, closeAsn }
)
export default class ASNPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    asnHead: PropTypes.object.isRequired,
    asnBody: PropTypes.array.isRequired,
    cancelAsn: PropTypes.func.isRequired,
    closeAsn: PropTypes.func.isRequired,
  }
  state = {
    tabKey: '',
  }
  columns = [{
    title: '行号',
    dataIndex: 'asn_seq_no',
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
  }, {
    title: '计量单位',
    dataIndex: 'unit_name',
  }, {
    title: '单价',
    dataIndex: 'unit_price',
  }]
  handleComplete = (asnNo) => {
    this.props.closeAsn(asnNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  handleDeleteASN = (asnNo) => {
    this.props.cancelAsn(asnNo).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { asnHead } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }} noHovering>
          <Collapse bordered={false} defaultActiveKey={['main', 'asnDetails']}>
            <Panel header="主信息" key="main">
              <Row gutter={16} className="info-group-underline">
                <Col span="8">
                  <InfoItem label="货主" field={asnHead.owner_name} />
                </Col>
                <Col span="8">
                  <InfoItem label="ASN编号" field={asnHead.asn_no} />
                </Col>
                <Col span="8">
                  <InfoItem label="ASN类型" field={asnHead.asn_type && CWM_ASN_TYPES.find(item => item.value === asnHead.asn_type).text} />
                </Col>
                <Col span="8">
                  <InfoItem label="采购订单号" field={asnHead.po_no} />
                </Col>
                <Col span="8">
                  <InfoItem label="货物属性" field={asnHead.bonded ? '保税' : '非保税'} />
                </Col>
                <Col span="8">
                  <InfoItem label="保税监管方式" field={(asnHead.bonded_intype || asnHead.bonded_intype === 0) && CWM_ASN_BONDED_REGTYPES.find(item => item.value === asnHead.bonded_intype).text} />
                </Col>
                <Col span="8">
                  <InfoItem label="预期总数量" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="预期总体积" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="预计到货日期" addonBefore={<Icon type="calendar" />} field={asnHead.expect_receive_date && moment(asnHead.expect_receive_date).format('YYYY.MM.DD')} />
                </Col>
                <Col span="8">
                  <InfoItem label="收货总数量" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="收货总体积" field={''} />
                </Col>
                <Col span="8">
                  <InfoItem label="实际收货时间" addonBefore={<Icon type="clock-circle-o" />} field={asnHead.received_date && moment(asnHead.received_date).format('YYYY.MM.DD HH:mm')} />
                </Col>
              </Row>
            </Panel>
            <Panel header="ASN明细" key="asnDetails" >
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.columns} dataSource={this.props.asnBody} />
              </div>
            </Panel>
          </Collapse>
        </Card>
        <div>
          {(asnHead.status === CWM_ASN_STATUS.PENDING.value || asnHead.status === CWM_ASN_STATUS.INBOUND.value) &&
          (<Popconfirm title="确定取消订单?" onConfirm={() => this.handleDeleteASN(asnHead.asn_no)} okText="是" cancelText="否">
            <Button type="danger" size="large" icon="delete">
              取消订单
            </Button>
          </Popconfirm>)}
          {asnHead.status === CWM_ASN_STATUS.EXCEPTION.value &&
          (<Popconfirm title="确定关闭收货?" onConfirm={() => this.handleComplete(asnHead.asn_no)} okText="是" cancelText="否">
            <Button type="danger" size="large" icon="close-circle-o">
              关闭收货
            </Button>
          </Popconfirm>)}
        </div>
      </div>
    );
  }
}
