import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import './index.less';
import toolbar from './toolbar';
import actions from './actions';
import extra from './extra';
import bulkActions from './bulkActions';


export default class DataPane extends React.Component {
  static defaultProps = {
    baseCls: 'welo-data-pane',
    scrollOffset: 470,
  }
  static propTypes = {
    children: PropTypes.any,
    header: PropTypes.string,
    fullscreen: PropTypes.bool,
    scrollOffset: PropTypes.number,
  }
  state = { scrollY: 0 }
  componentWillMount() {
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
      this.setState({
        scrollY: window.innerHeight - this.props.scrollOffset,
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.fullscreen !== this.props.fullscreen) {
      if (nextProps.fullscreen) {
        this.setState({
          scrollY: window.innerHeight - this.props.scrollOffset,
        });
      } else {
        this.setState({
          scrollY: window.innerHeight - 200,
        });
      }
    }
  }
  render() {
    const {
      baseCls, children, columns, header,
    } = this.props;
    return (
      <div className={baseCls}>
        {header ? <div className={`${baseCls}-header`}>{header}</div> : null}
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
DataPane.Extra = extra;
DataPane.BulkActions = bulkActions;
