import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Icon, Tag, Select } from 'antd';
import { formatMsg } from '../message.i18n';

const Option = Select.Option;
@injectIntl
export default class SyncShareEditCell extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    checkedBrokers: PropTypes.arrayOf(PropTypes.shape({ sharee_id: PropTypes.number.isRequired })).isRequired,
    shareBrokers: PropTypes.arrayOf(PropTypes.shape({ tenant_id: PropTypes.number.isRequired })).isRequired,
    contribute: PropTypes.number.isRequired,
    onSave: PropTypes.func.isRequired,
  }
  state = {
    editMode: false,
    value: [],
  }
  componentWillMount() {
    this.setState({ value: this.props.checkedBrokers.map(cb => cb.sharee_id) });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.checkedBrokers !== this.props.checkedBrokers) {
      this.setState({ value: nextProps.checkedBrokers.map(cb => cb.sharee_id) });
    }
  }
  msg = formatMsg(this.props.intl)
  handleBeginEdit = () => { this.setState({ editMode: true }); }
  handleCancel = () => { this.setState({ editMode: false }); }
  handleSave = () => {
    let changed = this.state.value.length !== this.props.checkedBrokers.length;
    if (!changed) {
      const checkedIds = this.props.checkedBrokers.map(cb => cb.sharee_id);
      for (let i = 0; i < this.state.value.length; i++) {
        const val = this.state.value[i];
        if (checkedIds.indexOf(val) === -1) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      const sharees = this.state.value.map(val => ({
        tenant_id: val,
        name: this.props.shareBrokers.filter(sb => sb.tenant_id === val)[0].name,
      }));
      this.props.onSave(this.props.contribute, sharees);
    }
    this.setState({ editMode: false });
  }
  handleChange = (brokers) => {
    const value = [...brokers];
    if (brokers.indexOf(this.props.contribute) === -1) {
      value.push(this.props.contribute);
    }
    this.setState({ value });
  }
  render() {
    const { editMode, value } = this.state;
    const { checkedBrokers, shareBrokers } = this.props;
    let plainText = null;
    if (!editMode) {
      plainText = value.slice(0, 5).map((cb) => {
        const shb = shareBrokers.filter(sb => sb.tenant_id === cb)[0];
        if (shb) {
          return <Tag key={`${cb}${shb.name}`}>{shb.name}</Tag>;
        } else {
          return null;
        }
      });
      if (checkedBrokers.length > 5) {
        plainText.push('...');
      }
    }
    return (
      <div className="editable-cell">
        {editMode ?
          <div className="editable-cell-input-wrapper">
            <Select mode="tags" value={value} style={{ width: '90%' }} onChange={this.handleChange}>
              {shareBrokers.map(opt => <Option key={opt.tenant_id} value={opt.tenant_id}>{opt.name}</Option>)}
            </Select>
            <Icon type="check" className="editable-cell-icon-save" onClick={this.handleSave} />
            <span className="ant-divider" />
            <Icon type="close" className="editable-cell-icon-close" onClick={this.handleCancel} />
          </div> :
          <div className="editable-cell-text-wrapper">
            {plainText}
            <Icon type="edit" className="editable-cell-icon" onClick={this.handleBeginEdit} />
          </div>
        }
      </div>
    );
  }
}
