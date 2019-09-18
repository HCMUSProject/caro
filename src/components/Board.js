import React, { Component } from 'react';
import Cell from './Cell';
import { Button, Confirm, Loader, Modal } from 'semantic-ui-react';

class Board extends Component {

  constructor(props) {
    super();

    this.state = {
      board: new Array(props.size).fill(null).map(el => new Array(props.size).fill(null)),
      xIsNext: Math.random() >= 0.5,
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

    this.setState({
      board: cloneBoard,
      xIsNext: !this.state.xIsNext
    }, () => {

      let player = this.state.board[row][col];

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
      xIsNext: Math.random() >= 0.5,
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

    const { board } = this.state, { size, numToWin } = this.props;

    let pStart = { row , col }, pEnd = { row , col };

    while (pStart.col >= 0 && board[row][pStart.col] === player) {
      --pStart.col;
    }
    while (pEnd.col < size && board[row][pEnd.col] === player) {
      ++pEnd.col;
    }

    ++pStart.col;
    --pEnd.col;

    // đã có điểm đầu tiên [row, pStart.col] và điểm cuối [row, pEnd.col]

    const diff = pEnd.col - pStart.col + 1;

    if (diff > numToWin) return true;

    if (diff === numToWin) {
      let isBlockOutAbove = false, isBlockOutBelow = false;

      if (pStart.col > 0 && board[row][--pStart.col] === competitorPlayer) {
        isBlockOutAbove = true;
      }

      if (pEnd.col < size - 1 && board[row][++pEnd.col] === competitorPlayer) {
        isBlockOutBelow = true;
      }

      return !(isBlockOutAbove && isBlockOutBelow);
    }
    return false;
  }

  checkingVertical = (row, col, player) => {
    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state, { size, numToWin } = this.props;

    let pStart = { row , col }, pEnd = { row , col };

    while (pStart.row >= 0 && board[pStart.row][col] === player) {
      --pStart.row;
    }
    while (pEnd.row < size && board[pEnd.row][col] === player) {
      ++pEnd.row;
    }

    ++pStart.row;
    --pEnd.row;

    // đã có điểm đầu tiên [pStart.row, col] và điểm cuối [pEnd.row, col]

    const diff = pEnd.row - pStart.row + 1;

    if (diff > numToWin) return true;
    
    if (diff === numToWin) {
      
      let isBlockOutAbove = false, isBlockOutBelow = false;

      if (pStart.row > 0 && board[--pStart.row][col] === competitorPlayer) {
        isBlockOutAbove = true;
      }

      if (pEnd.row < size - 1 && board[++pEnd.row][col] === competitorPlayer) {
        isBlockOutBelow = true;
      }

      return !(isBlockOutAbove && isBlockOutBelow);
    }
    return false;
  }

  checkingMainDiagonal = (row, col, player) => {
    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state, { size, numToWin } = this.props;

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

    if (diff > numToWin) return true;

    if (diff === numToWin) {

      let isBlockOutAbove = false, isBlockOutBelow = false;

      if (pStart.row > 0 && pStart.col > 0 && board[--pStart.row][--pStart.col] === competitorPlayer){
        isBlockOutAbove = true;
      }

      if (pEnd.row < size - 1 && pEnd.col < size - 1 && board[++pEnd.row][++pEnd.col] === competitorPlayer) {
        isBlockOutBelow = true;
      }

      return !(isBlockOutAbove && isBlockOutBelow)
    }
    return false;
  }

  checkingSubDiagonal = (row, col, player) => {
    const competitorPlayer = player === 'X' ? 'O' : 'X';

    const { board } = this.state, { size, numToWin } = this.props;

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


    const diff = pEnd.row - pStart.row + 1;

    if (diff > numToWin) return true;
    
    if (diff === numToWin) {

      let isBlockOutAbove = false, isBlockOutBelow = false;

      if (pStart.row > 0 && pStart.col < size - 1 && board[--pStart.row][++pStart.col] === competitorPlayer){
        isBlockOutAbove = true;
      }

      if (pEnd.row < size - 1 && pEnd.col > 0 && board[++pEnd.row][--pEnd.col] === competitorPlayer){
        isBlockOutBelow = true;
      }

      return !(isBlockOutAbove && isBlockOutBelow);
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
  size: 20,
  numToWin: 5
}

export default Board;