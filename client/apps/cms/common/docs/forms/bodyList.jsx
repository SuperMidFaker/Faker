import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Input, Select, message } from 'antd';
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
    exemptions: state.cmsDeclare.params.exemptionWays,
    loginId: state.account.loginId,
  })
)
export default class BodyTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf(['import', 'export']),
    type: PropTypes.oneOf(['bill', 'entry']),
    readonly: PropTypes.bool,
    data: PropTypes.array.isRequired,
    headNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    billSeqNo: PropTypes.string,
    loginId: PropTypes.number.isRequired,
    units: PropTypes.array,
    countries: PropTypes.array,
    currencies: PropTypes.array,
    exemptions: PropTypes.array,
    onAdd: PropTypes.func.isRequired,
    onDel: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    const bodies = props.data;
    if (!props.readonly) {
      bodies.push({ id: '__ops' });
    }
    this.state = {
      editIndex: -1,
      editBody: {},
      bodies,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && !nextProps.readonly) {
      const bodies = [...nextProps.data];
      bodies.push({ id: '__ops' });
      this.setState({ bodies });
    }
  }
  getColumns() {
    const { ietype, type, readonly, units, countries, currencies, exemptions } = this.props;
    const { editIndex, bodies, editBody } = this.state;
    const totalCount = bodies.length;
    const columns = [{
      title: this.msg('seqNumber'),
      dataIndex: 'g_no',
      width: 50,
      fixed: 'left',
    }];
    if (type === 'bill') {
      columns.push({
        title: this.msg('copGNo'),
        width: 120,
        render: (o, record, index) =>
          <ColumnInput field="cop_g_no" inEdit={index === editIndex} record={record}
            onChange={this.handleEditChange} edit={editBody}
          />,
      });
    }
    columns.push({
      title: this.msg('emGNo'),
      width: 50,
      render: (o, record, index) =>
        <ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('codeT'),
      width: 100,
      render: (o, record, index) =>
        <ColumnInput field="code_t" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('codeS'),
      width: 60,
      render: (o, record, index) =>
        <ColumnInput field="code_s" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('gName'),
      width: 200,
      render: (o, record, index) =>
        <ColumnInput field="g_name" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('gModel'),
      render: (o, record, index) =>
        <ColumnInput field="g_model" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('netwt'),
      render: (o, record, index) =>
        <ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('grosswt'),
      render: (o, record, index) =>
        <ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('element'),
      render: (o, record, index) =>
        <ColumnInput field="element" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('quantity'),
      render: (o, record, index) =>
        <ColumnInput field="g_qty" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('unit'),
      render: (o, record, index) =>
        <ColumnSelect field="g_unit" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={units} edit={editBody}
        />,
    }, {
      title: ietype === 'import' ? this.msg('icountry') : this.msg('ecountry'),
      render: (o, record, index) =>
        <ColumnSelect field="orig_dest_country" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={countries} edit={editBody}
        />,
    }, {
      title: this.msg('decPrice'),
      render: (o, record, index) =>
        <ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('decTotal'),
      render: (o, record, index) =>
        <ColumnInput field="trade_total" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} edit={editBody}
        />,
    }, {
      title: this.msg('currency'),
      render: (o, record, index) =>
        <ColumnSelect field="trade_curr" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={currencies} edit={editBody}
        />,
    }, {
      title: this.msg('exemptionWay'),
      render: (o, record, index) =>
        <ColumnSelect field="duty_mode" inEdit={index === editIndex} record={record}
          onChange={this.handleEditChange} options={exemptions} edit={editBody}
        />,
    }, {
      title: this.msg('opColumn'),
      width: 90,
      fixed: 'right',
      render: (o, record, index) => {
        if (readonly) {
          return <span />;
        } else if (index === editIndex) {
          return (
            <span>
              <RowUpdater onHit={this.handleSave} label={this.msg('save')}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleCancel} label={this.msg('cancel')} />
            </span>
          );
        } else if (index + 1 === totalCount) {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('append')}
                index={index} row={{}}
              />
            </span>
          );
        } else {
          return (
            <span>
              <RowUpdater onHit={this.handleEdit} label={this.msg('edit')}
                row={record} index={index}
              />
              <span className="ant-divider" />
              <RowUpdater onHit={this.handleDel} label={this.msg('delete')}
                row={record} index={index}
              />
            </span>
          );
        }
      },
    });
    return columns;
  }

  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEditChange = (field, value) => {
    this.setState({
      editBody: { ...this.state.editBody, [field]: value },
    });
    // todo onsearch 项号 ems_no
  }
  handleEdit = (row, index) => {
    if (this.props.headNo) {
      this.setState({
        editIndex: index,
        editBody: row,
      });
    } else {
      message.error(this.msg('headUncreated'));
    }
  }
  handleSave = (row, index) => {
    const { editBody } = this.state;
    // todo validate
    if (!editBody.id) {
      const body = { ...editBody, list_g_no: index + 1 };
      const { billSeqNo, headNo, loginId } = this.props;
      this.props.onAdd({ billSeqNo, body, headNo, loginId }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          body.id = result.data.id;
          const bodies = [...this.state.bodies];
          bodies.splice(index, 0, body);
          this.setState({
            editIndex: -1,
            editBody: {},
            bodies,
          });
        }
      });
    } else {
      this.props.onEdit(editBody).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          const bodies = [...this.state.bodies];
          bodies[index] = editBody;
          this.setState({
            editIndex: -1,
            editBody: {},
            bodies,
          });
        }
      });
    }
  }
  handleDel = (row, index) => {
    this.props.onDel(row.id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const bodies = [...this.state.bodies];
        bodies.splice(index, 1);
        this.setState({
          bodies,
        });
      }
    });
  }
  handleCancel = () => {
    this.setState({
      editIndex: -1,
      editBody: {},
    });
  }
  render() {
    const columns = this.getColumns();
    return (<Table rowKey={getRowKey} columns={columns} dataSource={this.state.bodies}
      size="small" scroll={{ x: 2600, y: 300 }}
    />);
  }
}
