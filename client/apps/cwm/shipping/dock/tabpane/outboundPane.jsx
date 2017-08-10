import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, Card, Table, Button, Tag, Icon } from 'antd';
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.outboundNo !== this.props.outboundNo) {
      this.props.loadPickDetails(nextProps.outboundNo);
      this.props.loadPackDetails(nextProps.outboundNo);
      this.props.loadShipDetails(nextProps.outboundNo);
    }
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
    dataIndex: 'alloc_qty',
    width: 100,
  }, {
    title: '拣货数量',
    dataIndex: 'picked_qty',
    width: 100,
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
    width: 100,
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
    width: 100,
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
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.pickColumns} dataSource={pickDetails} scroll={{ x: 1400 }} />
              </div>
            </Panel>
            <Panel header="装箱明细" key="packDetails" >
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.packColumns} dataSource={packDetails} scroll={{ x: 1400 }} />
              </div>
            </Panel>
            <Panel header="发货明细" key="shipDetails" >
              <div className="table-panel table-fixed-layout">
                <Table size="middle" columns={this.shipColumns} dataSource={shipDetails} scroll={{ x: 1400 }} />
              </div>
            </Panel>
          </Collapse>
        </Card>
      </div>
    );
  }
}
