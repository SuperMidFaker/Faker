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
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.operation === 'edit') {
      this.setState({
        selectedKeys: [],
        targetKeys: nextProps.trackingItems.map(item => item.field),
      });
    } else if (nextProps.operation === 'add') {
      this.setState({
        selectedKeys: [],
        targetKeys: [],
      });
    }
  }
  handleOk = () => {
    const { targetKeys } = this.state;
    const { operation, tracking } = this.props;
    if (targetKeys.length === 0) {
      message.warning('请选择追踪项');
    } else {
      this.props.form.validateFields((errors, values) => {
        if (!errors) {
          const trackingItems = this.props.trackingFields.filter(item => targetKeys.indexOf(item.field) >= 0).map((item1, index) => ({ ...item1, position: index }));
          if (operation === 'add') {
            this.props.addTracking({
              ...values,
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
              ...values,
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
      });
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
    const { visible, operation, tracking, form: { getFieldDecorator } } = this.props;
    const { selectedKeys, targetKeys } = this.state;
    return (
      <Modal title={operation === 'add' ? '新增追踪' : '修改追踪'} visible={visible} onOk={this.handleOk} onCancel={this.handleCancel} width={680}>
        <FormItem label="追踪名称:" required>
          {getFieldDecorator('name', {
            initialValue: tracking.name || '',
            rules: [{ required: true, message: '请填写追踪名称' }],
          })(<Input placeholder="追踪名称" />)
          }
        </FormItem>
        <FormItem label="追踪项:" required>
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
