import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Transfer, Select, message } from 'antd';
import { connect } from 'react-redux';
import { addTracking, updateTracking, toggleTrackingModal } from 'common/reducers/sofTracking';
import { SCV_TRACKING_FIELD_MODELES } from 'common/constants';

const FormItem = Form.Item;
const { Option } = Select;

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.sofTracking.trackingModal.visible,
  operation: state.sofTracking.trackingModal.operation,
  trackingFields: state.sofTracking.trackingFields,
  trackingItems: state.sofTracking.trackingItems,
  tracking: state.sofTracking.trackingModal.tracking,
}), { addTracking, updateTracking, toggleTrackingModal })
@Form.create()
export default class TrackingModal extends React.Component {
  static propTypes = {
    tenantId: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    operation: PropTypes.string, // add  edit
    addTracking: PropTypes.func.isRequired,
    updateTracking: PropTypes.func.isRequired,
    toggleTrackingModal: PropTypes.func.isRequired,
    onOk: PropTypes.func,
    trackingFields: PropTypes.array.isRequired,
    trackingItems: PropTypes.array.isRequired,
    tracking: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  }
  state = {
    dataSource: [],
    selectedKeys: [],
    targetKeys: [],
    name: '',
    title: '',
    leftSelectedKey: '_all',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.operation === 'edit') {
      this.setState({
        selectedKeys: [],
        targetKeys: nextProps.trackingItems.map(item => item.field),
        title: '跟踪表设置',
      });
    } else if (nextProps.operation === 'add') {
      this.setState({
        selectedKeys: [],
        targetKeys: [],
        title: '新增跟踪表',
      });
    }
    this.setState({
      name: nextProps.tracking.name,
      dataSource: this.props.trackingFields,
    });
  }
  handleOk = () => {
    const { targetKeys, name } = this.state;
    const { operation, tracking } = this.props;
    if (targetKeys.length === 0) {
      message.warning('请选择追踪项');
    } else if (!name) {
      message.warning('请填写追踪名称');
    } else {
      const trackingItems = this.props.trackingFields.filter(item =>
        targetKeys.indexOf(item.field) >= 0)
        .map((item, index) => ({
          title: item.title, field: item.field, datatype: item.type, position: index, source: 1,
        }));
      if (operation === 'add') {
        this.props.addTracking({
          name,
          trackingItems,
          tenant_id: this.props.tenantId,
        }).then(() => {
          if (this.props.onOk) {
            this.props.toggleTrackingModal(false);
            this.props.onOk();
          }
        });
      } else if (operation === 'edit') {
        this.props.updateTracking({
          name,
          trackingItems,
          tenant_id: this.props.tenantId,
          id: tracking.id,
        }).then(() => {
          if (this.props.onOk) {
            this.props.toggleTrackingModal(false);
            this.props.onOk();
          }
        });
      }
    }
  }
  handleChange = (keys) => {
    this.setState({ targetKeys: keys });
  }
  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ selectedKeys: [...targetSelectedKeys, ...sourceSelectedKeys] });
  }
  handleCancel = () => {
    this.props.toggleTrackingModal(false);
  }
  filterOption = (inputValue, option) => {
    const reg = new RegExp(inputValue);
    return reg.test(option.title);
  }
  render() {
    const { visible } = this.props;
    const {
      selectedKeys, targetKeys, leftSelectedKey, dataSource,
    } = this.state;
    const modules = [...SCV_TRACKING_FIELD_MODELES].concat([{ key: '_all', text: '全部' }]);
    const leftTitle = (
      <Select
        value={leftSelectedKey}
        size="small"
        style={{ width: 90 }}
        onChange={value => this.setState({
          leftSelectedKey: value,
          dataSource: this.props.trackingFields.filter(item =>
            (value === '_all' ? true : value === item.module)).concat(this.props.trackingFields.filter(item =>
              targetKeys.indexOf(item.field) >= 0)),
        })}
      >
        {modules.map(item => (
          <Option key={item.key}>{item.text}</Option>
        ))}
      </Select>
    );
    return (
      <Modal
        maskClosable={false}
        title={this.state.title}
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        width={695}
      >
        <FormItem label="跟踪表名称:" required>
          <Input value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
        </FormItem>
        <FormItem label="跟踪项:" required>
          <Transfer
            dataSource={dataSource}
            titles={[leftTitle, '']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            filterOption={this.filterOption}
            render={item => (<span>
              <div style={{ width: '45%', display: 'inline-block' }}>{item.title}</div>
              <div style={{ width: '45%', display: 'inline-block' }} className="mdc-text-grey">
                {SCV_TRACKING_FIELD_MODELES.find(m => m.key === item.module).text}
              </div>
            </span>)}
            rowKey={item => item.field}
            showSearch
            listStyle={{
              width: 300,
              height: 400,
            }}
          />
        </FormItem>
      </Modal>
    );
  }
}
