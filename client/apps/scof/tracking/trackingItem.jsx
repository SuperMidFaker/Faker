/* eslint no-param-reassign: 0 */
/* eslint react/no-find-dom-node: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Icon } from 'antd';
import { DragSource, DropTarget } from 'react-dnd';
import RowAction from 'client/components/RowAction';
import EditableCell from 'client/components/EditableCell';
const ItemTypes = {
  CARD: 'card',
};

const style = {
  height: 43,
};

const colStyle = { paddingTop: 0, paddingBottom: 0 };

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveCard(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

@DropTarget(ItemTypes.CARD, cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class TrackingItem extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    row: PropTypes.object.isRequired,
    moveCard: PropTypes.func.isRequired,
    handleCustomTitleChange: PropTypes.func.isRequired,
    handleWidthChange: PropTypes.func.isRequired,
    handleEditableChange: PropTypes.func.isRequired,
    handleRemove: PropTypes.func.isRequired,
    handleDatatypeChange: PropTypes.func.isRequired,
  };

  render() {
    const { row, isDragging, connectDragSource, connectDropTarget } = this.props;
    const opacity = isDragging ? 0 : 1;
    return connectDragSource(connectDropTarget(
      <tr style={{ ...style, opacity }} className="ant-table-row  ant-table-row-level-0">
        <td style={{ ...colStyle, width: 50 }}>
          {row.source === 1 && <Icon type="rocket" />}
          {row.source === 2 && <Icon type="form" />}
          {row.source === 3 && <Icon type="form" />}
        </td>
        <td style={{ ...colStyle, width: '25%' }}>{row.title}</td>
        <td style={{ ...colStyle }}>
          <EditableCell value={row.custom_title} cellTrigger
            onSave={value => this.props.handleCustomTitleChange(row.id, value)}
          />
        </td>
        <td style={{ ...colStyle, width: 150 }}>
          <EditableCell value={row.width} cellTrigger
            onSave={value => this.props.handleWidthChange(row.id, value)}
          />
        </td>
        <td style={{ ...colStyle, width: 200 }}>
          <EditableCell value={row.datatype} type="select" cellTrigger
            options={[{ key: 'STRING', text: '文本' }, { key: 'INTEGER', text: '数字' }, { key: 'DATE', text: '日期' }]}
            onSave={value => this.props.handleDatatypeChange(row.id, value)}
          />
        </td>
        <td style={{ ...colStyle, width: 150 }}>
          <EditableCell value={String(row.editable)} type="select" cellTrigger
            options={[{ key: '0', text: '否' }, { key: '1', text: '是' }]}
            onSave={value => this.props.handleEditableChange(row.id, value)}
          />
        </td>
        <td style={{ ...colStyle, width: 100 }}>
          <RowAction danger confirm="确认删除?" onConfirm={this.props.handleRemove} row={row} icon="delete" />
        </td>
      </tr>
    ));
  }
}
