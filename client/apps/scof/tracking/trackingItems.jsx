/* eslint no-undef: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Input, Select, message } from 'antd';
import update from 'immutability-helper';
import RowAction from 'client/components/RowAction';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TrackingItem from './trackingItem';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTrackingItems, addTrackingItem, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition } from 'common/reducers/sofTracking';

const formatMsg = format(messages);
const Option = Select.Option;
const colStyle = { paddingTop: 0, paddingBottom: 0 };
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackingItems: state.sofTracking.trackingItems,
    trackingFields: state.sofTracking.trackingFields,
  }),
  {
    loadTrackingItems, addTrackingItem, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition,
  }
)
@DragDropContext(HTML5Backend)
export default class TrackingItems extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadTrackingItems: PropTypes.func.isRequired,
    updateTrackingItem: PropTypes.func.isRequired,
    tracking: PropTypes.object.isRequired,
    trackingItems: PropTypes.array.isRequired,
    trackingFields: PropTypes.array.isRequired,
    removeTrackingItem: PropTypes.func.isRequired,
    updateTrackingItemPosition: PropTypes.func.isRequired,
    addTrackingItem: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
    this.state = {
      trackingItems: [],
      newItem: {
        custom_title: '',
        datatype: null,
        source: 3,
        tracking_id: this.props.tracking.id,
        tenant_id: this.props.tenantId,
        field: '',
        title: '',
        position: 0,
        width: 150,
        editable: 1,
      },
    };
  }
  componentDidMount() {
    // $(document).unbind('dragend');
    window.document.removeEventListener('dragend', this.handleDragend());
    // $(document).on('dragend', this.handleDragend);
    window.document.addEventListener('dragend', this.handleDragend());
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tracking.id !== this.props.tracking.id) {
      this.props.loadTrackingItems(nextProps.tracking.id || -1);
    }
    this.setState({
      trackingItems: nextProps.trackingItems,
      newItem: {
        ...this.state.newItem,
        position: nextProps.trackingItems.length + 1,
        tracking_id: nextProps.tracking.id,
        field: `custom_${nextProps.tracking.id}_${nextProps.trackingFields.length + nextProps.trackingItems.filter(item => item.source === 3).length + 1}`,
      },
    });
  }
  msg = key => formatMsg(this.props.intl, key)
  moveCard(dragIndex, hoverIndex) {
    const { trackingItems } = this.state;
    const dragCard = trackingItems[dragIndex];
    const state = update(this.state, {
      trackingItems: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      },

    });
    this.setState({ ...state });
  }
  handleRemove = (item) => {
    this.props.removeTrackingItem(item.id, item.source).then(() => {
      this.props.loadTrackingItems(this.props.tracking.id);
    });
  }
  handleSave = (trackingItem) => {
    this.props.updateTrackingItem(trackingItem).then(() => {
      this.props.loadTrackingItems(this.props.tracking.id);
    });
  }
  handleDragend = () => {
    const positions = this.state.trackingItems.map((item, index) => ({ id: item.id, position: index + 1 }));
    this.props.updateTrackingItemPosition(positions).then(() => {
      this.props.loadTrackingItems(this.props.tracking.id);
    });
  }
  handleCustomTitleChange = (id, value) => {
    const trackingItem = this.state.trackingItems.find(item => item.id === id);
    this.handleSave({ ...trackingItem, custom_title: value });
  }
  handleWidthChange = (id, value) => {
    const trackingItem = this.state.trackingItems.find(item => item.id === id);
    this.handleSave({ ...trackingItem, width: Number(value) });
  }
  handleDatatypeChange = (id, value) => {
    const trackingItem = this.state.trackingItems.find(item => item.id === id);
    this.handleSave({ ...trackingItem, datatype: value });
  }
  handleEditableChange = (id, value) => {
    const trackingItem = this.state.trackingItems.find(item => item.id === id);
    this.handleSave({ ...trackingItem, editable: Number(value) });
  }
  handleAddItem = () => {
    const { newItem } = this.state;
    if (!newItem.datatype) {
      message.warn('请选择数据类型');
    } else if (!newItem.custom_title) {
      message.warn('请填写显示名称');
    } else {
      this.props.addTrackingItem({ ...newItem, title: newItem.custom_title }).then(() => {
        this.setState({
          newItem: { ...this.state.newItem, custom_title: '', datatype: null },
        });
        this.props.loadTrackingItems(this.props.tracking.id);
      });
    }
  }
  render() {
    const { trackingItems, newItem } = this.state;
    return (

      <Card bodyStyle={{ padding: 0 }}>
        <div className="ant-table-wrapper">
          <div className="ant-table">
            <table className="ant-table" style={{ width: '100%', fontSize: 14 }}>
              <thead className="ant-table-thead">
                <tr><th><span /></th><th>追踪数据列</th><th>显示名称</th><th>显示宽度</th><th>数据类型</th><th>可编辑</th><th>操作</th></tr>
              </thead>
              <tbody className="ant-table-tbody">
                {trackingItems.map((row, i) => (
                  <TrackingItem
                    key={row.id}
                    index={i}
                    id={row.id}
                    row={row}
                    moveCard={this.moveCard}
                    handleCustomTitleChange={this.handleCustomTitleChange}
                    handleWidthChange={this.handleWidthChange}
                    handleEditableChange={this.handleEditableChange}
                    handleRemove={this.handleRemove}
                    handleDatatypeChange={this.handleDatatypeChange}
                  />
                  ))}
                <tr className="ant-table-row  ant-table-row-level-0" style={{ height: 43 }}>
                  <td style={{ ...colStyle, width: 50 }} />
                  <td style={{ ...colStyle, width: '25%' }} />
                  <td style={{ ...colStyle }}>
                    <Input
                      style={{ width: '80%' }}
                      value={newItem.custom_title}
                      onChange={e => this.setState({ newItem: { ...newItem, custom_title: e.target.value } })}
                    />
                  </td>
                  <td style={{ ...colStyle, width: 150 }}>
                    <Input
                      style={{ width: '80%' }}
                      value={newItem.width}
                      onChange={e => this.setState({ newItem: { ...newItem, width: Number(e.target.value) } })}
                    />
                  </td>
                  <td style={{ ...colStyle, width: 200 }}>
                    <Select
                      style={{ width: '80%' }}
                      value={this.state.newItem.datatype}
                      onChange={value => this.setState({ newItem: { ...newItem, datatype: value } })}
                    >
                      <Option value="STRING">文本</Option>
                      <Option value="INTEGER">数字</Option>
                      <Option value="DATE">日期</Option>
                    </Select>
                  </td>
                  <td style={{ ...colStyle, width: 60 }}>
                      是
                  </td>
                  <td style={{ ...colStyle, width: 100 }} className="editable-row-operations">
                    <RowAction primary onClick={this.handleAddItem} icon="save" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

    );
  }
}
