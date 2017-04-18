import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Input, Popconfirm, Select, Icon } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTrackingItems, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition } from 'common/reducers/scvTracking';

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    trackingItems: state.scvTracking.trackingItems,
  }),
  { loadTrackingItems, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class TrackingItems extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loadTrackingItems: PropTypes.func.isRequired,
    updateTrackingItem: PropTypes.func.isRequired,
    tracking: PropTypes.object.isRequired,
    trackingItems: PropTypes.array.isRequired,
    removeTrackingItem: PropTypes.func.isRequired,
    updateTrackingItemPosition: PropTypes.func.isRequired,
  }
  state = {
    editId: -1,
    trackingItems: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tracking.id !== this.props.tracking.id) {
      this.props.loadTrackingItems(nextProps.tracking.id || -1);
    }
    this.setState({ trackingItems: nextProps.trackingItems });
  }
  msg = key => formatMsg(this.props.intl, key)
  handleRemove = (id) => {
    this.props.removeTrackingItem(id).then(() => {
      this.props.loadTrackingItems(this.props.tracking.id);
    });
  }
  handleEdit = (id) => {
    this.setState({ editId: id });
  }
  handleSave = (id) => {
    this.props.updateTrackingItem(this.state.trackingItems.find(item => item.id === id)).then(() => {
      this.setState({ editId: -1 });
      this.props.loadTrackingItems(this.props.tracking.id);
    });
  }
  handleMovePosition = (id, direction) => {
    const { trackingItems } = this.state;
    const index = trackingItems.findIndex(item => item.id === id);
    if (direction === 'up') {
      this.props.updateTrackingItemPosition([
        { id: trackingItems[index].id, position: trackingItems[index - 1].position },
        { id: trackingItems[index - 1].id, position: trackingItems[index].position },
      ]).then(() => {
        this.props.loadTrackingItems(this.props.tracking.id);
      });
    } else if (direction === 'down') {
      this.props.updateTrackingItemPosition([
        { id: trackingItems[index].id, position: trackingItems[index + 1].position },
        { id: trackingItems[index + 1].id, position: trackingItems[index].position },
      ]).then(() => {
        this.props.loadTrackingItems(this.props.tracking.id);
      });
    }
  }
  render() {
    const { editId, trackingItems } = this.state;
    const columns = [{
      dataIndex: 'title',
      key: 'title',
      title: '名称',
      width: 120,
      render: o => (<span className="menu-sider-item">{o}</span>),
    }, {
      dataIndex: 'custom_title',
      key: 'custom_title',
      title: '自定义名称',
      width: 200,
      render: (o, row) => {
        if (editId === row.id) {
          return (<Input value={o} onChange={(e) => {
            const tis = this.state.trackingItems.map((item) => {
              if (item.id === row.id) {
                return { ...item, custom_title: e.target.value };
              } else {
                return item;
              }
            });
            this.setState({ trackingItems: tis });
          }}
          />);
        }
        return (<span className="menu-sider-item">{o}</span>);
      },
    }, {
      dataIndex: 'filterable',
      key: 'filterable',
      title: '可过滤',
      width: 50,
      render: (o, row) => {
        if (editId === row.id) {
          return (<Select value={o} onChange={(value) => {
            const tis = this.state.trackingItems.map((item) => {
              if (item.id === row.id) {
                return { ...item, filterable: Number(value) };
              } else {
                return item;
              }
            });
            this.setState({ trackingItems: tis });
          }}
            style={{ width: '100%' }}
          >
            <Option value={1}>是</Option>
            <Option value={0}>否</Option>
          </Select>
          );
        }
        return (<span className="menu-sider-item">{o === 1 ? '是' : '否'}</span>);
      },
    }, {
      dataIndex: 'position',
      key: 'position',
      title: '排序',
      width: 50,
      render: (o, row) => {
        const options = [];
        const index = trackingItems.findIndex(item => item.id === row.id);
        if (index > 0) {
          options.push(<a role="button" onClick={() => this.handleMovePosition(row.id, 'up')}><Icon type="arrow-up" /></a>);
        }
        if (index < trackingItems.length - 1) {
          options.push(<a role="button" onClick={() => this.handleMovePosition(row.id, 'down')}><Icon type="arrow-down" /></a>);
        }
        return (
          <span className="menu-sider-item">
            {options}
          </span>
        );
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 50,
      render: (_, row) => {
        if (row.id === this.state.editId) {
          return (
            <a role="button" onClick={() => this.handleSave(row.id)}><Icon type="save" /></a>
          );
        }
        return (
          <span>
            <a role="button" onClick={() => this.handleEdit(row.id)}><Icon type="edit" /></a>
            <span className="ant-divider" />
            <Popconfirm title="确认删除?" onConfirm={() => this.handleRemove(row.id)}>
              <a role="button"><Icon type="delete" /></a>
            </Popconfirm>
          </span>
        );
      },
    }];
    return (
      <div className="page-body">
        <div className="panel-body table-panel">
          <Table columns={columns} dataSource={trackingItems} pagination={false} rowKey="id" />
        </div>
      </div>);
  }
}
