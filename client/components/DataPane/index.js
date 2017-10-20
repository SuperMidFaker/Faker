import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import './index.less';
import toolbar from './toolbar';
import actions from './actions';
import bulkActions from './bulkActions';


export default class DataPane extends React.Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
  }
  static propTypes = {
    children: PropTypes.any,
    fullscreen: PropTypes.bool,
  }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - 470,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fullscreen) {
      this.setState({
        scrollY: window.innerHeight - 470,
      });
    } else {
      this.setState({
        scrollY: window.innerHeight - 200,
      });
    }
  }
  render() {
    const { children, columns } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        {children}
        <Table size="middle" {...this.props}
          pagination={{ defaultPageSize: 20, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
          scroll={{ x: columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0), y: this.state.scrollY }}
        />
      </div>
    );
  }
}

DataPane.Toolbar = toolbar;
DataPane.Actions = actions;
DataPane.BulkActions = bulkActions;
