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
    lineColumns: [],
    lineData: [],
    columnDefaults: [],
    rightSidercollapsed: true,
    mappingModal: {
      visible: false,
      mappings: [],
    },
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        contentHeight: window.innerHeight - 150,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.adaptor.columns !== nextProps.adaptor.columns) {
      const lineColumns = [{
        dataIndex: 'keyall',
        width: 100,
        fixed: 'left',
      }];
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
      let modelColumns = [];
      const modelKeys = Object.keys(LINE_FILE_ADAPTOR_MODELS);
      for (let i = 0; i < modelKeys.length; i++) {
        const model = modelKeys[i];
        if (LINE_FILE_ADAPTOR_MODELS[model].key === nextProps.adaptor.biz_model) {
          modelColumns = LINE_FILE_ADAPTOR_MODELS[model].columns;
          break;
        }
      }
      nextProps.adaptor.columns.forEach((col, index) => {
        const dataIndex = `key${index}`;
        lineColumns.push({
          title: `列${index}`,
          dataIndex,
          width: 200,
          render: (value, row, rowIndex) => {
            if (rowIndex === 2) {
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
                  {modelColumns.map(acol =>
                    <Option value={acol.field} key={acol.field}>{acol.label}</Option>)}
                </Select>
              );
            } else if (rowIndex === 3) {
              return (
                <EditableCell
                  value={value}
                  cellTrigger
                  placeholder={`C${index}`}
                  onSave={field => this.handleConvertMap(col.id, field)}
                />
              );
            } else if (rowIndex === 4) {
              return <Tooltip title="编辑映射"><Button icon="edit" onClick={() => this.handleMappingEditBegin(col.id, value)} /></Tooltip>;
            }
            return value;
          },
        });
        lineData[0][dataIndex] = col.desc1;
        lineData[1][dataIndex] = col.desc2;
        lineData[2][dataIndex] = col.field;
        lineData[3][dataIndex] = col.converter;
        lineData[4][dataIndex] = col.mapping;
        scrollX += 200;
      });
      this.setState({
        lineColumns, lineData, scrollX, columnDefaults: nextProps.adaptor.columnDefaults,
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
    this.props.updateColumnField(columnId, { field });
    const lineData = [...this.state.lineData];
    lineData[2][dataIndex] = field;
    this.setState({ lineData });
  }
  handleConvertMap = (columnId, converter) => {
    this.props.updateColumnField(columnId, { converter });
  }
  handleMappingEditBegin = (columnId, mappingJson) => {
    this.setState({
      mappingModal: {
        visible: true,
        columnId,
        mappings: mappingJson ? JSON.parse(mappingJson) : [],
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
      lineColumns, lineData, scrollX, columnDefaults, mappingModal,
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
    const mappedFieldsMap = new Map();
    if (lineData[2]) {
      Object.values(lineData[2]).forEach((ld) => {
        if (ld) {
          mappedFieldsMap.set(ld, true);
        }
      });
    }
    const defaultColumns = adaptorModel.columns.filter(col => !mappedFieldsMap.has(col.field));
    defaultColumns.forEach((defc, index) => {
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
                <FormItem>
                  <Input placeholder="输入名称" style={{ width: '40%', marginRight: 8 }} />
                  <Input placeholder="转换名称" style={{ width: '40%', marginRight: 8 }} />
                  <Icon
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.remove()}
                  />
                </FormItem>
                <FormItem>
                  <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
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
