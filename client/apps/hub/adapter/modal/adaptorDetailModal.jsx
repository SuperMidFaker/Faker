import React, { Component } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Collapse, Input, Modal, Form, Layout, Select, Table } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import PageHeader from 'client/components/PageHeader';
import EditableCell from 'client/components/EditableCell';
import { hideAdaptorDetailModal, updateColumnField, updateStartLine, delAdaptor } from 'common/reducers/hubDataAdapter';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { formatMsg } from '../message.i18n';

const { Content, Sider } = Layout;
const FormItem = Form.Item;
const { Option } = Select;
const { Panel } = Collapse;
const { confirm } = Modal;
const impModels = Object.values(LINE_FILE_ADAPTOR_MODELS);

@injectIntl
@connect(state => ({
  adaptor: state.hubDataAdapter.adaptor,
  visible: state.hubDataAdapter.adaptorDetailModal.visible,
  customers: state.partner.partners,
}), {
  hideAdaptorDetailModal, updateColumnField, updateStartLine, delAdaptor,
})
@Form.create()
export default class AdaptorDetailModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    lineColumns: [],
    lineData: [],
    rightSidercollapsed: true,
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
        keyall: '示例1',
      }, {
        keyall: '示例2',
      }, {
        keyall: '导入字段',
      }];
      let scrollX = 100;
      nextProps.adaptor.columns.forEach((col, index) => {
        const dataIndex = `key${index}`;
        lineColumns.push({
          title: `列${index}`,
          dataIndex,
          width: 200,
          render: (value, row) => {
            if (row.editable) {
              let columns = [];
              const modelKeys = Object.keys(LINE_FILE_ADAPTOR_MODELS);
              for (let i = 0; i < modelKeys.length; i++) {
                const model = modelKeys[i];
                if (LINE_FILE_ADAPTOR_MODELS[model].key === nextProps.adaptor.biz_model) {
                  ({ columns } = LINE_FILE_ADAPTOR_MODELS[model]);
                  break;
                }
              }
              return (
                <EditableCell
                  value={value}
                  cellTrigger
                  type="select"
                  options={columns.map(acol => ({ key: acol.field, text: acol.label }))}
                  onSave={field => this.handleFieldMap(col.id, field)}
                />);
            }
            return value;
          },
        });
        lineData[0][dataIndex] = col.desc1;
        lineData[1][dataIndex] = col.desc2;
        lineData[2][dataIndex] = col.field;
        lineData[2].editable = true;
        scrollX += 200;
      });
      this.setState({ lineColumns, lineData, scrollX });
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
  handleFieldMap = (columnId, field) => {
    this.props.updateColumnField(columnId, field);
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
            // TODO reload adapter list
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
    const { lineColumns, lineData, scrollX } = this.state;
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
              <Button type="primary" icon="save" onClick={this.handleSubFlowAuth}>{this.msg('save')}</Button>
              <ButtonToggle
                iconOn="menu-unfold"
                iconOff="menu-fold"
                onClick={this.toggleRightSider}
              />
            </PageHeader.Actions>
          </PageHeader>
          <Layout>
            <Content style={{ padding: 16, height: this.state.contentHeight }} >
              <Card bodyStyle={{ padding: 0 }} >
                <Table
                  dataSource={lineData}
                  columns={lineColumns}
                  scroll={{ x: scrollX, y: 600 }}
                  pagination={false}
                />
              </Card>
            </Content>
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
                      <FormItem label={this.msg('adapterBizModel')}>
                        {getFieldDecorator('biz_model', {
                          initialValue: adaptor.biz_model,
                          rules: [{ required: true, message: this.msg('bizModelRequired') }],
                        })(<Select disabled>
                          {impModels.map(mod =>
                            <Option key={mod.key} value={mod.key}>{mod.name}</Option>)}
                        </Select>)}
                      </FormItem>
                      <FormItem label={this.msg('relatedPartner')} >
                        {getFieldDecorator('owner_partner_id', {
                          initialValue: adaptor.owner_partner_id,
                        })(<Select>
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
