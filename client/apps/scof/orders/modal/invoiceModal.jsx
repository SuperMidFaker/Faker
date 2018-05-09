import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Radio, Form, Col, Row, Select, Input, Table } from 'antd';
import { loadInvoices, loadOrderInvoices, addOrderInvoices, toggleInvoiceModal } from 'common/reducers/sofOrders';
import { loadInvoiceCategories } from 'common/reducers/sofInvoice';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    formData: state.sofOrders.formData,
    partners: state.partner.partners,
    invoiceCategories: state.sofInvoice.invoiceCategories,
    list: state.sofOrders.invoicesModal.data,
    filter: state.sofOrders.invoicesModal.filter,
    visible: state.sofOrders.invoicesModal.visible,
    pageSize: state.sofOrders.invoicesModal.pageSize,
    current: state.sofOrders.invoicesModal.current,
    totalCount: state.sofOrders.invoicesModal.totalCount,
  }),
  {
    loadInvoices,
    loadOrderInvoices,
    addOrderInvoices,
    loadInvoiceCategories,
    toggleInvoiceModal,
  }
)
export default class InvoiceModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    coefficient: '',
    selectedRowKeys: [],
  }
  componentWillMount() {
    this.handleReload({
      buyer: '', seller: '', category: '', status: 'unshipped',
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible !== this.props.visible && nextProps.visible) {
      this.handleReload({
        buyer: '', seller: '', category: '', status: 'unshipped',
      });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  columns = [{
    title: this.msg('invoiceNo'),
    dataIndex: 'invoice_no',
  }, {
    title: this.msg('buyer'),
    dataIndex: 'buyer',
    width: 220,
    render: (o) => {
      if (o) {
        const partner = this.props.partners.find(pa => pa.id === Number(o));
        if (partner) {
          return partner.name;
        }
      }
      return '';
    },
  }, {
    title: this.msg('seller'),
    dataIndex: 'seller',
    width: 220,
    render: (o) => {
      if (o) {
        const partner = this.props.partners.find(pa => pa.id === Number(o));
        if (partner) {
          return partner.name;
        }
      }
      return '';
    },
  }]
  handleReload = (filter) => {
    let newFilter = {};
    if (filter) {
      newFilter = filter;
    } else {
      newFilter = this.props.filter;
    }
    const { pageSize, current } = this.props;
    this.props.loadInvoices(pageSize, current, newFilter).then((result) => {
      if (!result.error) {
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }
  handleCancel = () => {
    this.props.toggleInvoiceModal(false);
    this.setState({
      coefficient: '',
    });
  }
  handleOk = () => {
    const { selectedRowKeys, coefficient } = this.state;
    this.props.addOrderInvoices(
      selectedRowKeys,
      this.props.formData.shipmt_order_no, coefficient
    ).then((result) => {
      if (!result.error) {
        this.props.loadOrderInvoices(this.props.formData.shipmt_order_no);
        this.handleReload();
      }
    });
    this.handleCancel();
  }
  handleStatusChange = (e) => {
    const newFilter = { ...this.props.filter, status: e.target.value };
    this.handleReload(newFilter);
  }
  handleSellerChange = (seller) => {
    const newFilter = { ...this.props.filter, seller };
    this.handleReload(newFilter);
  }
  handleBuyerChange = (buyer) => {
    const newFilter = { ...this.props.filter, buyer };
    this.handleReload(newFilter);
  }
  handleCategoryChange = (value) => {
    const newFilter = { ...this.props.filter, category: value };
    this.handleReload(newFilter);
  }
  handleCoefficientChange = (e) => {
    this.setState({
      coefficient: e.target.value,
    });
  }
  render() {
    const {
      partners, invoiceCategories, visible, pageSize, current, totalCount,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const pagination = {
      pageSize: Number(pageSize),
      current: Number(current),
      total: totalCount,
      showTotal: total => `共 ${total} 条`,
      onChange: (cur, page) => {
        this.props.loadInvoices(page, cur, this.props.filter);
      },
    };
    return (
      <Modal
        title={this.msg('select invoices')}
        width={695}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        destroyOnClose
      >
        <div>
          <Row>
            <Col span={12}>
              <FormItem label={this.msg('invoiceStatus')} {...formItemLayout}>
                <RadioGroup onChange={this.handleStatusChange} defaultValue="unshipped">
                  <RadioButton value="unshipped">{this.msg('unshipped')}</RadioButton>
                  <RadioButton value="shipped">{this.msg('shipped')}</RadioButton>
                </RadioGroup>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={this.msg('category')} {...formItemLayout}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={this.handleCategoryChange}
                  allowClear
                  style={{ width: '100% ' }}
                >
                  {invoiceCategories.map(data => (
                    <Option key={data.category} value={data.category}>
                      {data.category}
                    </Option>))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label={this.msg('seller')} {...formItemLayout}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={this.handleSellerChange}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 360 }}
                  allowClear
                  style={{ width: '100% ' }}
                >
                  {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
                </Select>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={this.msg('buyer')} {...formItemLayout}>
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={this.handleBuyerChange}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ width: 360 }}
                  allowClear
                  style={{ width: '100% ' }}
                >
                  {partners.map(data => (<Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <FormItem label={this.msg('coefficient')} {...formItemLayout}>
                <Input value={this.state.coefficient} onChange={this.handleCoefficientChange} />
              </FormItem>
            </Col>
          </Row>
        </div>
        <Table
          columns={this.columns}
          dataSource={this.props.list}
          rowSelection={rowSelection}
          rowKey="invoice_no"
          pagination={pagination}
        />
      </Modal>
    );
  }
}
