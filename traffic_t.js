
class ArrowControl extends React.Component {
  constructor(props) {
    super(props);
    this.direction = this.props.direction;
  }

  handleControlClicked = () => {
    console.log('You clicked the arrow with direction', this.direction);
    this.props.handleControlClicked(this.direction);
  }

  render() {
    return (<span className="arrow" onClick={this.handleControlClicked}> { (this.direction == "down" ? "<" : ">") } </span>);
  }

}

class Cell extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var isHot = (this.props.name == this.props.hotCell ? "car" : " ");
    let cellClasses = `${isHot} cell`;
    return (<div className={cellClasses}> { this.props.name} </div>);
  }
}

class Table extends React.Component {

  constructor(props) {
    super(props);
    this.numCols = 40;
    this.state = { 
      hotCell: '0-0'
    };
  }

  // http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
  getRandomInt(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    var newHotCell = this.getRandomInt(0,this.props.tableRows - 1) + '-' + this.getRandomInt(0,this.numCols - 1);
    this.setState({
      hotCell: newHotCell
    });
  }

  generateRows() {
    var rowJsx = [];
    var colJsx;
    console.log('inside generateRows, tableRows=', this.props.tableRows);
    for (var i = 0; i < this.props.tableRows; ++i) {
      colJsx = [];
      for (var j = 0; j < this.numCols; ++j) {
        colJsx.push(<Cell hotCell={this.state.hotCell} name={`${i}-${j}`} key={`${i}:${j}`} />);
      }
      rowJsx.push(<div className="row"> {colJsx} </div>);
    }
    return rowJsx;
  }

  render() {
    var rowComponents = this.generateRows();

    return (
      <table className="table" >
      <thead> </thead>
      <tbody> {rowComponents} </tbody>
      </table>
    );
  }

}

class TrafficApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      tableRows : this.props.tableRows 
    };
  }

  tableSizer = (direction) => {
    this.setState( { tableRows : (direction == 'up' ? Math.min(this.state.tableRows + 1,10) : Math.max(2,this.state.tableRows - 1)) } );
    console.log('new table size will be: ', this.state.tableRows);
  }

  render() {
    return (
      <div id="app">
      <ArrowControl direction="down" handleControlClicked={this.tableSizer}/>
      <span className="control_label">{this.state.tableRows} Lanes</span>
      <ArrowControl direction="up" handleControlClicked={this.tableSizer} />
      <div><Table tableRows={this.state.tableRows} /></div>
      </div>
    );
  }

}

ReactDOM.render(
  <TrafficApp tableRows={5} />,
  document.getElementById('root')
);
