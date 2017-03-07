import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { feeUpdate, feeAdd, feeDelete, saveQuoteModel, saveQuoteBatchEdit, loadEditQuote } from 'common/reducers/cmsQuote';
import { SOURCE_SELECT } from 'common/constants';
import { Select, Input, Switch, Card, Row, Col, Form } from 'antd';

const Option = Select.Option;
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

@injectIntl
@connect(
  state => ({
    quoteData: state.cmsQuote.quoteData,
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { feeUpdate, feeAdd, feeDelete, saveQuoteModel, saveQuoteBatchEdit, loadEditQuote }
)
export default class FeesTable extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.object.isRequired,
    action: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired,
    feeUpdate: PropTypes.func.isRequired,
    feeAdd: PropTypes.func.isRequired,
    feeDelete: PropTypes.func.isRequired,
    saveQuoteModel: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.setState({ dataSource: this.props.quoteData.fees, editable: this.props.editable });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.quoteData !== this.props.quoteData) {
      this.setState({ dataSource: nextProps.quoteData.fees });
    }
  }
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleTitleButton = () => (
    <div>
      <Switch />
    </div>
    )
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Card title="特殊字段规则设置" extra={<Switch />}>
        <Row gutter={20}>
          <Col sm={24} lg={12}>
            <FormItem label={'商品名称'} {...formItemLayout} >
              {getFieldDecorator('g_name', {
                initialValue: '',
              })(<Select>
                {
                  SOURCE_SELECT.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={'申报单位'} {...formItemLayout} >
              {getFieldDecorator('g_unit', {
                initialValue: '',
              })(<Select>
                {
                  SOURCE_SELECT.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col sm={24} lg={12}>
            <FormItem label={'原产国'} {...formItemLayout} >
              {getFieldDecorator('orig_country', {
                initialValue: '',
              })(<Select>
                {
                  SOURCE_SELECT.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={'净重'} {...formItemLayout} >
              {getFieldDecorator('net_wt', {
                initialValue: '',
              })(<Select>
                {
                  SOURCE_SELECT.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col sm={24} lg={12}>
            <FormItem label={'币制'} {...formItemLayout} >
              {getFieldDecorator('currency', {
                initialValue: '',
              })(<Select>
                {
                  SOURCE_SELECT.map(dw =>
                    <Option value={dw.key} key={dw.key}>{dw.value}</Option>
                  )
                }
              </Select>)}
            </FormItem>
          </Col>
          <Col sm={24} lg={12}>
            <FormItem label={'规格型号'} {...formItemLayout} >
              {getFieldDecorator('element', {
                initialValue: '',
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
