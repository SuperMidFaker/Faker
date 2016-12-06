import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import ReactDataGrid from '@welogix/react-data-grid';
import { Editors } from '@welogix/react-data-grid/addons';
import { CONTAINER_PACKAGE_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const DropDownEditor = Editors.DropDownEditor;

function createRows(numberOfRows) {
  const _rows = [];
  for (let i = 0; i < numberOfRows; i++) {
    _rows.push({
      id: i,
      container_type: '',
      container_num: 0,
    });
  }
  return _rows;
}

@injectIntl
export default class Container extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    rows: createRows(10),
  }
  componentWillMount() {
    if (this.props.value.length > 0) {
      this.setState({ rows: this.props.value.concat(createRows(10)) });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value.length > 0) {
      this.setState({ rows: nextProps.value.concat(createRows(10)) });
    }
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)

  rowGetter = (rowIdx) => {
    return this.state.rows[rowIdx];
  }
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({ rows });
    const value = rows.filter(row => row.container_type !== '').map(item => ({ ...item, container_num: Number(item.container_num) }));
    this.props.onChange(value);
  }
  render() {
    const columns = [{
      name: '集装箱类型',
      key: 'container_type',
      width: 150,
      editor: <DropDownEditor options={CONTAINER_PACKAGE_TYPE.map(item => item.value)} />,
    }, {
      name: '数量',
      key: 'container_num',
      editable: true,
    }];
    return (
      <ReactDataGrid
        enableCellSelect
        columns={columns}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        minHeight={400}
        minWidth={500}
        onRowUpdated={this.handleRowUpdated}
      />
    );
  }
}
