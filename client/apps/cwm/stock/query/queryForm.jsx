import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Radio, Col, DatePicker } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProAndLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';
import { CWM_STOCK_SEARCH_TYPE } from 'common/constants';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    searchOption: state.cwmInventoryStock.searchOption,
    displayedColumns: state.cwmInventoryStock.displayedColumns,
    filter: state.cwmInventoryStock.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
    tenantId: state.account.tenantId,
  }),
  { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProAndLocation, changeSearchType, clearList, loadLocations }
)
@Form.create()
export default class QueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      categories: PropTypes.arrayOf(PropTypes.shape({ category_no: PropTypes.string })),
    }),
    displayedColumns: PropTypes.shape({ product_no: PropTypes.bool }),
    onSearch: PropTypes.func.isRequired,
  }
  componentWillMount() {
    this.props.loadLocations(this.props.defaultWhse.code, '', this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      this.props.loadLocations(nextProps.defaultWhse.code, '', nextProps.tenantId);
    }
  }
  onChange = (e) => {
    this.props.changeSearchType(e.target.value);
    this.props.clearList();
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(formData);
      }
    });
  }
  checkOwners = () => {
    this.props.checkOwnerColumn();
  }
  checkProduct = () => {
    this.props.checkProductColumn();
  }
  checkLocation = () => {
    this.props.checkLocationColumn();
  }
  checkProAndLocation = () => {
    this.props.checkProAndLocation();
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    return (
      <Form layout="inline">
        <FormItem label="货主">
          {getFieldDecorator('owner', {
            initialValue: filter.owner,
          })(
            <Select showSearch optionFilterProp="children" onChange={this.handleOwnerChange} allowClear style={{ width: 160 }}>
              {owners.map(owner => (<Option value={owner.id} key={owner.id}>{owner.name}</Option>))}
            </Select>
          )}
        </FormItem>
        <FormItem label="货品">
          {getFieldDecorator('product_no', {
            initialValue: filter.product_no,
          })(<Input placeholder="货号" />)}
        </FormItem>
        <FormItem label="库位">
          {getFieldDecorator('whse_location', {
            initialValue: filter.whse_location,
          })(
            <LocationSelect style={{ width: 160 }} />
          )}
        </FormItem>
        <FormItem label="入库日期" >
          <RangePicker />
        </FormItem>
        <FormItem>
          {getFieldDecorator('search_type', {
            initialValue: filter.search_type,
          })(
            <RadioGroup onChange={this.onChange}>
              <Col span={12}>
                <Radio value={CWM_STOCK_SEARCH_TYPE[1].value} onClick={this.checkProduct}>{CWM_STOCK_SEARCH_TYPE[1].text}</Radio>
                <Radio value={CWM_STOCK_SEARCH_TYPE[0].value} onClick={this.checkOwners}>{CWM_STOCK_SEARCH_TYPE[0].text}</Radio>
              </Col>
              <Col span={12}>
                <Radio value={CWM_STOCK_SEARCH_TYPE[3].value} onClick={this.checkProAndLocation}>{CWM_STOCK_SEARCH_TYPE[3].text}</Radio>
                <Radio value={CWM_STOCK_SEARCH_TYPE[2].value} onClick={this.checkLocation}>{CWM_STOCK_SEARCH_TYPE[2].text}</Radio>
              </Col>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('inquiry')}</Button>
        </FormItem>
      </Form>
    );
  }
}
