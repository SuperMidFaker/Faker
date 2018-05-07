import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Input, message, Modal, Transfer, Form, Layout, Select, Card, Row, Col } from 'antd';
import { loadTemplateFees, addTemplateFee, deleteTemplateFees, updateTemplateFee, updateTemplateProps } from 'common/reducers/bssBillTemplate';
import { loadAllFeeElements } from 'common/reducers/bssFeeSettings';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import InfoItem from 'client/components/InfoItem';
import ToolbarAction from 'client/components/ToolbarAction';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;
const FormItem = Form.Item;
const { Option } = Select;

function fetchData({ params, dispatch, state }) {
  return dispatch(loadTemplateFees({
    templateId: params.templateId,
    pageSize: state.bssBillTemplate.templateFeelist.pageSize,
    current: state.bssBillTemplate.templateFeelist.current,
    filter: JSON.stringify(state.bssBillTemplate.templateFeeListFilter),
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    templateFeelist: state.bssBillTemplate.templateFeelist,
    loading: state.bssBillTemplate.templateFeeListLoading,
    listFilter: state.bssBillTemplate.templateFeeListFilter,
    billTemplatelist: state.bssBillTemplate.billTemplatelist,
    allFeeElements: state.bssFeeSettings.allFeeElements,
  }),
  {
    loadTemplateFees,
    addTemplateFee,
    deleteTemplateFees,
    updateTemplateFee,
    loadAllFeeElements,
    updateTemplateProps,
  }
)
@Form.create()
export default class TemplateFees extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    targetKeys: [],
    visible: false,
    fees: [],
    editItem: {},
    onEdit: false,
    billProps: {},
  };
  componentDidMount() {
    this.props.loadAllFeeElements();
    let billProps = { customs_entry_nos: '报关单号', decl_sheet_qty: '联单数', trade_amount: '货值' };
    const template = this.props.billTemplatelist.data.filter(tp =>
      String(tp.id) === this.props.params.templateId)[0];
    if (template && template.bill_props) {
      billProps = JSON.parse(template.bill_props);
    }
    this.setState({ billProps });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.templateFeelist !== this.props.templateFeelist) {
      this.setState({ fees: nextProps.templateFeelist.data });
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleFeesLoad = (currentPage, filter) => {
    const { listFilter, params, templateFeelist: { pageSize, current } } = this.props;
    this.props.loadTemplateFees({
      templateId: params.templateId,
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleDeselectRows();
      }
    });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, searchText: value };
    this.handleFeesLoad(1, filter);
  }
  handleBatchDelete = () => {
    const feeUids = this.state.selectedRowKeys;
    this.props.deleteTemplateFees(feeUids).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('删除成功', 5);
        this.handleFeesLoad(1);
      }
    });
  }
  handleDeselectRows = () => {
    this.setState({ selectedRowKeys: [] });
  }
  handleEditChange = (value) => {
    const feeCodes = value.join('|');
    this.setState({
      editItem: { ...this.state.editItem, fee_codes: feeCodes },
    });
  }
  handleTransferChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
  }
  handleAddModalCancel = () => {
    this.setState({
      visible: false,
      targetKeys: [],
    });
  }
  handleAddModalOk = () => {
    const formVal = this.props.form.getFieldsValue();
    const feeName = formVal.fee_name;
    const exist = this.props.templateFeelist.data.filter(tp => tp.fee_name === feeName)[0];
    if (exist) {
      message.error('费用名称已存在', 6);
    } else {
      const feeCodes = formVal.fee_codes.join('|');
      this.props.addTemplateFee({
        fee_name: feeName,
        fee_codes: feeCodes,
        templateId: this.props.params.templateId,
      }).then((result) => {
        if (!result.error) {
          this.handleFeesLoad(1);
        }
      });
      this.handleAddModalCancel();
    }
  }
  toggleAddFeeModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleFeeEdit = (row) => {
    this.setState({ onEdit: true, editItem: { ...row } });
  }
  handleFeeEditCancel = () => {
    this.setState({ onEdit: false, editItem: {} });
  }
  handleFeeUpdate = () => {
    const item = this.state.editItem;
    this.props.updateTemplateFee({
      fee_uid: item.fee_uid,
      fee_codes: item.fee_codes,
    });
    const fees = [...this.state.fees];
    const feeIndex = fees.findIndex(fe => fe.fee_uid === item.fee_uid);
    fees[feeIndex] = item;
    this.setState({
      onEdit: false, editItem: {}, fees,
    });
  }
  handleEdit = (field, value) => {
    const billProps = { ...this.state.billProps, [field]: value };
    this.setState({ billProps });
    this.props.updateTemplateProps({ billProps, templateId: this.props.params.templateId });
  }
  render() {
    const {
      loading,
      form: { getFieldDecorator },
      allFeeElements,
      params: { templateId },
      billTemplatelist,
    } = this.props;
    const {
      targetKeys, visible, fees, onEdit, editItem, billProps,
    } = this.state;
    let templateName = '';
    const template = billTemplatelist.data.filter(tp => String(tp.id) === templateId)[0];
    if (template) {
      templateName = `${template.name}`;
    }
    const columns = [
      {
        title: this.msg('feeName'),
        dataIndex: 'fee_name',
        width: 200,
      }, {
        title: this.msg('feeCodes'),
        dataIndex: 'fee_codes',
        render: (o, record) => {
          if (onEdit && editItem.fee_uid === record.fee_uid) {
            return (
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                optionFilterProp="children"
                defaultValue={o ? o.split('|') : []}
                onChange={value => this.handleEditChange(value)}
              >
                {allFeeElements.map(data =>
                  <Option key={data.fee_code} value={data.fee_code}>{`${data.fee_code}|${data.fee_name}`}</Option>)}
              </Select>);
          }
          return o;
        },
      }, {
        title: this.gmsg('actions'),
        dataIndex: 'OPS_COL',
        className: 'table-col-ops',
        width: 100,
        render: (o, record) => {
          if (onEdit && editItem.fee_uid === record.fee_uid) {
            return (<span>
              <RowAction onClick={this.handleFeeUpdate} icon="save" row={record} />
              <RowAction onClick={this.handleFeeEditCancel} icon="close" tooltip="取消" />
            </span>
            );
          }
          return (<RowAction onClick={this.handleFeeEdit} icon="edit" row={record} />);
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
      },
    };
    const toolbarActions = (<span>
      <SearchBox placeholder={this.msg('feeName')} onSearch={this.handleSearch} />
    </span>);
    const bulkActions = (<span>
      <ToolbarAction danger icon="delete" label={this.gmsg('delete')} confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleBatchDelete} />
    </span>);
    return (
      <Layout>
        <Layout>
          <PageHeader title={templateName}>
            <PageHeader.Actions>
              <Button type="primary" icon="plus-circle-o" onClick={this.toggleAddFeeModal}>{this.gmsg('add')}</Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content layout-fixed-width" key="main">
            <Card title={this.msg('feeParams')}>
              <Row>
                <Col sm={16}>
                  <InfoItem
                    field={billProps.customs_entry_nos}
                    addonBefore="customs_entry_nos"
                    editable
                    onEdit={value => this.handleEdit('customs_entry_nos', value)}
                  />
                </Col>
                <Col sm={16}>
                  <InfoItem
                    field={billProps.decl_sheet_qty}
                    addonBefore="decl_sheet_qty"
                    editable
                    onEdit={value => this.handleEdit('decl_sheet_qty', value)}
                  />
                </Col>
                <Col sm={16}>
                  <InfoItem
                    field={billProps.trade_amount}
                    addonBefore="trade_amount"
                    editable
                    onEdit={value => this.handleEdit('trade_amount', value)}
                  />
                </Col>
              </Row>
            </Card>
            <DataTable
              toolbarActions={toolbarActions}
              bulkActions={bulkActions}
              selectedRowKeys={this.state.selectedRowKeys}
              onDeselectRows={this.handleDeselectRows}
              columns={columns}
              dataSource={fees}
              rowSelection={rowSelection}
              rowKey="fee_uid"
              loading={loading}
            />
            <Modal
              title="添加费用"
              width={695}
              visible={visible}
              onCancel={this.handleAddModalCancel}
              onOk={this.handleAddModalOk}
            >
              <Form>
                <FormItem label="费用名称" >
                  {getFieldDecorator('fee_name', {
                    rules: [{ required: true }],
                  })(<Input />)}
                </FormItem>
                <FormItem label="费用项" >
                  {getFieldDecorator('fee_codes', {
                  })(<Transfer
                    dataSource={allFeeElements}
                    showSearch
                    titles={['可选', '已选']}
                    targetKeys={targetKeys}
                    onChange={this.handleTransferChange}
                    render={item => `${item.fee_code}-${item.fee_name}`}
                    rowKey={item => item.fee_code}
                    listStyle={{
                      width: 300,
                      height: 400,
                    }}
                  />)}
                </FormItem>
              </Form>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
