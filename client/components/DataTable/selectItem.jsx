/* eslint no-param-reassign: 0 */
/* eslint react/no-find-dom-node: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { Checkbox, Button, Icon } from 'antd';
import { DragSource, DropTarget } from 'react-dnd';
const ItemTypes = {
  CARD: 'card',
};

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
    };
  },
};

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().id;
    const hoverIndex = props.id;

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
    props.moveSelect(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().id = hoverIndex;
  },
};

@DropTarget(ItemTypes.CARD, cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class SelectItem extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    checked: PropTypes.bool.isRequired,
    title: PropTypes.string,
    index: PropTypes.number.isRequired,
    moveSelect: PropTypes.func.isRequired,
    onFixed: PropTypes.func.isRequired,
    fixed: PropTypes.string,
  };
  render() {
    const { isDragging, connectDragSource, connectDropTarget, checked, index, title, id, onFixed, fixed } = this.props;
    const opacity = isDragging ? 0 : 1;
    return connectDragSource(connectDropTarget(
      <div className="col-selection-item" style={{ opacity }}>
        <Checkbox id={id} checked={checked} onChange={() => this.props.onChange(index)}>
          {title}
        </Checkbox>
        <Button size="small" shape="circle" icon="pushpin-o" onClick={() => onFixed(index)} />
        {fixed && <Icon type="pushpin-o" />}
      </div>
    ));
  }
}
