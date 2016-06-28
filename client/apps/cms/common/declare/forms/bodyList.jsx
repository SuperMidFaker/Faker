import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Input, Select } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from '../rowUpdater';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);
const Option = Select.Option;

function getRowKey(row) {
  return row.id;
}
function ColumnInput(props) {
  const { inEdit, edit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  return inEdit ? <Input value={edit[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  edit: PropTypes.object,
  onChange: PropTypes.func,
};

function ColumnSelect(props) {
  const { inEdit, edit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={edit[field] || ''} onChange={handleChange} style={{ width: '100%' }}>
        {
          options.map((opt, idx) => <Option value={opt.value} key={`${opt.value}${idx}`}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    const foundOpts = options.filter(opt => opt.value === record[field]);
    const label = foundOpts.length === 1 ? foundOpts[0].text : '';
    return <span>{label}</span>;
  }
}

ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  edit: PropTypes.object,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

@injectIntl
@connect(
  state => ({
    units: state.cmsDeclare.params.units.map(un => ({
      value: un.unit_code,
      text: un.unit_name,
    })),
    countries: state.cmsDeclare.params.tradeCountries.map(tc => ({
      value: tc.cntry_co,
      text: tc.cntry_name_cn,
    })),
    currencies: state.cmsDeclare.params.currencies.map(cr => ({
      value: cr.curr_code,
      text: cr.curr_name,
    })),
  })
)
export default class BodyTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.array.isRequired,
    ietype: PropTypes.oneOf([ 'import', 'export' ]),
    type: PropTypes.oneOf([ 'bill', 'entry' ]),
    readonly: PropTypes.bool,
    units: PropTypes.array,
    countries: PropTypes.array,
    currencies: PropTypes.array,
    onAdd: PropTypes.func.isRequired,
    onDel: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    const bodys = props.data;
    if (!props.readonly) {
      bodys.push({ id: '__ops'});
    }
    this.state = {
      editIndex: -1,
      editBody: {},
      bodys,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && !nextProps.readonly) {
      const bodys = [...nextProps.data];
      bodys.push({ id: '__ops' });
      this.setState({ bodys });
    }
  }
  getColumns() {
    const { ietype, type, readonly, units, countries, currencies } = this.props;
    const { editIndex, bodys, editBody } = this.state;
    const totalCount = bodys.length;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'list_g_no',
      width: 40,
    }];
    if (type === 'bill') {
      columns.push({
        title: this.msg('copGNo'),
        width: 100,
        render: (o, record, index) =>
          <ColumnInput field="cop_g_no" inEdit={index === editIndex} record={record}
            onChange={this.handleEditChange} edit={editBody} />,
      });
    }
    columns.push({
      title: this.msg('emGNo'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('codeT'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="code_t" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('codeS'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="code_s" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('gName'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="g_name" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('gModel'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="g_model" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('netwt'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('grosswt'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('quantity'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="qty" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('unit'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="unit" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody} />,
    }, {
      title: ietype === 'import' ? this.msg('icountry') : this.msg('ecountry'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="country_code" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody} />,
    }, {
      title: this.msg('decPrice'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('decTotal'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="dec_total" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('currency'),
      width: 80,
      render: (o, record, index) =>
        <ColumnSelect field="curr" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={currencies} edit={editBody} />,
    }, {
      title: this.msg('rmModeName'),
      width: 80,
      render: (o, record, index) =>
        <ColumnInput field="rm_mode" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody} />,
    }, {
      title: this.msg('opColumn'),
      width: 80,
      render: (o, record, index) => {
        if (readonly) {
          return <span />;
        } else if (index === editIndex) {
          return (
            <span>
              <RowUpdater onHit={this.handleSave} label={this.msg('save')}
                row={record} index={index} />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleCancel} label={this.msg('cancel')} />
            </span>
          );
        } else if (index + 1 === totalCount) {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('append')}
                index={index} row={{}} />
            </span>
          );
        } else {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('edit')}
                row={record} index={index}/>
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleDel} label={this.msg('delete')}
                row={record} index={index} />
            </span>
          );
        }
      }
    });
    return columns;
  }

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEditChange = (field, value) => {
    this.setState({
      editBody: { ...this.state.editBody, [field]: value },
    });
  }
  handleEdit = (row, index) => {
    this.setState({
      editIndex: index,
      editBody: row,
    });
  }
  handleSave = (row, index) => {
    const { editBody } = this.state;
    const bodys = [ ...this.state.bodys ];
    if (!editBody.id) {
      bodys.splice(index, 0, { id: `__bill_body${index}`, list_g_no: index + 1, ...editBody });
      this.props.onAdd({ ...editBody, list_g_no: index + 1 });
      this.setState({
        editIndex: -1,
        bodys,
      });
    } else {
      bodys[index] = editBody;
      this.setState({
        editIndex: -1,
        bodys,
      });
      if (this.props.data.filter(dat => dat.id === editBody.id).length === 1) {
        this.props.onEdit(editBody);
      } else {
        this.props.onAdd(editBody);
      }
    }
  }
  handleDel = (row, index) => {
    const bodys = [...this.state.bodys];
    bodys.splice(index, 1);
    this.setState({
      bodys,
    });
    if (this.props.data.filter(dat => dat.id === this.state.editBody.id).length === 1) {
      this.props.onDel(row.id);
    }
  }
  handleCancel = () => {
    this.setState({
      editIndex: -1,
      editBody: {},
    });
  }
  render() {
    const columns = this.getColumns();
    return <Table rowKey={getRowKey} columns={columns} dataSource={this.state.bodys} />;
  }
}
