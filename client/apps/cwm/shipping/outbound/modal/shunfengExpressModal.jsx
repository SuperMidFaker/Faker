import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Tabs, Card, Col, Row, Tooltip, Modal, Form, Input,
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


    phone: '15757129719',
    address: '物流大道浦东物流股份有限公司',
    contact: '徐天龙',
    province: '上海市',
    city: '市辖区',
    district: '浦东新区',
    street: '',

    express_type: '13',
    pay_method: '1',
    insure: 0,
    weight: 0,
    custid: '',
    product_name: '',
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
  handleRegionChange = (value) => {
    this.setState({
      province: value[1],
      city: value[2],
      district: value[3],
      street: value[4],
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
    const { province, city, district, street } = this.state;
    const regionValues = [province, city, district, street];

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
              <Col span={12} />
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
                  <Input value={this.state.insure} type="number" onChange={e => this.setState({ insure: e.target.value })} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="托寄物" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.product_name} type="number" onChange={e => this.setState({ product_name: e.target.value })} />
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
                  <Input value={this.state.insure} type="number" onChange={e => this.setState({ insure: e.target.value })} />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <FormItem label="收货人" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.contact} placeholder="收货人"
                    onChange={e => this.setState({ contact: e.target.value })}
                  />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="电话" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.phone} placeholder="电话"
                    onChange={e => this.setState({ phone: e.target.value })}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem label="地址" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Cascader defaultRegion={regionValues} onChange={this.handleRegionChange} />
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="详细地址" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
                  <Input value={this.state.address}
                    onChange={e => this.setState({ address: e.target.value })}
                  />
                </FormItem>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="快递单号" key="2">
            <Card title="快递单号" bodyStyle={{ padding: 0 }}>
              <Table dataSource={dataSource} columns={columns} showHeader={false} size="small" pagination={false} />
            </Card>
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
