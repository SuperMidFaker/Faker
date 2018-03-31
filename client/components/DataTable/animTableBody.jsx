import React from 'react';
import { TweenOneGroup } from 'rc-tween-one';

const leaveAnim = [
  {
    duration: 250,
    x: -30,
    opacity: 0,
  }, {
    height: 0,
    duration: 200,
    ease: 'easeOutQuad',
  },
];

const AnimTableBody = props => (<TweenOneGroup
  component="tbody"
  {...props}
  leave={leaveAnim}
  appear={false}
/>);

export default AnimTableBody;
