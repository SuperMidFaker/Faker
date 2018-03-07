import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Icon, DatePicker } from 'antd';
import { changeSearchType } from 'common/reducers/cwmInventoryStock';
import { CWM_STOCK_SEARCH_TYPE } from 'common/constants';
import LocationSelect from 'client/apps/cwm/common/locationSelect';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    filter: state.cwmInventoryStock.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { changeSearchType }
)
@Form.create()
export default class QueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    onSearch: PropTypes.func.isRequired,
  }
  state = {
    expandForm: false,
    relDateRange: [],
  };
  handleSearchTypeChange = (value) => {
    this.props.changeSearchType(value);
  }
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    const { relDateRange } = this.state;
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(Object.assign(
          formData,
          {
            start_date: relDateRange.length === 2 ? relDateRange[0].valueOf() : undefined,
            end_date: relDateRange.length === 2 ? relDateRange[1].valueOf() : undefined,
          }
        ));
      }
    });
  }
  handleRelRangeChange = (relDateRange) => {
    this.setState({ relDateRange });
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    return (
      <Form layout="vertical">
        <FormItem label="货主">
          {getFieldDecorator('owner', {
                initialValue: filter.owner,
          })(<Select showSearch optionFilterProp="children" allowClear >
            {owners.map(owner => (<Option value={owner.id} key={owner.id}>{owner.name}</Option>))}
          </Select>)}
        </FormItem>
        <FormItem label="货品">
          {getFieldDecorator('product_no', {
                initialValue: filter.product_no,
              })(<Input placeholder="货号" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('search_type', {
            initialValue: filter.search_type,
          })(<Select onChange={this.handleSearchTypeChange}>
            <Option value={CWM_STOCK_SEARCH_TYPE[1].value}>{CWM_STOCK_SEARCH_TYPE[1].text}</Option>
            <Option value={CWM_STOCK_SEARCH_TYPE[3].value}>{CWM_STOCK_SEARCH_TYPE[3].text}</Option>
            <Option value={CWM_STOCK_SEARCH_TYPE[0].value}>{CWM_STOCK_SEARCH_TYPE[0].text}</Option>
            <Option value={CWM_STOCK_SEARCH_TYPE[2].value}>{CWM_STOCK_SEARCH_TYPE[2].text}</Option>
          </Select>)}
        </FormItem>
        {this.state.expandForm &&
          <div>
            <FormItem label="库位">
              {getFieldDecorator('whse_location', {
                initialValue: filter.whse_location,
              })(<LocationSelect />)}
            </FormItem>
            <FormItem label="入库日期" >
              <RangePicker onChange={this.handleRelRangeChange} />
            </FormItem>
          </div>}
        <FormItem>
          <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggleForm}>
            {this.state.expandForm ? '收起' : '更多选项'} <Icon type={this.state.expandForm ? 'up' : 'down'} />
          </a>
        </FormItem>
        <Button type="primary" onClick={this.handleStockSearch}>{this.msg('inquiry')}</Button>
        <Button onClick={this.handleFormReset}>重置</Button>
      </Form>
    );
  }
}
