import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Row, Col, Card, Table, Button, message } from 'antd';
import InfoItem from 'client/components/InfoItem';
import { CWM_SO_TYPES, CWM_SO_STATUS } from 'common/constants';
import { cancelOutbound } from 'common/reducers/cwmShippingOrder';
// import Strip from 'client/components/Strip';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    order: state.crmOrders.dock.order,
  }), { cancelOutbound }
)
export default class SOPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    soHead: PropTypes.object.isRequired,
    soBody: PropTypes.array.isRequired,
    cancelOutbound: PropTypes.func.isRequired,
  }
  state = {
    tabKey: '',
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
  }, {
    title: '计量单位',
    dataIndex: 'unit_name',
  }, {
    title: '单价',
    dataIndex: 'unit_price',
  }]
  cancelOutbound = (soNo) => {
    this.props.cancelOutbound({
      so_no: soNo,
      login_id: this.props.loginId,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      }
    });
  }
  render() {
    const { soHead } = this.props;
    const keys = Object.keys(CWM_SO_STATUS);
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={['main', 'asnDetails']}>
            <Panel header="主信息" key="main">
              <Row gutter={16} className="info-group-underline">
                <Col span="8">
                  <InfoItem label="SO编号" field={soHead.so_no} />
                </Col>
                <Col span="8">
                  <InfoItem label="SO类型" field={soHead.so_type && CWM_SO_TYPES.find(item => item.value === soHead.so_type).text} />
                </Col>
                <Col span="8">
                  <InfoItem label="货主" field={soHead.owner_name} />
                </Col>
                <Col span="8">
                  <InfoItem label="状态" field={(soHead.status || soHead.status === 0) && CWM_SO_STATUS[keys[soHead.status]].text} />
                </Col>
                <Col span="8">
                  <InfoItem label="货物属性" field={soHead.bonded ? '保税' : '非保税'} />
                </Col>
                <Col span="8">
                  <InfoItem label="订单总数量" field={soHead.total_qty} />
                </Col>
                <Col span="8">
                  <InfoItem label="总发货数量" field={soHead.total_shipped_qty} />
                </Col>
                <Col span="8">
                  <InfoItem label="预期发货日期" field={moment(soHead.expect_shipped_date).format('YYYY.MM.DD')} />
                </Col>
                <Col span="8">
                  <InfoItem label="创建日期" field={moment(soHead.created_date).format('YYYY.MM.DD')} />
                </Col>
              </Row>
            </Panel>
            <Panel header="SO明细" key="asnDetails" >
              <Table size="middle" columns={this.columns} dataSource={this.props.soBody} />
            </Panel>
          </Collapse>
        </Card>
        <div>
          {(soHead.status === CWM_SO_STATUS.PENDING.value || soHead.status === CWM_SO_STATUS.OUTBOUND.value) &&
          (<Button type="danger" size="large" icon="delete" onClick={() => this.cancelOutbound(soHead.so_no)}>
            取消订单
          </Button>)}
          {soHead.status === CWM_SO_STATUS.PARTIAL.value &&
          (<Button type="danger" size="large" icon="delete">
            关闭收货
          </Button>)}
        </div>
      </div>
    );
  }
}
