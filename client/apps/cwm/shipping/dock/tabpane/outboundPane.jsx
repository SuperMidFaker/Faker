import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card, Table, Button, Tag, Icon } from 'antd';
import QuantityInput from '../../../common/quantityInput';
import { loadPickDetails, loadPackDetails, loadShipDetails } from 'common/reducers/cwmOutbound';
import { } from 'common/constants';
// import InfoItem from 'client/components/InfoItem';
// import { MdIcon } from 'client/components/FontIcon';

const Panel = Collapse.Panel;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    order: state.crmOrders.dock.order,
    pickDetails: state.cwmOutbound.pickDetails,
    packDetails: state.cwmOutbound.packDetails,
    shipDetails: state.cwmOutbound.shipDetails,
  }), { loadPickDetails, loadPackDetails, loadShipDetails }
)
export default class InboundPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    tabKey: '',
    pickDetails: [],
  }
  componentWillMount() {
    this.props.loadPickDetails(this.props.outboundNo);
    this.props.loadPackDetails(this.props.outboundNo);
    this.props.loadShipDetails(this.props.outboundNo);
  }
  pickColumns = [{
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button size="small">{o}</Button>;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '库位',
    dataIndex: 'location',
    width: 100,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '分配数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.alloc_qty / record.sku_pack_qty} pcsQty={record.alloc_qty} disabled />),
  }, {
    title: '拣货数量',
    width: 200,
    render: (o, record) => (<QuantityInput size="small" packQty={record.picked_qty / record.sku_pack_qty} pcsQty={record.picked_qty} disabled />),
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,

  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '分配人员',
    width: 100,
    dataIndex: 'alloc_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '分配时间',
    width: 100,
    dataIndex: 'alloc_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }, {
    title: '拣货人员',
    width: 100,
    dataIndex: 'picked_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '拣货时间',
    width: 100,
    dataIndex: 'picked_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }]
  packColumns = [{
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
    fixed: 'left',
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button size="small">{o}</Button>;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '装箱数量',
    dataIndex: 'chkpacked_qty',
    width: 200,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,

  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    width: 150,
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '复核装箱人员',
    width: 100,
    dataIndex: 'chkpacked_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '复核装箱时间',
    width: 100,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }]
  shipColumns = [{
    title: '装车/配送单号',
    dataIndex: 'waybill',
    width: 150,
  }, {
    title: 'DropID',
    dataIndex: 'drop_id',
    width: 150,
  }, {
    title: '箱号',
    dataIndex: 'packed_no',
    width: 150,
  }, {
    title: 'SKU',
    dataIndex: 'product_sku',
    width: 120,
    render: (o) => {
      if (o) {
        return <Button size="small">{o}</Button>;
      }
    },
  }, {
    title: '批次号',
    dataIndex: 'external_lot_no',
    width: 100,
  }, {
    title: '发货数量',
    dataIndex: 'shipped_qty',
    width: 200,
  }, {
    title: '商品货号',
    dataIndex: 'product_no',
    width: 120,
  }, {
    title: '中文品名',
    dataIndex: 'name',
    width: 150,

  }, {
    title: '库别',
    dataIndex: 'virtual_whse',
    render: (o) => {
      if (o) {
        return <Tag>{o}</Tag>;
      }
    },
  }, {
    title: '发货人员',
    width: 100,
    dataIndex: 'shipped_by',
    render: (o) => {
      if (o) {
        return (<div><Icon type="user" />{o}</div>);
      }
    },
  }, {
    title: '发货时间',
    width: 100,
    dataIndex: 'created_date',
    render: (o) => {
      if (o) {
        return (<div>{moment(o).format('MM.DD HH:mm')}</div>);
      }
    },
  }]
  render() {
    const { pickDetails, packDetails, shipDetails } = this.props;
    return (
      <div className="pane-content tab-pane">
        <Card bodyStyle={{ padding: 0 }}>
          <Collapse bordered={false} defaultActiveKey={'pickDetails'}>
            <Panel header="拣货明细" key="pickDetails" >
              <Table columns={this.pickColumns} dataSource={pickDetails} scroll={{ x: 1000 }} />
            </Panel>
            <Panel header="装箱明细" key="packDetails" >
              <Table columns={this.packColumns} dataSource={packDetails} scroll={{ x: 1000 }} />
            </Panel>
            <Panel header="发货明细" key="shipDetails" >
              <Table columns={this.shipColumns} dataSource={shipDetails} scroll={{ x: 1000 }} />
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
