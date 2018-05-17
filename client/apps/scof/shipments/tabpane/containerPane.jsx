import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Checkbox, Form, Row, Col, Card, Input, Select, Table, message } from 'antd';
import { addOrderContainer, loadOrderContainers, removeOrderContainer } from 'common/reducers/sofOrders';
import FormPane from 'client/components/FormPane';
import RowAction from 'client/components/RowAction';
import { format } from 'client/common/i18n/helpers';
import { CMS_CNTNR_SPEC_CUS } from 'common/constants';
import messages from '../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    formData: state.sofOrders.formData,
    containers: state.sofOrders.containers,
  }),
  { addOrderContainer, loadOrderContainers, removeOrderContainer }
)
export default class ContainerForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    operation: PropTypes.oneOf(['view', 'edit', 'create']),
  }
  state = {
    cntnrNo: '',
    cntnrSpec: '',
    isLcl: false,
  }
  componentWillMount() {
    this.props.loadOrderContainers(this.props.formData.shipmt_order_no);
  }
  msg = key => formatMsg(this.props.intl, key)
  containerColumns = [{
    title: '集装箱号',
    dataIndex: 'container_no',
  }, {
    title: '集装箱规格',
    dataIndex: 'container_type',
  }, {
    title: '是否拼箱',
    dataIndex: 'is_lcl',
    render: o => (o ? '是' : '否'),
  }, {
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 45,
    render: (o, record) => <RowAction danger confirm="确定删除?" onConfirm={this.handleDelete} icon="delete" tooltip="删除" row={record} />,
  }];
  handleChange = (e) => {
    this.setState({
      cntnrNo: e.target.value,
    });
  }
  handleSelect = (value) => {
    this.setState({
      cntnrSpec: value,
    });
  }
  handleChecked = (e) => {
    this.setState({
      isLcl: e.target.checked,
    });
  }
  handleAdd = () => {
    const {
      cntnrNo, cntnrSpec, isLcl,
    } = this.state;
    if (!cntnrSpec) {
      message.warn('请填写集装箱规格');
    } else {
      this.props.addOrderContainer(
        this.props.formData.shipmt_order_no,
        cntnrNo, cntnrSpec, isLcl
      ).then((result) => {
        if (!result.error) {
          this.setState({
            cntnrNo: '',
            cntnrSpec: '',
            isLcl: false,
          });
          this.props.loadOrderContainers(this.props.formData.shipmt_order_no);
        }
      });
    }
  }
  handleDelete = (row) => {
    this.props.orderContainerRemove(row.id).then((result) => {
      if (!result.error) {
        this.props.loadOrderContainers(this.props.formData.shipmt_order_no);
      }
    });
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    const {
      cntnrNo, cntnrSpec, isLcl,
    } = this.state;
    const { containers } = this.props;
    // todo required
    return (
      <FormPane>
        <Row>
          <Col span={6}>
            <FormItem label="集装箱号" {...formItemLayout} required>
              <Input value={cntnrNo} onChange={this.handleChange} />
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="集装箱规格" {...formItemLayout} required>
              <Select value={cntnrSpec} onSelect={this.handleSelect}>
                {CMS_CNTNR_SPEC_CUS.map(item =>
                  <Option key={item.value} value={item.value}>{item.text}</Option>)}
              </Select>
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label="是否拼箱" {...formItemLayout}>
              <Checkbox checked={isLcl} onChange={this.handleChecked} />
            </FormItem>
          </Col>
          <Col span={4} offset={2}>
            <Button type="primary" ghost icon="plus-circle-o" onClick={this.handleAdd}>添加</Button>
          </Col>
        </Row>
        <Card bodyStyle={{ padding: 0 }}>
          <Table
            size="middle"
            columns={this.containerColumns}
            dataSource={containers.map((con, index) => ({
            index, ...con,
          }))}
            key="index"
          />
        </Card>
      </FormPane>
    );
  }
}
