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

  onCellClick = (idx) => {
    const px = parseInt(idx / this.props.size), py = parseInt(idx % this.props.size);

    if (!this.state.isStart || this.state.winner || this.state.board[px][py])
      return;

    let cloneBoard = this.state.board;

    cloneBoard[px][py] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      board: cloneBoard,
      xIsNext: !this.state.xIsNext
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
                  index={iRow * this.props.size + iCell}
                  val={cell}
                  onClick={(idx) => this.onCellClick(idx)} />
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
      resultModal : false
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

    const { isLoading, winner, xIsNext, open } = this.state;


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
              <span className={`player${xIsNext ? ' X' : ' O'}`}>
                {xIsNext ? 'X' : 'O'}
              </span>
            </p>
            <p>Winner: &nbsp;
              <span className={`player${winner ? ' X' : ' O'}`}>
                {winner}
              </span>
            </p>

            <Button primary onClick={() => this.toggleConfirm()}>Reset</Button>

            <Confirm
              open={open}
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
}

Board.defaultProps = {
  size: 20
}

export default Board;