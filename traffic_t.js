var Dog = class {
  constructor(props) {
    this.state = {
      treats: props.treats
    }
  }
  
  eat() {
    this.state.treats = this.state.treats + 1;
    console.log('I ate ' + this.state.treats + ' treats today');
  }
}

var dog = new Dog({treats:1});

class Vehicle {

  constructor(props) {
    var theType = props.vehicleTypes[Math.floor(Math.random() * (props.vehicleTypes.length))];
    //console.log(theType);
    this.id = props.vId;
    this.type = theType;
    this.vehicleArray = props.vehicleArray;
    this.maxRows = props.maxRows;
    this.maxCols = props.maxCols;
    this.maxSpeedCtr = props.maxSpeedCtr;
    this.position = {
      x: props.maxCols,
      y: Math.round(Math.random() * (props.maxRows - 1))
    };
    this.speedCtr = 0;
    this.cautionLevel = Math.round(Math.random() * 100); // used for how much space to keep in front
    this.switchiness =  Math.round(Math.random() * 100); // propensity to change lanes if something in front of the driver
    this.speed = Math.round(Math.random() * (props.speeds.maximum[this.type] - props.speeds.minimum[this.type])) + props.speeds.minimum[this.type];

    console.log('set vehicle id ' + this.id + ' of type ' + this.type + ' to speed ' + this.speed);
    this.placeOrRemove('place');

  }


  isClearInFront = () => {
    // Check if there's enough space in front of you to move. Depending on driver "cautionLevel" value, this may be more or less spaces.
    // Number of squares to check : (speed / 10) * cautionLevel. Ie, more cautious leaves more space, one square for each 10mph
    var numSquaresToCheck = Math.round((this.speed / 10) * (this.cautionLevel / 100));

    var clear = true;
    for (var i = 1, newX, newY; i <= numSquaresToCheck; ++i) {
      var newX = Math.max(this.position.x - i,0);
      if (this.vehicleArray[this.position.y][newX] !== undefined) {
        clear = false;
        console.log('Vehicle id ' + this.id + ' not clear ' + numSquaresToCheck + ' squares in front, caution value:' + this.cautionLevel);
        break;
      }
      return(clear);
    }
  }

  placeOrRemove = (which) => {
    var vId = this.position.x + '-' + this.position.y;
    this.vehicleArray[this.position.y][this.position.x] = (which == 'place' ? this.id : undefined);
    console.log(which + 'd vehicle with id:' + this.id);
  }


  changeLanes = () => {
    // console.log('Changing lanes on vehicle id: ' + vehicle.id);
    var doItChance = Math.round(Math.random() * 2);
    //    if (doItChance > 0) {
    //      return;
    //    }
    var checkSpots = [];
    if (this.position.y == 0) {
      checkSpots.push(1);
    } else if (this.position.y == this.maxRows - 1) {
      checkSpots.push(this.maxRows - 2);
    } else {
      if (Math.round(Math.random()) == 1) {
        checkSpots.push(Math.max(this.position.y - 1, 0));
        checkSpots.push(Math.min(this.position.y + 1, this.maxRows - 1));
      } else {
        checkSpots.push(Math.min(this.position.y + 1, this.maxRows - 1));
        checkSpots.push(Math.max(this.position.y - 1, 0));
      }
    }
    var lastPos  = this.position.y;
    for (let checkSpot in checkSpots) {
      if (this.vehicleArray[checkSpot][this.position.x] == undefined) {
        console.log('checkSpot:', checkSpot);
        this.position.y = checkSpot;
      }
    }
    console.log('Changed lanes on vehicle id: ' + this.id + ' to lane: ' + this.position.y + ' from lane: ' + lastPos);
  }

  update = () => {
    this.speedCtr += this.speed;
    if (this.speedCtr >= this.maxSpeedCtr) {
      this.speedCtr = 0;
      this.placeOrRemove('remove');
      var newX = this.position.x - 1;
      var newY = this.position.y;
      if (newX < 0) {
        newX = this.maxCols;     // when vehicle wraps around, put them in a new row for variety's sake
        newY = Math.round(Math.random() * this.maxRows);
      }
      this.position.y = newY;
      if (this.isClearInFront()) {
        this.position.x = newX;
      } else {
        this.changeLanes();
      }
      this.placeOrRemove('place');
    }
  }


}


/* The vehicleManager executes the logic of the cars, and passes the latest vehicle array back for rendering */
var VehicleManager = class {
  constructor(props) {
    this.numVehicles = props.numVehicles;
    this.maxRows = props.maxRows;
    this.maxCols = props.maxCols;
    this.maxSpeedCtr = 1000;
    this.vehicleTypes = ['car','truck','bus'];
    this.speeds = { 
      minimum: { car: 45, truck: 25, bus: 15 },
      maximum: { car: 85, truck: 75, bus: 55 }
    };
    this.vehicles = [];

    this.initializeVehicleArray();
    this.initializeVehicles();
  }


  initializeVehicleArray = () => {
    this.vehicleArray = new Array(this.maxRows);
    for (var i = 0; i < this.maxCols; i++) {
      this.vehicleArray[i] = new Array(this.maxCols);
    }
    console.log('Initialized vehicles array');
  }
  
  initializeVehicles = () => {
    var newVehicle;
    var  props = {
      vehicleArray: this.vehicleArray, 
      vehicleTypes: this.vehicleTypes,
      maxRows:      this.maxRows, 
      maxCols:      this.maxCols, 
      maxSpeedCtr:  this.maxSpeedCtr,
      speeds:       this.speeds
    };
    for (var i = 0; i++ < this.numVehicles;) {
      props.vId = i;
      newVehicle = new Vehicle(props);
      this.vehicles.push(newVehicle);
    }
    console.log('Initialized vehicles');
  }
  
  update = () => {
    for (let vehicle of this.vehicles) {
      vehicle.update();
    }
  }

  getVehicles = () => {
    return(this.vehicles);
  }

}


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

class Road extends React.Component {

  constructor(props) {
    super(props);
    this.numCols = 40;
    this.state = { 
      hotCell: '0-0',
      vehicleManager: new VehicleManager({
        numVehicles: 10,
        maxRows: 5,
        maxCols: 50
      })
    };
  }

  // http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
  getRandomInt(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      100
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
    this.state.vehicleManager.update();
    var allVehicles = this.state.vehicleManager.getVehicles();
    console.log('allVehicles = ', allVehicles);
  }

  generateRows() {
    var rowJsx = [];
    var colJsx;
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
      <div><Road tableRows={this.state.tableRows} /></div>
      </div>
    );
  }

}

ReactDOM.render(
  <TrafficApp tableRows={5} />,
  document.getElementById('root')
);
