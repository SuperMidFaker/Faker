/* eslint no-undef: 0 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import TrackingItem from './trackingItem';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTrackingItems, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition } from 'common/reducers/scvTracking';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    trackingItems: state.scvTracking.trackingItems,
  }),
  { loadTrackingItems, updateTrackingItem, removeTrackingItem, updateTrackingItemPosition }
)
@DragDropContext(HTML5Backend)
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
  constructor(props) {
    super(props);
    this.moveCard = this.moveCard.bind(this);
    this.state = {
      trackingItems: [],
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
    this.setState({ trackingItems: nextProps.trackingItems });
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
  render() {
    const { trackingItems } = this.state;
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
