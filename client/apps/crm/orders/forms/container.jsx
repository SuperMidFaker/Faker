import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import ReactDataGrid from '@welogix/react-data-grid';
import { CONTAINER_PACKAGE_TYPE } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

function createRows() {
  return CONTAINER_PACKAGE_TYPE.map((item, index) => ({
    id: index,
    container_type: item.value,
    container_num: 0,
  }));
}

@injectIntl
export default class Container extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    value: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  }
  state = {
    rows: createRows(),
  }
  componentWillMount() {
    this.initializeRows(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.initializeRows(nextProps);
  }
  initializeRows(props) {
    if (props.value.length > 0) {
      const rows = [...this.state.rows];
      const value = props.value;
      for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < value.length; j++) {
          if (rows[i].container_type === value[j].container_type) {
            rows[i].container_num = value[j].container_num;
          }
        }
      }
      this.setState({ rows });
    }
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)

  rowGetter = rowIdx => this.state.rows[rowIdx]
  handleRowUpdated = (e) => {
    const rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({ rows });
    const value = rows.filter(row => Number(row.container_num) > 0).map(item => ({ ...item, container_num: Number(item.container_num) }));
    this.props.onChange(value);
  }
  render() {
    const columns = [{
      name: '集装箱类型',
      key: 'container_type',
      editable: false,
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
        minHeight={300}
        minWidth={200}
        onRowUpdated={this.handleRowUpdated}
      />
    );
  }
}
