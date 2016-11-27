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
    this.speedCtr = 0;
    this.cautionLevel = Math.round(Math.random() * 100); // used for how much space to keep in front
    this.switchiness =  Math.round(Math.random() * 100); // propensity to change lanes if something in front of the driver
    this.speed = Math.round(Math.random() * (props.speeds.maximum[this.type] - props.speeds.minimum[this.type])) + props.speeds.minimum[this.type];

    //console.log('set vehicle id ' + this.id + ' of type ' + this.type + ' to speed ' + this.speed);
    this.placeOrRemove('random');
    console.log('after placing, ' , this.vehicleArray)

  }


  isClearInFront = () => {
    // Check if there's enough space in front of you to move. Depending on driver "cautionLevel" value, this may be more or less spaces.
    // Number of squares to check : (speed / 10) * cautionLevel. Ie, more cautious leaves more space, one square for each 10mph
    var numSquaresToCheck = Math.round((this.speed / 10) * (this.cautionLevel / 100));

    var clear = true;
    for (var i = 1, newX, newY; i <= numSquaresToCheck; ++i) {
      var newX = Math.max(this.position.x - i,0);
      if (this.vehicleArray[this.position.y + '-' + newX] !== undefined) {
        clear = false;
        //console.log('Vehicle id ' + this.id + ' not clear ' + numSquaresToCheck + ' squares in front, caution value:' + this.cautionLevel);
        break;
      }
      return(clear);
    }
  }

  placeOrRemove = (which) => {
    var vehicleKey;
    if (which == 'random') {
      var placed = false;
      while (!placed) {
        this.position = {
          x: Math.round(Math.random() * (this.maxCols - 1)),
          y: Math.round(Math.random() * (this.maxRows - 1))
        };
        vehicleKey = this.position.y + '-' + this.position.x;
        if (!this.vehicleArray.hasOwnProperty(vehicleKey)) {
          this.vehicleArray[vehicleKey] = this.id;
          placed = true;
        }
      }
    } else if (which == 'place') {
      vehicleKey = this.position.y + '-' + this.position.x;
      this.vehicleArray[vehicleKey] = this.id;
      console.log('we placed vehicle id', this.id, 'at', vehicleKey);
    } else {
      delete(this.vehicleArray[vehicleKey]);
    }

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
      let vehicleCoordinates = checkSpot + '-' + this.position.x;
      if (!this.vehicleArray.hasOwnProperty(vehicleCoordinates)) {
        //console.log('checkSpot:', checkSpot);
        this.position.y = checkSpot;
      }
    }
    //console.log('Changed lanes on vehicle id: ' + this.id + ' to lane: ' + this.position.y + ' from lane: ' + lastPos);
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
        console.log('moving vehicle forward.');
        this.position.x = newX;
      } else {
        console.log('changing lanes.');
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

    this.vehicleArray = {};
    this.initializeVehicles();
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
    return({ 
      vehicles: this.vehicles,
      vehicleArray: this.vehicleArray
    });
  }

}


class ArrowControl extends React.Component {
  constructor(props) {
    super(props);
    this.direction = this.props.direction;
  }

  handleControlClicked = (e) => {
    e.preventDefault();    
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
    let cellClasses;
    if (this.props.vehicleId != -1) {
      console.log('seeking vehicle', this.props.vehicleId, this.props.vehicles);
      var theVehicle = this.props.vehicles[this.props.vehicleId - 1];
      cellClasses = `${theVehicle.type} cell`;
    } else {
      cellClasses = 'cell';
    }
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
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    /* var newHotCell = this.getRandomInt(0,this.props.tableRows - 1) + '-' + this.getRandomInt(0,this.numCols - 1);
     * this.setState({
     *   hotCell: newHotCell
     * });*/
    this.state.vehicleManager.update();
  }

  generateRows() {
    var rowJsx = [];
    var colJsx;
    var vehicleId;
    var vehicles = this.state.vehicleManager.getVehicles();
    //console.log('allVehicles = ', allVehicles);
    var hotCell;
    var vehicleCoordinates;
    console.log('vehicleArray=',vehicles.vehicleArray);
    for (var i = 0; i < this.props.tableRows; ++i) {
      colJsx = [];
      for (var j = 0; j < this.numCols; ++j) {
        vehicleCoordinates = i + '-' + j;
        vehicleId = (vehicles.vehicleArray.hasOwnProperty(vehicleCoordinates) ? vehicles.vehicleArray[vehicleCoordinates] : -1);
        colJsx.push(<Cell vehicleId={vehicleId} vehicles={vehicles.vehicles} name={`${i}-${j}`} />);
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
