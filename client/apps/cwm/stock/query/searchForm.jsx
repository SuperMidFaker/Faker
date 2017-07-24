import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Radio, Row } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn } from 'common/reducers/scvInventoryStock';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    searchOption: state.scvInventoryStock.searchOption,
    displayedColumns: state.scvInventoryStock.displayedColumns,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { checkOwnerColumn, checkProductColumn, checkLocationColumn }
)
@Form.create()
export default class StockQueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      categories: PropTypes.arrayOf(PropTypes.shape({ category_no: PropTypes.string })),
    }),
    displayedColumns: PropTypes.shape({ product_no: PropTypes.bool }),
    onSearch: PropTypes.func.isRequired,
  }
  state = {
    searchType: 1,
  }
  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.onSearch(formData);
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator }, owners } = this.props;
    return (
      <Form layout="vertical" className="left-sider-panel">
        <FormItem label="货主">
          {getFieldDecorator('owner', {
            initialValue: 'all',
          })(
            <Select showSearch optionFilterProp="children" onChange={this.handleOwnerChange}
              dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
            >
              <Option key="all" value="all">全部货主</Option>
              {owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))}
            </Select>
          )}
        </FormItem>
        <FormItem label="货品">
          {getFieldDecorator('product_no')(<Input placeholder="货号或者sku" />)}
        </FormItem>
        <FormItem label="库位">
          {getFieldDecorator('whse_location')(<Input placeholder="库位号" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('search_type')(
            <RadioGroup onChange={this.onChange} value={this.state.searchType}>
              <Row>
                <Radio value="1">按货主查询</Radio>
                <Radio value="2">按产品查询</Radio>
              </Row>
              <Row>
                <Radio value="3">按库位查询</Radio>
                <Radio value="4">按产品/库位查询</Radio>
              </Row>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
