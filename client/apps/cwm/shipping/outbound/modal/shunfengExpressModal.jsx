import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Tabs, Card, Col, Row, Tooltip, Modal, Form, Input, Radio,
  Table, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadOutboundHead, updateOutboundMode, readWaybillLogo, loadCourierNo, toggleShunfengExpressModal } from 'common/reducers/cwmOutbound';
import messages from '../../message.i18n';
import { format } from 'client/common/i18n/helpers';
import { WaybillDef } from '../billsPrint/docDef';
import Cascader from 'client/components/RegionCascader';

const formatMsg = format(messages);
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const EXPRESS_TYPES = [
  { text: '顺丰标快', value: '1' },
  { text: '顺丰特惠', value: '2' },
  { text: '顺丰次晨', value: '5' },
  { text: '顺丰即日', value: '6' },
  { text: '重货快运', value: '18' },
  { text: '物流普运', value: '13' },
];

const PAY_METHODS = [
  { text: '寄付月结', value: '1' },
  { text: '到付', value: '2' },
  { text: '第三方付', value: '3' },
];

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    username: state.account.username,
    defaultWhse: state.cwmContext.defaultWhse,
    outboundHead: state.cwmOutbound.outboundFormHead,
    reload: state.cwmOutbound.outboundReload,
    waybill: state.cwmOutbound.waybill,
    outboundProducts: state.cwmOutbound.outboundProducts,
    visible: state.cwmOutbound.shunfengExpressModal.visible,
  }),
  { loadOutboundHead, updateOutboundMode, readWaybillLogo, loadCourierNo, toggleShunfengExpressModal }
)
export default class ShunfengExpressModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    updateOutboundMode: PropTypes.func.isRequired,
    toggleShunfengExpressModal: PropTypes.func.isRequired,
    outboundProducts: PropTypes.arrayOf(PropTypes.shape({ seq_no: PropTypes.string.isRequired })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

// 第一单：顺丰标快--寄付月结--保价；
// 第二单：顺丰特惠--到付--签回单；
// 第三单：顺丰次晨--第三方付--代收货款；
// 第四单：顺丰即日--寄付月结--子母件；
// 第五单：重货快运--寄付月结；
// 第六单：物流普运--寄付月结
  state = {
    printedPickingList: false,
    picking: false,
    picked: false,
    tabKey: 'orderDetails',
    expressNum: 0,


    receiver_phone: '15757129719',
    receiver_address: '物流大道浦东物流股份有限公司',
    receiver_contact: '徐天龙',
    receiver_province: '上海市',
    receiver_city: '市辖区',
    receiver_district: '浦东新区',
    receiver_street: '',

    sender_phone: '15757129719',
    sender_address: '物流大道浦东物流股份有限公司',
    sender_contact: '徐天龙',
    sender_province: '上海市',
    sender_city: '市辖区',
    sender_district: '浦东新区',
    sender_street: '',

    express_type: '13',
    pay_method: '1',
    insure: 0,
    weight: 0,
    custid: '',
    product_name: '',
    product_qty: 0,
    pack_qty: 0,
    need_return_tracking_no: '0',
  }
  componentWillMount() {
    this.props.readWaybillLogo();
  }
  componentDidMount() {
    let script;
    if (!document.getElementById('pdfmake-min')) {
      script = document.createElement('script');
      script.id = 'pdfmake-min';
      script.src = `${__CDN__}/assets/pdfmake/pdfmake.min.js`;
      script.async = true;
      document.body.appendChild(script);
    }
    if (!document.getElementById('pdfmake-vfsfont')) {
      script = document.createElement('script');
      script.id = 'pdfmake-vfsfont';
      script.src = `${__CDN__}/assets/pdfmake/vfs_fonts.js`;
      script.async = true;
      document.body.appendChild(script);
    }
  }
  msg = key => formatMsg(this.props.intl, key);

  handleWaybillPrint = (courierNo, courierNoSon, seq) => {
    const { outboundHead, outboundProducts } = this.props;
    const expressType = EXPRESS_TYPES.find(item => item.value === this.state.express_type).text;
    const payMethod = PAY_METHODS.find(item => item.value === this.state.pay_method).text;
    const whseInfo = {
      phone: this.state.phone,
      address: this.state.address,
      contact: this.state.contact,
      province: this.state.province,
      city: this.state.city,
      district: this.state.district,
      street: this.state.street,

      express_type: expressType,
      pay_method: payMethod,
      return_tracking_no: '',
    };
    this.setState({
      printedPickingList: true,
    });
    const { expressNum } = this.state;
    // podWaybillDef
    // const docDefinition = podWaybillDef({
    //   ...this.props.waybill,
    //   courierNo,
    //   courierNoSon,
    //   expressNum,
    //   seq,
    //   outboundHead: {...outboundHead, origincode: '021'},
    //   whseInfo,
    //   productName: `${outboundProducts[0] ? outboundProducts[0].name : ''} ${outboundHead.total_qty}`
    // });
    const docDefinition = WaybillDef({
      ...this.props.waybill,
      courierNo,
      courierNoSon,
      expressNum: Number(expressNum),
      seq,
      outboundHead: { ...outboundHead, origincode: '021' },
      whseInfo,
      productName: `${outboundProducts[0] ? outboundProducts[0].name : ''} ${outboundHead.total_qty}`,
    });
    window.pdfMake.fonts = {
      selfFont: {
        normal: 'msyh.ttf',
        bold: 'msyh.ttf',
        italics: 'frutigel.ttf',
      },
    };
    window.pdfMake.createPdf(docDefinition).open();
  }
  handleTabChange = (tabKey) => {
    this.setState({
      tabKey,
    });
  }
  loadCourierNo = () => {
    const { outboundHead, outboundProducts } = this.props;
    const expressInfo = {
      phone: this.state.phone,
      address: this.state.address,
      contact: this.state.contact,
      province: this.state.province,
      city: this.state.city,
      district: this.state.district,
      street: this.state.street,
      whse_name: this.props.defaultWhse.name,
      express_type: this.state.express_type,
      pay_method: this.state.pay_method,
      productName: `${outboundProducts[0] ? outboundProducts[0].name : ''} ${outboundHead.total_qty}`,
    };
    this.props.loadCourierNo({
      soNo: this.props.outboundHead.so_no,
      outboundNo: this.props.params.outboundNo,
      tenantId: this.props.tenantId,
      expressNum: Number(this.state.expressNum),
      expressInfo,
    }).then(() => {
      this.props.loadOutboundHead(this.props.params.outboundNo);
    });
  }
  handleReceiverRegionChange = (value) => {
    this.setState({
      receiver_province: value[1],
      receiver_city: value[2],
      receiver_district: value[3],
      receiver_street: value[4],
    });
  }
  handleSenderRegionChange = (value) => {
    this.setState({
      sender_province: value[1],
      sender_city: value[2],
      sender_district: value[3],
      sender_street: value[4],
    });
  }
  render() {
    const { outboundHead } = this.props;
    const courierNo = outboundHead.courier_no ? outboundHead.courier_no.split(',') : [];
    const dataSource = courierNo.map((item, index) => {
      if (index === 0) {
        return {
          courier_no: item,
        };
      } else {
        return {
          courier_no: item,
        };
      }
    });
    const columns = [{
      width: 180,
      dataIndex: 'courier_no',
      render: (col, row, index) => {
        if (index === 0) {
          return <Tooltip title="母单号"><strong>{col}</strong></Tooltip>;
        }
        return <Tooltip title="子单号">{col}</Tooltip>;
      },
    }, {
      width: 80,
      render: (col, row, index) => (<a onClick={() => this.handleWaybillPrint(courierNo[0], row.courier_no, index + 1)}><Icon type="printer" /></a>),
    }];
    const receiverRegionValues = [this.state.receiver_province, this.state.receiver_city,
      this.state.receiver_district, this.state.receiver_street];
    const senderRegionValues = [this.state.sender_province, this.state.sender_city,
      this.state.sender_district, this.state.sender_street];

    return (
      <Modal title="顺丰快递单打印" visible={this.props.visible} width={700}
        onCancel={() => this.props.toggleShunfengExpressModal(false)}
        onOk={() => this.props.toggleShunfengExpressModal(false)}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="订单信息" key="1">
            <Row>
              <Col span={12}>
                <FormItem label="快递类型" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select placeholder="快递类型" value={this.state.express_type} onChange={value => this.setState({ express_type: value })} style={{ width: '100%' }}>
                    {EXPRESS_TYPES.map(item => (<Option value={item.value}>{item.text}</Option>))}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12} >
                <FormItem label="签单返还" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <RadioGroup value={this.state.need_return_tracking_no}
                    onChange={value => this.setState({ need_return_tracking_no: value })} style={{ width: '100%' }}
                  >
                    <RadioButton value="0">否</RadioButton>
                    <RadioButton value="1">是</RadioButton>
                  </RadioGroup>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="付款方式" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select placeholder="付款方式" value={this.state.pay_method} onChange={value => this.setState({ pay_method: value })} style={{ width: '100%' }}>
                    {PAY_METHODS.map(item => (<Option value={item.value}>{item.text}</Option>))}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="月结卡号" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.custid} onChange={e => this.setState({ custid: e.target.value })} />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="增值服务" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select placeholder="增值服务" value={this.state.pay_method} onChange={value => this.setState({ pay_method: value })} style={{ width: '100%' }}>
                    {PAY_METHODS.map(item => (<Option value={item.value}>{item.text}</Option>))}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="保价金额" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.insure} type="number" onChange={e => this.setState({ insure: e.target.value })} />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="装箱数量" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.pack_qty} type="number" onChange={e => this.setState({ pack_qty: e.target.value })} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="托寄物" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.product_name} onChange={e => this.setState({ product_name: e.target.value })} />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="重量" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.weight} onChange={e => this.setState({ weight: e.target.value })} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="总件数" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.product_qty} type="number" onChange={e => this.setState({ product_qty: e.target.value })} />
                </FormItem>
              </Col>
            </Row>
            <Card>
              <Row>
                <Col span={12}>
                  <FormItem label="收货人" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Input value={this.state.receiver_contact} placeholder="收货人"
                      onChange={e => this.setState({ receiver_contact: e.target.value })}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="电话" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Input value={this.state.receiver_phone} placeholder="电话"
                      onChange={e => this.setState({ receiver_phone: e.target.value })}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label="地址" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Cascader defaultRegion={receiverRegionValues} onChange={this.handleReceiverRegionChange} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="详细地址" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Input value={this.state.receiver_address}
                      onChange={e => this.setState({ receiver_address: e.target.value })}
                    />
                  </FormItem>
                </Col>
              </Row>
            </Card>
            <Card>
              <Row>
                <Col span={12}>
                  <FormItem label="发货人" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Input value={this.state.sender_contact} placeholder="发货人"
                      onChange={e => this.setState({ sender_contact: e.target.value })}
                    />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="电话" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Input value={this.state.sender_phone} placeholder="电话"
                      onChange={e => this.setState({ sender_phone: e.target.value })}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <FormItem label="地址" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Cascader defaultRegion={senderRegionValues} onChange={this.handleSenderRegionChange} />
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem label="详细地址" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                    <Input value={this.state.sender_address}
                      onChange={e => this.setState({ sender_address: e.target.value })}
                    />
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </TabPane>
          <TabPane tab="快递单号" key="2">
            <Table dataSource={dataSource} columns={columns} showHeader={false} size="small" pagination={false} />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
