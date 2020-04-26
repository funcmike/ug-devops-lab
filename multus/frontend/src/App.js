import React from 'react';
import axios from 'axios';

class Sort extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: ''};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
      this.setState({value: event.target.value});
    }
  
    handleSubmit = async (event) => {
      const input = this.state.value.split(",").map(numStr => parseInt(numStr.trim()));
      console.log('input: '+input);
      const resultResponse = await axios.post('/api/', {'input': input});
      console.log('result: '+resultResponse.data.result)
      alert('Sorted ' + resultResponse.data.result);
      event.preventDefault();
    }

    handleClick = async () => {
      const valuesResponse = await axios.get('/api/values');
      console.log(valuesResponse)
    };

    render() {
      return (
        <div>
          <div>
              <button onClick={this.handleClick}>Get Values From Backend</button>
          </div>
          <p>Merge sort</p>
          <form onSubmit={this.handleSubmit}>
        <label>
          Coma separted numbers, for ex. 1,2,3:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Sort" />
      </form>
      
      </div>

      );
    }
  }

  export default Sort;