import React from 'react';
import $ from 'jquery';

export default class Counter extends React.Component {
  constructor() {
    super();
    this.state = {
      counter: 0,
      lastMessage: ''
    };
  }

  render() {
    return (
      <div>
        <h2>
          <button data-test="button-reset" type="button" onClick={this.onReset.bind(this)}>
            Reset counter (DELETE /counter)
          </button>

          <button data-test="button-increment" type="button" onClick={this.onIncrement.bind(this, 1, 0)}>
            Increment counter (POST /counter)
          </button>

          <button data-test="button-increment2" type="button" onClick={this.onIncrement.bind(this, 2, 0)}>
            Increment counter x 2 (POST /counter?by=2)
          </button>

          <button data-test="button-increment-delay" type="button" onClick={this.onIncrement.bind(this, 1, 1000)}>
            Increment counter (POST /counter?delay=1000)
          </button>

          <button data-test="button-increment2-delay" type="button" onClick={this.onIncrement.bind(this, 2, 1000)}>
            Increment counter x 2 (POST /counter?by=2&amp;delay=1000)
          </button>

          <button data-test="button-refresh" type="button" onClick={this.onRefreshCounter.bind(this)}>
            Refresh counter (GET /counter)
          </button>
        </h2>
      
        <h3>Counter value:
          <span data-test="counter-label">{this.state.counter} </span>
        </h3>
        <h3>Last result:
          <span id="result">{this.state.lastMessage} </span>
        </h3>    
      </div>
    );
  }

  onReset() {
    $.ajax({
      type: 'DELETE',
      url: '/counter',
      complete: (data) => {
        this.setState({
          lastMessage: data.responseText
         });
      }
    });
  }

  onIncrement(increment, delay) {
    const url = '/counter?increment=' + increment + '&delay=' + delay;
    $.post(url, data => {
      this.setState({
        lastMessage: data
     });
    });
  }

  onRefreshCounter() {    
    $.get('/counter', (data) => {
      this.setState({
        counter: data
     });
    });
  }
}
