import React, { Component } from 'react';
import Cell from './Cell';
import { Button, Confirm, Loader, Modal } from 'semantic-ui-react';

class Board extends Component {

  constructor(props) {
    super();

    this.state = {
      board: new Array(props.size).fill(null).map(el => new Array(props.size).fill(null)),
      xIsNext: true,
      isStart: true,
      winner: null,
      isDraw: false,
      isLoading: true,
      open: false,
      resultModal: false
    }
  }

  setDraw = () => {
    this.setState({
      isStart: false,
      winner: 'XO',
      isDraw: true,
      resultModal: true
    });
  }

  setWinner = (player) => {
    this.setState({
      isStart: false,
      winner: player,
      isDraw: false,
      resultModal: true
    });
  }

  onCellClick = (row, col) => {

    const { isStart, winner, board, xIsNext } = this.state;

    if (!isStart || winner || board[row][col])
      return;

    let cloneBoard = board;
    cloneBoard[row][col] = xIsNext ? 'X' : 'O';

    let player = xIsNext ? 'X' : 'O';


    this.setState({
      board: cloneBoard,
      xIsNext: !this.state.xIsNext
    }, () => {

      const hasWinner = this.isTerminated(row, col, player);
      // draw
      if (this.isFull() && !hasWinner) {
        return this.setDraw();
      }
      if (hasWinner) {
        return this.endGame(player);
      }
    })
  }

  renderBoard = () => {
    return (
      this.state.board.map((row, iRow) => {

        return (
          <div key={iRow} className='board-row'>
            {
              row.map((cell, iCell) => (
                <Cell
                  key={iRow * this.props.size + iCell}
                  row={iRow}
                  col={iCell}
                  val={cell}
                  onClick={(row, col) => this.onCellClick(row, col)} />
              ))
            }
          </div>
        )
      })
    )
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        isLoading: false
      });
    }, 200 + Math.random() * 1000);

    document.title = 'Caro Vietnam'
  }

  resetGame = () => {
    this.setState({
      board: new Array(this.props.size).fill(null).map(el => new Array(this.props.size).fill(null)),
      xIsNext: true,
      isStart: true,
      winner: null,
      open: false,
      resultModal: false
    })
  }

  toggleConfirm = () => {
    this.setState({
      open: !this.state.open
    });
  }

  toggleResultModal = () => {
    this.setState({
      resultModal: !this.state.resultModal
    });
  }

  showResultModal = () => {

    const { winner, resultModal, isDraw } = this.state;

    const showResult = () => {
      if (isDraw) {
        return (
          <React.Fragment>
            <div className={`text-center result player draw`}>{winner}</div>
            <div className='text-center'>Draw</div>
          </React.Fragment>
        )
      }

      return (
        <React.Fragment>
          <div className={`text-center result player${' ' + winner}`}>{winner}</div>
          <div className='text-center'>Winner</div>
        </React.Fragment>
      )
    }

    return (
      <Modal open={resultModal} size='mini'>
        <Modal.Content>
          <Modal.Description className='result-wrapper'>
            {showResult()}
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions className='text-center'>
          <Button
            onClick={this.resetGame}
            positive
            content='Play again'
          />
        </Modal.Actions>
      </Modal>
    )
  }

  render() {

    const { isLoading, xIsNext, open } = this.state;

    const symbol = xIsNext ? 'X' : 'O';

    if (isLoading) {
      return (
        <Loader active size='large'>Loading</Loader>
      )
    }
    return (
      <div className='board-wrapper'>
        <div className='game-info-wrapper'>
          <h3 className='title'>Tic-Tac-Toe</h3>
          <div className='game-info'>
            <p>Player: &nbsp;
              <span className={`player${' ' + symbol}`}>
                {symbol}
              </span>
            </p>

            <Button primary onClick={() => this.toggleConfirm()}>Reset</Button>

            <Confirm
              open={open}
              size='mini'
              onCancel={this.toggleConfirm}
              onConfirm={this.resetGame}
              header='Confirm'
              content='Do you want to reset this game?'
            />
          </div>
        </div>
        <div id='board'>
          {this.renderBoard()}
        </div>

        {this.showResultModal()}
      </div>
    );
  }

  // giai thuat kiem tra chien thang


  checkingHorizontal = (row, col, player) => {

    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state;

    const { size, numToWin } = this.props;

    let leftCol = col, rightCol = col;

    while (leftCol >= 0 && board[row][leftCol] === player) {
      --leftCol;
    }
    while (rightCol < size && board[row][rightCol] === player) {
      ++rightCol;
    }

    ++leftCol;
    --rightCol;

    // đã có điểm đầu tiên [row, leftCol] và điểm cuối [row, rightCol]

    const diff = rightCol - leftCol + 1;

    // chỉ cần kiểm tra trên 1 hàng có đủ số lượng hay không
    if (diff >= numToWin) {
      // bàn cờ có kích thước bằng với số lượng win.
      if (size === numToWin) return true;

      /////////////////////////////////////////////////
      //    trường hợp bàn cờ lớn hơn số lượng win   //
      /////////////////////////////////////////////////


      // bên trái đã có player hoặc chưa bị chặn bên trái
      if ((leftCol === 0 && board[row][leftCol] === player) ||
          (leftCol > 0 && board[row][--leftCol] !== competitorPlayer)) {
        return true;
      }

      // bên phải đã có player hoặc chưa bị chặn bên phải
      if ((rightCol === size - 1 && board[row][rightCol] === player) ||
          (rightCol < size - 1 && board[row][++rightCol] !== competitorPlayer)) {
        return true;
      }
    }
    return false;
  }

  checkingVertical = (row, col, player) => {
    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state;

    const { size, numToWin } = this.props;

    let topRow = row, botRow = row;

    while (topRow >= 0 && board[topRow][col] === player) {
      --topRow;
    }
    while (botRow < size && board[botRow][col] === player) {
      ++botRow;
    }

    ++topRow;
    --botRow;

    // đã có điểm đầu tiên [topRow, col] và điểm cuối [botRow, col]

    const diff = botRow - topRow + 1;

    // chỉ cần kiểm tra trên 1 cột có đủ số lượng hay không
    if (diff >= numToWin) {
      // bàn cờ có kích thước bằng với số lượng win.
      if (size === numToWin) return true;

      /////////////////////////////////////////////////
      //    trường hợp bàn cờ lớn hơn số lượng win   //
      /////////////////////////////////////////////////


      // bên trên đã có player hoặc chưa bị chặn bên trên
      if ((topRow === 0 && board[topRow][col] === player) ||
            (topRow > 0 && board[--topRow][col] !== competitorPlayer)) {
        return true;
      }

      // bên dưới đã có player hoặc chưa bị chặn bên dưới
      if ((botRow === size - 1 && board[botRow][col] === player) ||
            (botRow < size - 1 && board[++botRow][col] !== competitorPlayer)) {
        return true;
      }
    }
    return false;
  }

  checkingMainDiagonal = (row, col, player) => {
    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state;

    const { size, numToWin } = this.props;

    // let topRow = row, botRow = row;

    let pStart = { row , col }, pEnd = { row , col };

    while (pStart.row >= 0 && pStart.col >= 0 && board[pStart.row][pStart.col] === player) {
      --pStart.row;
      --pStart.col;
    }
    while (pEnd.row < size && pEnd.col < size && board[pEnd.row][pEnd.col] === player) {
      ++pEnd.row;
      ++pEnd.col;
    }
    ++pStart.row;
    ++pStart.col;

    --pEnd.row;
    --pEnd.col;

    // đã có điểm đầu tiên [topRow, col] và điểm cuối [botRow, col]

    const diff = pEnd.row - pStart.row + 1;

    // chỉ cần kiểm tra trên 1 cột có đủ số lượng hay không
    if (diff >= numToWin) {

      /////////////////////////////////////////////////
      //    trường hợp bàn cờ lớn hơn số lượng win   //
      /////////////////////////////////////////////////

      // trường hợp sát biên
      if ((pStart.row === 0 && pEnd.col === size - 1) || (pStart.col === 0 && pEnd.row === size - 1)) {
        return true;
      }

      // điểm trên đã có player hoặc chưa bị chặn bên trên
      if ((pStart.row === 0 && pStart.col === 0 && board[pStart.row][pStart.col] === player) || 
            (pStart.row > 0 && pStart.col > 0 && board[--pStart.row][--pStart.col] !== competitorPlayer)) {
        return true;
      }

      // điểm dưới đã có player hoặc chưa bị chặn bên dưới
      if ((pEnd.row === size - 1 && pEnd.col === size - 1 && board[pEnd.row][pEnd.col] === player) || 
            (pEnd.row < size - 1 && pEnd.col < size - 1 && board[++pEnd.row][++pEnd.col] !== competitorPlayer)) {
        return true;
      }
    }
    return false;
  }
  checkingSubDiagonal = (row, col, player) => {
    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state;

    const { size, numToWin } = this.props;

    // let topRow = row, botRow = row;

    let pStart = { row , col }, pEnd = { row , col };

    while (pStart.row >= 0 && pStart.col < size && board[pStart.row][pStart.col] === player) {
      --pStart.row;
      ++pStart.col;
    }
    while (pEnd.row < size && pEnd.col >= 0 && board[pEnd.row][pEnd.col] === player) {
      ++pEnd.row;
      --pEnd.col;
    }
    ++pStart.row;
    --pStart.col;

    --pEnd.row;
    ++pEnd.col;

    // đã có điểm đầu tiên [topRow, col] và điểm cuối [botRow, col]

    const diff = pEnd.row - pStart.row + 1;

    // chỉ cần kiểm tra trên 1 cột có đủ số lượng hay không
    if (diff >= numToWin) {

      /////////////////////////////////////////////////
      //    trường hợp bàn cờ lớn hơn số lượng win   //
      /////////////////////////////////////////////////

      // trường hợp sát biên
      if ((pStart.col === size - 1 && pEnd.row === size - 1) || (pStart.row === 0 && pEnd.col === 0)) {
        return true;
      }

      // chưa bị chặn bên trên
      if ((pStart.row === 0 && pStart.col === size - 1 && board[pStart.row][pStart.col] === player) ||
            (pStart.row > 0 && pStart.col < size - 1 && board[--pStart.row][++pStart.col] !== competitorPlayer)) {
        return true;
      }

      // chưa bị chặn bên dưới
      if ((pEnd.row === size - 1 && pEnd.col === 0 && board[pEnd.row][pEnd.col] === player) ||
            (pEnd.row < size - 1 && pEnd.col > 0 && board[++pEnd.row][--pEnd.col] !== competitorPlayer)) {
        return true;
      }
    }
    return false;
  }

  isTerminated = (row, col, player) => {
    return this.checkingHorizontal(row, col, player) || this.checkingVertical(row, col, player)
      || this.checkingMainDiagonal(row, col, player) || this.checkingSubDiagonal(row, col, player);
  }

  isFull = () => {
    const { board } = this.state;

    return board.every(row => {
      return row.every(cell => cell);
    });
  }

  endGame = (player) => {
    this.setWinner(player);
  }
}

Board.defaultProps = {
  size: 6,
  numToWin: 3
}

export default Board;