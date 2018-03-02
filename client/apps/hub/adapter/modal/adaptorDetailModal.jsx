import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { message, Icon, Breadcrumb, Button, Card, Collapse, Input, Modal, Form, Layout, Select, Table, Tooltip } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import PageHeader from 'client/components/PageHeader';
import EditableCell from 'client/components/EditableCell';
import { hideAdaptorDetailModal, updateColumnField, updateColumnDefault, updateAdaptor, delAdaptor } from 'common/reducers/hubDataAdapter';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;
const FormItem = Form.Item;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;

@injectIntl
@connect(state => ({
  adaptor: state.hubDataAdapter.adaptor,
  visible: state.hubDataAdapter.adaptorDetailModal.visible,
  customers: state.partner.partners,
}), {
  hideAdaptorDetailModal, updateColumnField, updateColumnDefault, updateAdaptor, delAdaptor,
})
@Form.create()
export default class AdaptorDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    lineData: [],
    columnDefaults: [],
    rightSidercollapsed: true,
    mappingModal: {
      visible: false,
      mappings: [],
    },
    contentHeight: 0,
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        contentHeight: window.innerHeight - 150,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && this.props.adaptor.columns !== nextProps.adaptor.columns) {
      const lineData = [{
        id: 'example1',
        keyall: '行1',
      }, {
        id: 'example2',
        keyall: '行2',
      }, {
        id: 'field',
        keyall: '对应字段',
      }, {
        id: 'converter',
        keyall: '转换规则',
      }, {
        id: 'mapping',
        keyall: '映射关系',
      }];
      let scrollX = 100;
      nextProps.adaptor.columns.forEach((col, index) => {
        const dataIndex = `key${index}`;
        lineData[0][dataIndex] = col.desc1;
        lineData[1][dataIndex] = col.desc2;
        lineData[2][dataIndex] = col.field;
        lineData[3][dataIndex] = col.converter;
        lineData[4][dataIndex] = col.mapping;
        scrollX += 200;
      });
      this.setState({
        lineData, scrollX, columnDefaults: nextProps.adaptor.columnDefaults,
      });
    }
  }
  msg = formatMsg(this.props.intl)
  toggleRightSider = () => {
    this.setState({
      rightSidercollapsed: !this.state.rightSidercollapsed,
    });
  }
  handleCancel = () => {
    this.props.hideAdaptorDetailModal();
  }
  handleFieldMap = (columnId, field, dataIndex) => {
    this.props.updateColumnField(columnId, { field: field || null });
    const lineData = [...this.state.lineData];
    lineData[2][dataIndex] = field;
    this.setState({ lineData });
  }
  handleConvertMap = (columnId, converter) => {
    this.props.updateColumnField(columnId, { converter });
  }
  handleMappingEditBegin = (columnId, mappingJson, dataIndex) => {
    this.setState({
      mappingModal: {
        visible: true,
        columnId,
        dataIndex,
        mappings: mappingJson ? JSON.parse(mappingJson) : [{ key: null, value: null }],
      },
    });
  }
  handleMappingEditCancel = () => {
    this.setState({
      mappingModal: {
        visible: false,
        mappings: [],
      },
    });
  }
  handleMappingInputKey = (value, index) => {
    const mappingModal = { ...this.state.mappingModal };
    mappingModal.mappings[index].key = value;
    this.setState({ mappingModal });
  }
  handleMappingInputVal = (value, index) => {
    const mappingModal = { ...this.state.mappingModal };
    mappingModal.mappings[index].value = value;
    this.setState({ mappingModal });
  }
  handleMappingInputRem = (index) => {
    const mappingModal = { ...this.state.mappingModal };
    if (mappingModal.mappings.length === 1) {
      mappingModal.mappings[0].key = null;
      mappingModal.mappings[0].value = null;
    } else {
      mappingModal.mappings.splice(index, 1);
    }
    this.setState({ mappingModal });
  }
  handleMappingInputAdd = () => {
    const mappingModal = { ...this.state.mappingModal };
    mappingModal.mappings.push({
      key: null,
      value: null,
    });
    this.setState({ mappingModal });
  }
  handleMappingEditOk = () => {
    const mappings = this.state.mappingModal.mappings.filter(mapp => mapp.key && mapp.value);
    let mappingJson = null;
    if (mappings.length > 0) {
      mappingJson = JSON.stringify(mappings);
    }
    const { columnId, dataIndex } = this.state.mappingModal;
    this.props.updateColumnField(columnId, { mapping: mappingJson });
    const lineData = [...this.state.lineData];
    lineData[4][dataIndex] = mappingJson;
    this.setState({ lineData });
    this.handleMappingEditCancel();
  }
  handleAdaptorUpdate = () => {
    const adaptorValues = this.props.form.getFieldsValue();
    const customer = this.props.customers.filter(cust =>
      cust.id === adaptorValues.owner_partner_id)[0];
    if (customer) {
      adaptorValues.owner_tenant_id = customer.partner_tenant_id;
    } else {
      adaptorValues.owner_tenant_id = null;
      adaptorValues.owner_partner_id = null;
    }
    if (adaptorValues.delimiter && this.props.adaptor.csv_option) {
      const option = JSON.parse(this.props.adaptor.csv_option);
      option.delimiter = adaptorValues.delimiter;
      adaptorValues.csv_option = JSON.stringify(option);
    }
    this.props.updateAdaptor(this.props.adaptor.code, adaptorValues).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        message.success('保存成功');
      }
    });
  }
  handleColDefaultChange = (colDefault, field, value) => {
    this.props.updateColumnDefault(colDefault && colDefault.id, {
      field, default: value,
    }, this.props.adaptor.code).then((result) => {
      if (!result.error) {
        const colDefaults = [...this.state.columnDefaults];
        if (colDefault) {
          const existColDef = colDefaults.filter(cldef => cldef.id === colDefault.id)[0];
          existColDef.default = value;
        } else {
          colDefaults.push({
            id: result.data.id,
            field,
            default: value,
          });
        }
        this.setState({ columnDefaults: colDefaults });
      }
    });
  }
  handleDeleteAdapter = () => {
    const self = this;
    confirm({
      title: '确认删除此适配器吗?',
      content: '删除适配器后将不可恢复',
      okText: this.msg('yes'),
      okType: 'danger',
      cancelText: this.msg('no'),
      onOk() {
        self.props.delAdaptor(self.props.adaptor.code).then((result) => {
          if (!result.error) {
            self.handleCancel();
            if (this.props.reload) {
              this.props.reload();
            }
          }
        });
      },
      onCancel() {
      },
    });
  }
  render() {
    const {
      form: { getFieldDecorator }, visible, adaptor, customers,
    } = this.props;
    const {
      lineData, scrollX, columnDefaults, mappingModal,
    } = this.state;
    let adaptorModel;
    const modelKeys = Object.keys(LINE_FILE_ADAPTOR_MODELS);
    for (let i = 0; i < modelKeys.length; i++) {
      const model = modelKeys[i];
      if (LINE_FILE_ADAPTOR_MODELS[model].key === adaptor.biz_model) {
        adaptorModel = LINE_FILE_ADAPTOR_MODELS[model];
        break;
      }
    }
    if (!adaptorModel) {
      return null;
    }
    const mappedFieldsMap = new Map();
    if (lineData[2]) {
      Object.values(lineData[2]).forEach((ld) => {
        if (ld) {
          mappedFieldsMap.set(ld, true);
        }
      });
    }
    const fieldColumns = [{
      dataIndex: 'keyall',
      width: 100,
      fixed: 'left',
    }];
    const fieldData = [{
      key: 'field',
      keyall: '字段名称',
    }, {
      key: 'default',
      keyall: '默认值',
    }];
    let fieldsScrollX = 100;
    const availColumnFields = adaptorModel.columns.filter(col => !mappedFieldsMap.has(col.field));
    availColumnFields.forEach((defc, index) => {
      const colDefault = columnDefaults.filter(cold => cold.field === defc.field)[0];
      const dataIndex = `key${index}`;
      fieldColumns.push({
        dataIndex,
        width: 200,
        render: (value, row, rowIndex) => {
          if (rowIndex === 1) {
            return (<EditableCell
              value={value}
              cellTrigger
              onSave={defaultValue =>
                  this.handleColDefaultChange(colDefault, defc.field, defaultValue)}
            />);
          }
          return value;
        },
      });
      fieldData[0][dataIndex] = defc.label;
      fieldData[1][dataIndex] = colDefault && colDefault.default;
      fieldsScrollX += 200;
    });
    const lineColumns = [{
      dataIndex: 'keyall',
      width: 100,
      fixed: 'left',
    }];
    adaptor.columns.forEach((col, index) => {
      const dataIndex = `key${index}`;
      lineColumns.push({
        title: `列${index}`,
        dataIndex,
        width: 200,
        render: (value, row, rowIndex) => {
          const columnField = lineData[2][dataIndex];
          let thisFieldColumn;
          if (columnField) {
            [thisFieldColumn] = adaptorModel.columns.filter(adcol => adcol.field === columnField);
          }
          if (rowIndex === 2) {
            const fieldSelOptions = [...availColumnFields];
            if (value && thisFieldColumn) {
              fieldSelOptions.unshift(thisFieldColumn);
            }
            return (
              <Select
                showSearch
                allowClear
                style={{ width: 160 }}
                placeholder="选择字段"
                optionFilterProp="children"
                onChange={field => this.handleFieldMap(col.id, field, dataIndex)}
                value={value}
              >
                {fieldSelOptions.map(acol =>
                  <Option value={acol.field} key={acol.field}>{acol.label}</Option>)}
              </Select>
            );
          } else if (rowIndex === 3) {
            let placeholder = `C${index}`;
            if (thisFieldColumn && thisFieldColumn.datatype === 'date') {
              placeholder = '#YYYYMMDD';
            }
            return (
              <EditableCell
                value={value}
                cellTrigger
                placeholder={placeholder}
                onSave={field => this.handleConvertMap(col.id, field)}
              />
            );
          } else if (rowIndex === 4) {
            return <Tooltip title="编辑映射"><Button icon="edit" onClick={() => this.handleMappingEditBegin(col.id, value, dataIndex)} /></Tooltip>;
          }
          return value;
        },
      });
    });
    let isCsv = false;
    let csvOption;
    if (adaptor.file_format &&
      String(adaptor.file_format).toLowerCase() === 'csv' && adaptor.csv_option) {
      isCsv = true;
      csvOption = JSON.parse(adaptor.csv_option);
    }
    return (
      <Modal
        maskClosable={false}
        title={this.msg('configAdapter')}
        width="100%"
        wrapClassName="fullscreen-modal"
        footer={null}
        onCancel={this.handleCancel}
        visible={visible}
        destroyOnClose
      >
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {adaptor.name}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" icon="save" onClick={this.handleAdaptorUpdate}>{this.msg('save')}</Button>
              <ButtonToggle
                iconOn="menu-unfold"
                iconOff="menu-fold"
                onClick={this.toggleRightSider}
              />
            </PageHeader.Actions>
          </PageHeader>
          <Layout>
            <Content style={{ padding: 16, height: this.state.contentHeight }} >
              <Card title="数据导入表格" bodyStyle={{ padding: 0 }} >
                <Table
                  dataSource={lineData}
                  columns={lineColumns}
                  scroll={{ x: scrollX }}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
              <Card
                title={<span>适配数据对象: {adaptorModel.name}</span>}
                bodyStyle={{ padding: 0 }}
              >
                <Table
                  dataSource={fieldData}
                  columns={fieldColumns}
                  scroll={{ x: fieldsScrollX }}
                  pagination={false}
                />
              </Card>
            </Content>
            <Modal
              title="映射关系编辑"
              maskClosable={false}
              onCancel={this.handleMappingEditCancel}
              onOk={this.handleMappingEditOk}
              visible={mappingModal.visible}
            >
              <Form>
                { mappingModal.mappings.map((mapp, index) => (
                  <FormItem>
                    <Input placeholder="输入名称" style={{ width: '40%', marginRight: 8 }} value={mapp.key} onChange={ev => this.handleMappingInputKey(ev.target.value, index)} />
                    <Input placeholder="转换名称" style={{ width: '40%', marginRight: 8 }} value={mapp.value} onChange={ev => this.handleMappingInputVal(ev.target.value, index)} />
                    {((mapp.key && mapp.value) || mappingModal.mappings.length > 1) && <Icon
                      type="minus-circle-o"
                      onClick={() => this.handleMappingInputRem(index)}
                    />}
                  </FormItem>
                ))
                }
                <FormItem>
                  <Button type="dashed" onClick={this.handleMappingInputAdd} style={{ width: '80%' }}>
                    <Icon type="plus" /> 添加映射
                  </Button>
                </FormItem>
              </Form>
            </Modal>
            <Sider
              trigger={null}
              defaultCollapsed
              collapsible
              collapsed={this.state.rightSidercollapsed}
              width={380}
              collapsedWidth={0}
              className="right-sider"
            >
              <div className="right-sider-panel">
                <Form layout="vertical">
                  <Collapse accordion defaultActiveKey="params">
                    <Panel header={this.msg('profile')} key="profile">
                      <FormItem label={this.msg('adapterName')}>
                        {getFieldDecorator('name', {
                          initialValue: adaptor.name,
                          rules: [{ required: true, message: this.msg('nameRequired') }],
                        })(<Input />)}
                      </FormItem>
                      <FormItem label={this.msg('adapterFileFormat')}>
                        <Input value={adaptor.file_format} readOnly />
                      </FormItem>
                      {isCsv && csvOption &&
                      <FormItem label={this.msg('csvDelimiter')}>
                        {getFieldDecorator('delimiter', {
                          initialValue: csvOption.delimiter,
                        })(<Input />)}
                      </FormItem>}
                      <FormItem label={this.msg('relatedPartner')} >
                        {getFieldDecorator('owner_partner_id', {
                          initialValue: adaptor.owner_partner_id,
                        })(<Select allowClear>
                          {customers.map(cus =>
                            <Option value={cus.id} key={cus.id}>{cus.name}</Option>)}
                        </Select>)}
                      </FormItem>
                    </Panel>
                    <Panel header={this.msg('params')} key="params">
                      <FormItem label={this.msg('startLine')}>
                        {getFieldDecorator('start_line', {
                          initialValue: adaptor.start_line,
                        })(<Input />)}
                      </FormItem>
                    </Panel>
                    <Panel header={this.msg('more')} key="more">
                      <Button type="danger" icon="delete" onClick={this.handleDeleteAdapter}>删除适配器</Button>
                    </Panel>
                  </Collapse>
                </Form>
              </div>
            </Sider>
          </Layout>
        </Layout>
      </Modal>
    );
  }
}
