import React from 'react';

export default function ContentWrapper(props) {
  return (
    <div className="main-content">
      <div className="page-body">
        <div className="panel-body body-responsive" style={{padding: 20}}>
          {props.children}
        </div>
      </div>
    </div>
  );
}
