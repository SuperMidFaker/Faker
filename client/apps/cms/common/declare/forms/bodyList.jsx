import React, { PropTypes } from 'react';
import { Table, Input, Select } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import RowUpdater from '../rowUpater';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

function ColumnInput(props) {
  const { inEdit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(field, ev.target.value);
    }
  }
  return inEdit ? <Input value={record[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

function ColumnSelect(props) {
  const { inEdit, record, field, options, onChange } = props;
  function handleChange(value) {
    if (onChange) {
      onChange(field, value);
    }
  }
  if (inEdit) {
    return (
      <Select value={record[field] || ''} onChange={handleChange}>
        {
          options.map(opt => <Option value={opt.value}>{opt.text}</Option>)
        }
      </Select>
    );
  } else {
    return <span>{record[field] || ''}</span>;
  }
}

ColumnSelect.proptypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
};

function getColumns(ietype, type, editIndex, totalCount, handlers, selector, readonly, msg) {
  const columns = [{
    title: msg('seqNumber'),
    dataIndex: 'list_g_no'
  }];
  if (type === 'bill') {
    columns.push({
      title: msg('copGNo'),
      render: (o, record, index) =>
        <ColumnInput field="cop_g_no" inEdit={index === editIndex} record={record}
          onChange={handlers.onChange} />,
    });
  }
  columns.push({
    title: msg('emGNo'),
    render: (o, record, index) =>
      <ColumnInput field="em_g_no" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('codeT'),
    render: (o, record, index) =>
      <ColumnInput field="code_t" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('codeS'),
    render: (o, record, index) =>
      <ColumnInput field="code_s" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('gName'),
    render: (o, record, index) =>
      <ColumnInput field="g_name" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('gModel'),
    render: (o, record, index) =>
      <ColumnInput field="g_model" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('netwt'),
    render: (o, record, index) =>
      <ColumnInput field="wet_wt" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('grosswt'),
    render: (o, record, index) =>
      <ColumnInput field="gross_wt" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('quantity'),
    render: (o, record, index) =>
      <ColumnInput field="qty" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('unit'),
    render: (o, record, index) =>
      <ColumnSelect field="unit" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} options={selector.units} />,
  }, {
    title: ietype === 'import' ? msg('icountry') : msg('ecountry'),
    render: (o, record, index) =>
      <ColumnSelect field="country_code" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} options={selector.countries} />,
  }, {
    title: msg('decPrice'),
    render: (o, record, index) =>
      <ColumnInput field="dec_price" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('decTotal'),
    render: (o, record, index) =>
      <ColumnInput field="dec_total" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('currency'),
    render: (o, record, index) =>
      <ColumnSelect field="curr" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} options={selector.currency} />,
  }, {
    title: msg('rmModeName'),
    render: (o, record, index) =>
      <ColumnInput field="rm_mode" inEdit={index === editIndex} record={record}
        onChange={handlers.onChange} />,
  }, {
    title: msg('opColumn'),
    render: (o, record, index) => {
      if (readonly) {
        return <span />;
      } else if (index === editIndex) {
        return (
          <span>
            <RowUpdater onHit={handlers.onSave} label={msg('save')} />
            <span className="ant-divider" />
            <RowUpdater onHit={handlers.onCancel} label={msg('cancel')} />
          </span>
        );
      } else if (index + 1 === totalCount) {
        return (
          <span>
            <RowUpdater onHit={handlers.onAppend} label={msg('append')} />
          </span>
        );
      } else {
        return (
          <span>
            <RowUpdater onHit={handlers.onSave} label={msg('edit')} />
            <span className="ant-divider" />
            <RowUpdater onHit={handlers.onCancel} label={msg('delete')} />
          </span>
        );
      }
    }
  });
  return columns;
}

@injectIntl
export default class BodyTable extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    ietype: PropTypes.oneOf([ 'import', 'export' ]),
    type: PropTypes.oneOf([ 'bill', 'entry' ]),
    readonly: PropTypes.bool,
  }
  state = {
    editIndex: -1,
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  render() {
    const { ietype, type, readonly } = this.props;
    const { editIndex } = this.state;
    const columns = getColumns(ietype, type, editIndex, 1, {}, {}, readonly, this.msg);
    return <Table columns={columns} dataSource={[{ key: '__ops'}]} />;
  }
}
