import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { Icon, Tag, Select } from 'antd';
import { formatMsg } from '../message.i18n';

const Option = Select.Option;
@injectIntl
export default class SyncShareEditCell extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    checkedBrokers: PropTypes.arrayOf(
      PropTypes.shape({ tenant_id: PropTypes.number.isRequired })
    ).isRequired,
    shareBrokers: PropTypes.arrayOf(
      PropTypes.shape({ tenant_id: PropTypes.number.isRequired })
    ).isRequired,
    onSave: PropTypes.func.isRequired,
  }
  state = {
    editMode: false,
    value: [],
  }
  componentWillMount() {
    this.setState({ value: this.props.checkedBrokers.map(cb => cb.tenant_id) });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.checkedBrokers !== this.props.checkedBrokers) {
      this.setState({ value: nextProps.checkedBrokers.map(cb => cb.tenant_id) });
    }
  }
  msg = formatMsg(this.props.intl)
  handleBeginEdit = () => { this.setState({ editMode: true }); }
  handleCancel = () => { this.setState({ editMode: false }); }
  handleSave = () => { this.props.onSave(this.state.value); }
  handleChange = (value) => { this.setState({ value }); }
  render() {
    const { editMode, value } = this.state;
    const { checkedBrokers, shareBrokers } = this.props;
    let plainText = null;
    if (!editMode) {
      plainText = checkedBrokers.slice(0, 5).map(cb => <Tag key={`${cb.tenant_id}${cb.name}`}>{cb.name}</Tag>);
      if (checkedBrokers.length > 5) {
        plainText.push('...');
      }
    }
    return (
      <div className="editable-cell">
        {editMode ?
          <div className="editable-cell-input-wrapper">
            <Select mode="tags" value={value} style={{ width: '90%' }}
              onChange={this.handleChange}
            >
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
