/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Select, DatePicker, Card, Col, Row, Table } from 'antd';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const dateFormat = 'YYYY/MM/DD';
const formatMsg = format(messages);
const FormItem = Form.Item;
const Option = Select.Option;

@injectIntl
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  columns = [{
    title: this.msg('seq'),
    width: 50,
  }, {
    title: this.msg('opColumn'),
    width: 80,
  }, {
    title: this.msg('sku'),
    dataIndex: 'sku',
    width: 300,
  }, {
    title: this.msg('unit'),
    width: 60,
    dataIndex: 'unit',
  }, {
    title: this.msg('qty'),
    width: 50,
    dataIndex: 'qty',
  }, {
    title: this.msg('remark'),
    dataIndex: 'remark',
  }]
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <div>
        <Card>
          <Row gutter={16}>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('warehouse')}>
                {getFieldDecorator('whse_code', {
                })(
                  <Select combobox
                    optionFilterProp="search"
                    placeholder="选择仓库"
                  >
                    <Option value="0961">物流大道仓库</Option>
                    <Option value="0962">希雅路仓库</Option>
                    <Option value="0963">富特路仓库</Option>
                  </Select>
                  )}
              </FormItem>
            </Col>
            <Col sm={24} lg={12}>
              <FormItem label={this.msg('estShippingDate')} >
                {getFieldDecorator('est_shipping_date', {
                })(<DatePicker defaultValue={moment('2015/01/01', dateFormat)} format={dateFormat} style={{ width: '100%' }} />)}
              </FormItem>
            </Col>
            <Col sm={24} lg={24}>
              <Table size="small" columns={this.columns} rowKey="id" />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}
