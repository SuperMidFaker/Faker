import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Tabs, Card, Col, Row, Tooltip, Modal, Form, Input, Radio, Button,
  Table, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { loadOutboundHead, updateOutboundMode, readWaybillLogo, orderExpress, toggleShunfengExpressModal,
loadExpressInfo, addZD } from 'common/reducers/cwmOutbound';
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

const ADDED_SERVICES = [
  { text: '代收货款', value: 'COD' },
  { text: '保价', value: 'INSURE' },
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
  { loadOutboundHead, updateOutboundMode, readWaybillLogo, orderExpress, toggleShunfengExpressModal, loadExpressInfo, addZD }
)
export default class ShunfengExpressModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    updateOutboundMode: PropTypes.func.isRequired,
    toggleShunfengExpressModal: PropTypes.func.isRequired,
    outboundProducts: PropTypes.arrayOf(PropTypes.shape({ seq_no: PropTypes.string.isRequired })),
    loadExpressInfo: PropTypes.func.isRequired,
    addZD: PropTypes.func.isRequired,
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
    tabkey: '1',

    receiver_phone: '',
    receiver_address: '',
    receiver_contact: '',
    receiver_province: '',
    receiver_city: '',
    receiver_district: '',
    receiver_street: '',
    receiver_region_code: null,

    sender_phone: '',
    sender_address: '',
    sender_contact: '',
    sender_province: '',
    sender_city: '',
    sender_district: '',
    sender_street: '',
    sender_region_code: null,

    express_type: '13',
    pay_method: '1',
    insure_value: 0,
    weight: 0,
    custid: '',
    product_name: '',
    product_qty: 0,
    parcel_quantity: 1,
    need_return_tracking_no: '0',
    added_services: '',
    cod_value: 0,
    cod_card_id: '',

    mailno: '',
    return_tracking_no: '',
    origincode: '',
    destcode: '',
    filter_result: '',
    remark: '',
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
  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.loadExpresseInfo();
    }
  }
  loadExpresseInfo = () => {
    this.props.loadExpressInfo(this.props.outboundHead.outbound_no).then((result) => {
      if (result.data) {
        this.setState({ ...result.data, tabkey: '2' });
      } else {
        const { defaultWhse, outboundHead, outboundProducts } = this.props;
        this.setState({
          sender_phone: '',
          sender_address: defaultWhse.whse_address,
          sender_contact: '',
          sender_province: defaultWhse.whse_province,
          sender_city: defaultWhse.whse_city,
          sender_district: defaultWhse.whse_district,
          sender_street: defaultWhse.whse_street,
          sender_region_code: defaultWhse.whse_region_code,

          receiver_phone: outboundHead.receiver_phone || outboundHead.receiver_number,
          receiver_address: outboundHead.receiver_address,
          receiver_contact: outboundHead.receiver_contact,
          receiver_province: outboundHead.receiver_province,
          receiver_city: outboundHead.receiver_city,
          receiver_district: outboundHead.receiver_district,
          receiver_street: outboundHead.receiver_street,
          receiver_region_code: outboundHead.receiver_region_code,

          product_name: outboundProducts[0] ? outboundProducts[0].name : '',
        });
      }
    });
  }
  handleAddZD = () => {
    const { outboundHead, loginId } = this.props;
    this.props.addZD({ outboundNo: outboundHead.outbound_no, loginId, expressNum: 1 }).then(() => {
      this.loadExpresseInfo();
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleTabChange = (tabkey) => {
    this.setState({ tabkey });
  }
  handleWaybillPrint = (courierNo, courierNoSon, seq) => {
    const expressType = EXPRESS_TYPES.find(item => item.value === this.state.express_type).text;
    const payMethod = PAY_METHODS.find(item => item.value === this.state.pay_method).text;
    const expressInfo = {
      express_type: expressType,
      pay_method: payMethod,
      insure_value: Number(this.state.insure_value),
      weight: this.state.weight,
      custid: this.state.custid,
      product_name: this.state.product_name,
      product_qty: this.state.product_qty,
      parcel_quantity: this.state.parcel_quantity,
      need_return_tracking_no: this.state.need_return_tracking_no,
      added_services: this.state.added_services,

      sender_phone: this.state.sender_phone,
      sender_address: this.state.sender_address,
      sender_contact: this.state.sender_contact,
      sender_province: this.state.sender_province,
      sender_city: this.state.sender_city,
      sender_district: this.state.sender_district,
      sender_street: this.state.sender_street,
      sender_region_code: this.state.sender_region_code,

      receiver_phone: this.state.receiver_phone,
      receiver_address: this.state.receiver_address,
      receiver_contact: this.state.receiver_contact,
      receiver_province: this.state.receiver_province,
      receiver_city: this.state.receiver_city,
      receiver_district: this.state.receiver_district,
      receiver_street: this.state.receiver_street,
      receiver_region_code: this.state.receiver_region_code,

      mailno: this.state.mailno,
      return_tracking_no: this.state.return_tracking_no,
      origincode: this.state.origincode,
      destcode: this.state.destcode,
      filter_result: this.state.filter_result,
      remark: this.state.remark,
    };
    this.setState({
      printedPickingList: true,
    });
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
      seq,
      expressInfo,
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
  orderExpress = () => {
    const { outboundHead } = this.props;
    const expressInfo = {
      express_type: this.state.express_type,
      pay_method: this.state.pay_method,
      insure_value: Number(this.state.insure_value),
      weight: this.state.weight,
      custid: this.state.custid,
      product_name: this.state.product_name,
      product_qty: this.state.product_qty,
      parcel_quantity: this.state.parcel_quantity,
      need_return_tracking_no: this.state.need_return_tracking_no,
      added_services: this.state.added_services,

      sender_phone: this.state.sender_phone,
      sender_address: this.state.sender_address,
      sender_contact: this.state.sender_contact,
      sender_province: this.state.sender_province,
      sender_city: this.state.sender_city,
      sender_district: this.state.sender_district,
      sender_street: this.state.sender_street,
      sender_region_code: this.state.sender_region_code,

      receiver_phone: this.state.receiver_phone,
      receiver_address: this.state.receiver_address,
      receiver_contact: this.state.receiver_contact,
      receiver_province: this.state.receiver_province,
      receiver_city: this.state.receiver_city,
      receiver_district: this.state.receiver_district,
      receiver_street: this.state.receiver_street,
      receiver_region_code: this.state.receiver_region_code,
    };
    this.props.orderExpress({
      soNo: outboundHead.so_no,
      outboundNo: outboundHead.outbound_no,
      tenantId: this.props.tenantId,
      expressInfo,
    }).then(() => {
      this.loadExpresseInfo();
    });
  }
  handleReceiverRegionChange = (value) => {
    this.setState({
      receiver_region_code: value[0],
      receiver_province: value[1],
      receiver_city: value[2],
      receiver_district: value[3],
      receiver_street: value[4],
    });
  }
  handleSenderRegionChange = (value) => {
    this.setState({
      sender_region_code: value[0],
      sender_province: value[1],
      sender_city: value[2],
      sender_district: value[3],
      sender_street: value[4],
    });
  }
  render() {
    const { mailno } = this.state;
    const courierNo = mailno ? mailno.split(',') : [];
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
        <Tabs activeKey={this.state.tabkey} onChange={this.handleTabChange}>
          <TabPane tab="订单信息" key="1">
            <Row>
              <Col span={12}>
                <FormItem label="快递类型" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select placeholder="快递类型" value={this.state.express_type} onChange={value => this.setState({ express_type: value })} style={{ width: '100%' }}>
                    {EXPRESS_TYPES.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12} >
                <FormItem label="签单返还" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <RadioGroup value={this.state.need_return_tracking_no}
                    onChange={e => this.setState({ need_return_tracking_no: e.target.value })} style={{ width: '100%' }}
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
                    {PAY_METHODS.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))}
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
                <FormItem label="包裹数" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.parcel_quantity} type="number" onChange={e => this.setState({ parcel_quantity: e.target.value })} />
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
            <Row>
              <Col span={12}>
                <FormItem label="增值服务" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Select placeholder="增值服务" mode="tags"
                    value={this.state.added_services ? this.state.added_services.split(',') : []}
                    onChange={value => this.setState({ added_services: value.join(',') })} style={{ width: '100%' }}
                  >
                    {ADDED_SERVICES.map(item => (<Option key={item.value} value={item.value}>{item.text}</Option>))}
                  </Select>
                </FormItem>
              </Col>
              <Col span={12}>
                {this.state.added_services.indexOf('INSURE') >= 0 &&
                <FormItem label="保价金额" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.insure_value} type="number" onChange={e => this.setState({ insure_value: e.target.value })} />
                </FormItem>
                }
              </Col>
            </Row>
            {this.state.added_services.indexOf('COD') >= 0 &&
            <Row>
              <Col span={12}>
                <FormItem label="代收货款额" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.cod_value} onChange={e => this.setState({ cod_value: e.target.value })} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="代收货款卡号" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.cod_card_id} onChange={e => this.setState({ cod_card_id: e.target.value })} />
                </FormItem>
              </Col>
            </Row>
            }
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
            <Button onClick={this.orderExpress}>获取单号</Button>
          </TabPane>
          <TabPane tab="快递单号" key="2">
            <Table dataSource={dataSource} columns={columns} showHeader={false} size="small" pagination={false} />
            <br />
            {mailno && <Button type="dashed" icon="plus" style={{ width: '100%' }} onClick={this.handleAddZD}>增加子单号</Button>}
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
