import React from 'react';

const Cell = ({ index, val, onClick }) => {
  return (
    <button
      className={`board-cell player${val ? ' ' + val : ''}`}
      onClick={() => onClick(index)}
    >{val}</button>
  );
};

Cell.defaultProps = {
  val: null
}

export default Cell;