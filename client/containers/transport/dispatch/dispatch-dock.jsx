import React, { PropTypes } from 'react';
import { Icon, QueueAnim, Tag, Collapse, InputNumber, Button, Table } from 'ant-ui';

const Panel = Collapse.Panel;

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

function noop() {}

export default class DispatchDock extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    msg: PropTypes.func.isRequired,
    shipmts: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.msg = this.props.msg || noop;
    this.onClose = this.props.onClose || noop;
    this.consigneeCols = [{
                title: '',
                dataIndex: 'partner_tenant_id',
                render: (tid, record) => (<Button type={`${record.partner_tenant_id > 0 ? 'primary' : 'ghost'}`} shape="circle" size="small"></Button>)
              }, {
                title: '承运商',
                dataIndex: 'partner_name'
              }, {
                title: '价格协议',
                dataIndex: 'quotation_promise',
                render: () => (<span></span>)
              }, {
                title: '运输时效',
                dataIndex: 'transit',
                render: () => (<span></span>)
              }, {
                title: '报价（元）',
                dataIndex: 'quotation',
                render: () => (<InputNumber min={0} onChange={this.handleQuotationChange} />)
              }, {
                title: this.msg('shipmtOP'),
                width: 100,
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={this.handleShipmtDispatch(record.partner_tenant_id)}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
    this.vehicleCols = [{
                title: '车牌',
                dataIndex: 'plate_number'
              }, {
                title: '司机',
                dataIndex: 'driver_name'
              }, {
                title: '车型',
                dataIndex: 'type'
              }, {
                title: '车长',
                dataIndex: 'length'
              }, {
                title: '载重',
                dataIndex: 'load'
              }, {
                title: '已分配',
                dataIndex: 'dispatched'
              }, {
                title: '在途',
                dataIndex: 'driving'
              }, {
                title: this.msg('shipmtOP'),
                render: (o, record) => {
                  return (<span>
                        <a role="button" onClick={this.handleShipmtDispatch(record.partner_tenant_id)}>
                        {this.msg('btnTextDispatch')}
                        </a></span>);
                }
              }];
  }

  componentWillMount() {

  }

  handleShipmtDispatch = (tid) => {

  }

  handleQuotationChange() {

  }

  handlePanelChange(key) {
    console.log(key);
  }

  render() {
    const { show, shipmts } = this.props;
    let dock = '';
    if (show) {
      const arr = [];
      let close = true;
      let totalCount = 0;
      let totalWeight = 0;
      let totalVolume = 0;
      if (shipmts.length === 1) {
        close = false;
      }
      shipmts.forEach(v => {
        arr.push((<Tag closable={close} color="blue">{v.shipmt_no}</Tag>));
        if (!isNaN(v.total_count)) {
          totalCount += v.total_count;
        }
        if (!isNaN(v.total_weight)) {
          totalWeight += v.total_weight;
        }
        if (!isNaN(v.total_volume)) {
          totalVolume += v.total_volume;
        }
      });

      dock = (<div className="dock-container" key="dock1">
                <div className="dock-content">
                  <div className="dock-sp-line"></div>
                  <div className="dock-sp">
                    <div className="dock-sp-body">
                      <div className="dock-sp-toolbar">
                        <a onClick={() => this.onClose() }><Icon type="cross" className="closable"/></a>
                        <div className="shipno-container">
                          <span className="detail-title">共 {shipmts.length} 订单，{totalCount}件，{totalWeight}公斤，{totalVolume}立方</span>
                          {arr}
                        </div>
                      </div>
                      <div className="dock-sp-content">
                        <Collapse defaultActiveKey={['1']} onChange={this.handlePanelChange}>
                          <Panel header="选择承运商" key="1">
                            <Table columns={this.consigneeCols} dataSource={[]} />
                          </Panel>
                          <Panel header="选择车辆" key="2">
                            <Table columns={this.vehicleCols} dataSource={[]} />
                          </Panel>
                          <Panel header="询价" key="3">
                            <div></div>
                          </Panel>
                        </Collapse>
                      </div>
                    </div>
                  </div>
                </div>
              </div>);
    }

    return (
      <QueueAnim key="dockcontainer" animConfig={{translateX:[0, 600], opacity:[1, 1]}}>{dock}</QueueAnim>
    );
  }
}
