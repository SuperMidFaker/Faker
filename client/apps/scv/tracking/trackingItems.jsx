/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Input, Select } from 'antd';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TrackingItem from './trackingItem';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTrackingItems, addTrackingItem, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition } from 'common/reducers/scvTracking';

const formatMsg = format(messages);
const Option = Select.Option;
const colStyle = { paddingTop: 0, paddingBottom: 0 };
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackingItems: state.scvTracking.trackingItems,
  }),
  { loadTrackingItems, addTrackingItem, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition }
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
        source: null,
        tracking_id: this.props.tracking.id,
        tenant_id: this.props.tenantId,
        field: '',
        title: '',
        position: 0,
      },
    };
  }
  componentDidMount() {
    $(document).unbind('dragend');
    $(document).on('dragend', this.handleDragend);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tracking.id !== this.props.tracking.id) {
      this.props.loadTrackingItems(nextProps.tracking.id || -1);
    }
    this.setState({
      trackingItems: nextProps.trackingItems,
      newItem: { ...this.state.newItem, position: nextProps.trackingItems.length + 1, tracking_id: nextProps.tracking.id },
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
  handleRemove = (id) => {
    this.props.removeTrackingItem(id).then(() => {
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
  handleDatatypeChange = (id, value) => {
    const trackingItem = this.state.trackingItems.find(item => item.id === id);
    this.handleSave({ ...trackingItem, datatype: value });
  }
  handleAddItem = () => {
    const { newItem } = this.state;
    this.props.addTrackingItem({ ...newItem, title: newItem.custom_title }).then(() => {
      this.setState({
        newItem: { ...this.state.newItem, custom_title: '', datatype: null, source: null },
      });
      this.props.loadTrackingItems(this.props.tracking.id);
    });
  }
  render() {
    const { trackingItems, newItem } = this.state;
    return (
      <div className="page-body">
        <div className="panel-body table-panel">
          <div className="ant-table-wrapper">
            <div className="ant-table">
              <table className="ant-table" style={{ width: '100%' }}>
                <thead className="ant-table-thead">
                  <tr><th>名称</th><th>自定义名称</th><th>来源</th><th>数据类型</th><th>操作</th></tr>
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
                      handleRemove={this.handleRemove}
                      handleDatatypeChange={this.handleDatatypeChange}
                    />
                  ))}
                  <tr className="ant-table-row  ant-table-row-level-0" style={{ height: 43 }}>
                    <td style={{ ...colStyle, width: '30%' }} />
                    <td style={{ ...colStyle, width: '30%' }}>
                      <Input
                        style={{ width: '80%' }}
                        value={newItem.custom_title}
                        onChange={e => this.setState({ newItem: { ...this.state.newItem, custom_title: e.target.value } })}
                      />
                    </td>
                    <td style={{ ...colStyle, width: '20%' }}>
                      <Select
                        style={{ width: '80%' }}
                        value={this.state.newItem.source}
                        onChange={value => this.setState({ newItem: { ...this.state.newItem, source: value } })}
                      >
                        <Option value={1}>承运商</Option>
                        <Option value={2}>第三方</Option>
                        <Option value={3}>手工录入</Option>
                      </Select>
                    </td>
                    <td style={{ ...colStyle, width: '15%' }}>
                      <Select
                        style={{ width: '80%' }}
                        value={this.state.newItem.datatype}
                        onChange={value => this.setState({ newItem: { ...this.state.newItem, datatype: value } })}
                      >
                        <Option value="STRING">文本</Option>
                        <Option value="INTEGER">数字</Option>
                        <Option value="DATE">日期</Option>
                      </Select>
                    </td>
                    <td style={{ ...colStyle, width: '5%' }}>
                      <a role="button" onClick={this.handleAddItem}><Icon type="save" /></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
