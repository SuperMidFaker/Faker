import React, { PropTypes } from 'react';
import { Modal, Form, Input, Transfer, message } from 'antd';
import { connect } from 'react-redux';
import { addTracking, updateTracking, toggleTrackingModal } from 'common/reducers/scvTracking';

const FormItem = Form.Item;

@connect(state => ({
  tenantId: state.account.tenantId,
  visible: state.scvTracking.trackingModal.visible,
  operation: state.scvTracking.trackingModal.operation,
  trackingFields: state.scvTracking.trackingFields,
  trackingItems: state.scvTracking.trackingItems,
  tracking: state.scvTracking.trackingModal.tracking,
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
    form: PropTypes.object.isRequired,
    onOk: PropTypes.func,
    trackingFields: PropTypes.array.isRequired,
    trackingItems: PropTypes.array.isRequired,
    tracking: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  }
  state = {
    selectedKeys: [],
    targetKeys: [],
    name: '',
    title: '',
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
      const trackingItems = this.props.trackingFields.filter(item => targetKeys.indexOf(item.field) >= 0)
          .map((item, index) => ({ title: item.title, field: item.field, datatype: item.type, position: index, source: 1 }));
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
    const reg = new RegExp(option.title);
    return reg.test(inputValue);
  }
  render() {
    const { visible } = this.props;
    const { selectedKeys, targetKeys } = this.state;
    return (
      <Modal title={this.state.title} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel} width={680}>
        <FormItem label="跟踪表名称:" required>
          <Input value={this.state.name} onChange={e => this.setState({ name: e.target.value })} />
        </FormItem>
        <FormItem label="跟踪项:" required>
          <Transfer
            dataSource={this.props.trackingFields}
            titles={['', '']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            filterOption={this.filterOption}
            render={item => item.title}
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
