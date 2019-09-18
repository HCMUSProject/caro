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

    while (leftCol >= 0 && leftCol < size && board[row][leftCol] === player) {
      --leftCol;
    }
    while (rightCol >= 0 && rightCol < size && board[row][rightCol] === player) {
      ++rightCol;
    }

    ++leftCol;
    --rightCol;

    // đã có điểm đầu tiên [row, leftCol] và điểm cuối [row, rightCol]

    const diff = rightCol - leftCol + 1;

    // chỉ cần kiểm tra trên 1 hàng có đủ số lượng hay không
    if (diff === numToWin) {
      // bàn cờ có kích thước bằng với số lượng win.
      if (size === numToWin) return true;

      /////////////////////////////////////////////////
      //    trường hợp bàn cờ lớn hơn số lượng win   //
      /////////////////////////////////////////////////


      // chưa bị chặn bên trái
      if (leftCol > 0 && board[row][--leftCol] !== competitorPlayer) {
        return true;
      }

      // chưa bị chặn bên trái
      if (rightCol < size - 1 && board[row][++rightCol] !== competitorPlayer) {
        return true;
      }
    }
    return false;
  }

  checkingVertical = () => {
    return false;
  }

  checkingMainDiagonal = () => {
    return false;
  }
  checkingSubDiagonal = () => {
    return false;
  }

  isTerminated = (row, col, player) => {
    return this.checkingHorizontal(row, col, player) || this.checkingVertical()
      || this.checkingMainDiagonal() || this.checkingSubDiagonal();
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
  size: 5,
  numToWin: 3
}

export default Board;