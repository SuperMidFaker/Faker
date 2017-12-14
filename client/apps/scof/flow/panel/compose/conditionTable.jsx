import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Icon, Select, Popconfirm } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

const Option = Select.Option;

function EditableCell(props) {
  const {
    cellKey, value, index, text, options, editable, onChange,
  } = props;
  function handleChange(optValue) {
    onChange(cellKey, optValue, index);
  }
  return (
    editable ?
      <Select value={value} onChange={handleChange}>
        {
          options.map(opt => <Option key={opt.key} value={opt.key}>{opt.text}</Option>)
        }
      </Select>
      : <div>{text}</div>
  );
}

EditableCell.propTypes = {
  editable: PropTypes.bool,
  index: PropTypes.number.isRequired,
  value: PropTypes.string,
  text: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
  onChange: PropTypes.func.isRequired,
};

@injectIntl
export default class ConditionTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    bizObjects: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string.isRequired })),
    conditions: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      biz_object: PropTypes.string.isRequired,
      event: PropTypes.string.isRequired,
    })),
    onAdd: PropTypes.func.isRequired,
    onDel: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.msg = formatMsg(this.props.intl);
    this.columns = [{
      title: this.msg('bizObject'),
      dataIndex: 'biz_object',
      width: '50%',
      render: (text, row, index) => this.renderBizobjectColumn(row, index),
    }, {
      title: this.msg('bizEvents'),
      dataIndex: 'event',
      render: (text, row, index) => this.renderBizeventColumn(row, index),
    }, {
      width: 80,
      render: (text, record, index) => (
        <div className="editable-row-operations">
          {
            record.editable ?
              <span>
                <a onClick={() => this.handleEditDone(index)}><Icon type="save" /></a>
                <span className="ant-divider" />
                <a onClick={() => this.handleEditCancel(index)}><Icon type="close" /></a>
              </span>
              :
              <span>
                <a onClick={() => this.handleEdit(index)}><Icon type="edit" /></a>
                <span className="ant-divider" />
                <Popconfirm title="Sure to cancel?" onConfirm={() => this.handleDelete(index)}>
                  <a><Icon type="delete" /></a>
                </Popconfirm>
              </span>
          }
        </div>),
    }];
    const data = props.conditions.map(cond => ({
      editable: false,
      key: cond.id,
      biz_object: cond.biz_object,
      event: cond.event,
      pending: {},
      id: cond.id,
    }));
    this.state = { data };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.conditions !== this.props.conditions) {
      const data = nextProps.conditions.map(cond => ({
        editable: false,
        key: cond.id,
        biz_object: cond.biz_object,
        event: cond.event,
        pending: {},
        id: cond.id,
      }));
      this.setState({ data });
    }
  }
  handleAdd = () => {
    const rows = [...this.state.data];
    const lastIndex = rows.length > 0 ? rows[rows.length - 1].key : 0;
    rows.push({ key: lastIndex + 1, editable: true, pending: {} });
    this.setState({ data: rows });
  }
  handleCellChange = (key, value, index) => {
    const rows = [...this.state.data];
    rows[index].pending[key] = value;
    this.setState({ data: rows });
  }
  handleEdit(index) {
    const rows = [...this.state.data];
    rows[index].editable = true;
    rows[index].pending = {
      biz_object: rows[index].biz_object,
      event: rows[index].event,
    };
    this.setState({ data: rows });
  }
  handleEditDone(index) {
    const rows = [...this.state.data];
    const row = rows[index];
    if (!(row.pending.biz_object && row.pending.event)) {
      return;
    }
    const cond = {
      id: row.id, key: row.key, biz_object: row.pending.biz_object, event: row.pending.event,
    };
    rows[index].editable = false;
    rows[index].biz_object = cond.biz_object;
    rows[index].event = cond.event;
    rows[index].pending = {};
    this.setState({ data: rows });
    const newConds = rows.map(rw => ({ id: rw.key, biz_object: rw.biz_object, event: rw.event }));
    if (cond.id) {
      this.props.onUpdate(cond, newConds);
    } else {
      this.props.onAdd(cond, newConds);
    }
  }
  handleEditCancel(index) {
    const rows = [...this.state.data];
    if (!rows[index].biz_object) {
      rows.splice(index, 1);
    } else {
      rows[index].editable = false;
      rows[index].pending = {};
    }
    this.setState({ data: rows });
  }
  handleDelete(index) {
    const rows = [...this.state.data];
    const row = rows[index];
    rows.splice(index, 1);
    this.setState({ data: rows });
    const cond = { key: row.key };
    const newConds = rows.map(rw => ({ id: rw.key, biz_object: rw.biz_object, event: rw.event }));
    this.props.onDel(cond, newConds);
  }
  renderBizobjectColumn(row, index) {
    const { editable, pending } = row;
    let value = row.biz_object;
    if (editable) {
      value = pending.biz_object;
    }
    let options = [];
    if (editable) {
      options = this.props.bizObjects.map(bo => ({ key: bo.key, text: this.msg(bo.text) }));
    }
    const bizObj = this.props.bizObjects.filter(bo => bo.key === value)[0];
    return (<EditableCell editable={editable} value={value} index={index} options={options}
      text={bizObj && this.msg(bizObj.text)} onChange={this.handleCellChange} cellKey="biz_object"
    />);
  }
  renderBizeventColumn(row, index) {
    const { editable, pending } = row;
    let obj = row.biz_object;
    let value = row.event;
    if (editable) {
      obj = pending.biz_object;
      value = pending.event;
    }
    const bizObj = this.props.bizObjects.filter(bo => bo.key === obj)[0];
    const bizEvent = bizObj && bizObj.triggers.filter(tr => tr.key === value)[0];
    let options = [];
    if (editable && bizObj) {
      options = bizObj.triggers.map(tr => ({ key: tr.key, text: this.msg(tr.text) }));
    }
    return (<EditableCell editable={editable} value={value} index={index} options={options}
      text={bizEvent && this.msg(bizEvent.text)} onChange={this.handleCellChange} cellKey="event"
    />);
  }
  render() {
    const { data } = this.state;
    return (
      <Table dataSource={data} columns={this.columns} pagination={false} size="middle"
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }} />}
      />);
  }
}
