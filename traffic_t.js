var debugging = false;
function debug(str) {
  if (debugging) {
    console.log(str.join(' '));
  }
}

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
    debug(['creating vehicle with id:', props.vId]);
    this.type = theType;
    this.vehicleArray = props.vehicleArray;
    this.vehicles = props.vehicles;
    this.maxRows = props.maxRows;
    this.maxCols = props.maxCols;
    this.maxSpeedCtr = props.maxSpeedCtr;
    this.speedCtr = 0;
    this.changeLanesCtr = 0;
    this.changeLanesWaitCycles = 10;
    this.cautionLevel = Math.round(Math.random() * 100); // used for how much space to keep in front
    this.switchiness =  Math.round(Math.random() * 100); // propensity to change lanes if something in front of the driver
    this.speed = Math.round(Math.random() * (props.speeds.maximum[this.type] - props.speeds.minimum[this.type])) + props.speeds.minimum[this.type];

    //debug(['set vehicle id ' + this.id + ' of type ' + this.type + ' to speed ' + this.speed]);
    this.placeOrRemove('random');
    //debug(['after placing, ' , props.vehicleArray]);

  }

  sanityCheck() {
    var positions = [];
    var posHash = {};
    for (let vehicle of this.vehicles) {
      let coord = vehicle.position.y + '-' + vehicle.position.x;
      positions.push(coord + '-' + vehicle.id);
      posHash[coord] = vehicle.id;
    }
    if (Object.keys(posHash).length != positions.length) {
      console.log('Overlapping cars after updating id:', this.id, positions);
      debugger;
    }
    
  }

  isClearInFront() {
    // Check if there's enough space in front of you to move. Depending on driver "cautionLevel" value, this may be more or less spaces.
    // Number of squares to check : (speed / 10) * cautionLevel. Ie, more cautious leaves more space, one square for each 10mph
    var numSquaresToCheck = Math.max(1,Math.round((this.speed / 10) * (this.cautionLevel / 100)));

    var clear = true, newX, newXtmp, vehicleKey;
    for (var i = 1; i <= numSquaresToCheck; ++i) {
      newXtmp = this.position.x - i;
      newX = (newXtmp >= 0 ? newXtmp : newXtmp + this.maxCols);
      vehicleKey = this.position.y + '-' + newX;
      if (this.vehicleArray.hasOwnProperty(vehicleKey)) {
        clear = false;
        //debug(['Vehicle id ' + this.id + ' not clear ' + numSquaresToCheck + ' squares in front, caution value:' + this.cautionLevel]);
        break;
      }
    }
    return(clear);
  }

  changeLanes() {
    // console.log('Changing lanes on vehicle id: ' + vehicle.id);
    // var doItChance = Math.round(Math.random() * 2);
    //    if (doItChance > 0) {
    //      return;
    //    }
    if (this.changeLanesCtr > 0) {
      this.changeLanesCtr--; /* do not change lanes too quickly */
    } else {
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
      for (let checkSpot of checkSpots) {
        let vehicleCoordinates = checkSpot + '-' + this.position.x;
        if (!this.vehicleArray.hasOwnProperty(vehicleCoordinates)) {
          //debug(['move vehicle:', this.id, 'from spot:' + this.position.y, 'to spot:', checkSpot]);
          this.position.y = checkSpot;
          this.changeLanesCtr = this.changeLanesWaitCycles;
          break;
        }
      }
    }
    this.placeOrRemove('place');

    if( lastPos != this.position.y ) {
      debug(['Changed lanes on vehicle id: ' + this.id + ' to lane: ' + this.position.y + ' from lane: ' + lastPos]);
    }

  }

  placeOrRemove (which) {
    if (which == 'random') {
      var placed = false;
      while (!placed) {
        this.position = {
          x: Math.round(Math.random() * (this.maxCols - 1)),
          y: Math.round(Math.random() * (this.maxRows - 1))
        };
        vehicleKey = this.position.y + '-' + this.position.x;
        //debug(['Trying to place id:',this.id, 'at position:', vehicleKey]);
        if (!this.vehicleArray.hasOwnProperty(vehicleKey)) {
          this.vehicleArray[vehicleKey] = this.id;
          placed = true;
        }
      }
    } else {
      var vehicleKey = this.position.y + '-' + this.position.x;
      if (which == 'place') {
        this.vehicleArray[vehicleKey] = this.id;
        //debug(['We placed vehicle id', this.id, 'at', vehicleKey]);
      } else {
        //debug(['Unplacing vehicle id:', this.id, 'from spot:', vehicleKey]);
        delete(this.vehicleArray[vehicleKey]);
      }
    }
    this.sanityCheck();
  }

  update (props) {
    if (props.tableRows != this.maxRows) {
      var previousMaxRows = this.maxRows;
      this.maxRows = props.tableRows; // update if the number of lanes has changed.
      if (this.maxRows < previousMaxRows) {
        // move myself to the back into the road i'm in the way of a shrinking road
        this.placeOrRemove('remove');
        this.changeLanes();
      }
    }
    this.speedCtr += this.speed;
    if (this.speedCtr >= this.maxSpeedCtr) {
      this.speedCtr = 0;
      this.placeOrRemove('remove');
      var newX = this.position.x - 1;
      var newY = this.position.y;
      if (newX < 0) {
        newX = this.maxCols - 1; 
        debug(['vehicle id:', this.id, 'wrapped']);
        // When vehicle wraps around, put them in a new row for variety's sake
        // newY = Math.round(Math.random() * this.maxRows);
      }
      this.position.y = newY;
      if (this.isClearInFront()) {
        //debug(['moving vehicle forward.']);
        this.position.x = newX;
        this.placeOrRemove('place');
      } else {
        //debug(['Trying to change lanes on id', this.id, 'currently in lane:', this.position.y]);
        this.changeLanes();
      }
    }
  }


}


/* The vehicleManager executes the logic of the cars, and passes the latest vehicle array back for rendering */
var VehicleManager = class {
  constructor(props) {
    this.maxSpeedCtr = 1000;
    this.vehicleTypes = ['car','truck','bus'];
    this.speeds = { 
      minimum: { car: 45, truck: 25, bus: 15 },
      maximum: { car: 85, truck: 75, bus: 55 }
    };

    this.numVehicles = 0; // we will update this as we add cars
    this.maxRows = props.maxRows;
    this.maxCols = props.maxCols;
    this.vehicles = [];

    this.vehicleArray = {};
    this.initializeVehicles();
    this.ready = true;
  }

  addVehicle() {
    var newVehicle;
    var  props = {
      vehicleArray: this.vehicleArray, 
      vehicleTypes: this.vehicleTypes,
      vehicles:     this.vehicles,
      maxRows:      this.maxRows, 
      maxCols:      this.maxCols, 
      maxSpeedCtr:  this.maxSpeedCtr,
      speeds:       this.speeds,
      vId:          this.numVehicles
    };
    newVehicle = new Vehicle(props);
    this.vehicles.push(newVehicle);
    this.numVehicles++;
  }

  removeVehicle() {
    if (this.numVehicles > 0) {
      var deletedVehicle = this.vehicles.pop();
      let vehicleCoordinates = deletedVehicle.position.y + '-' + deletedVehicle.position.x;    
      delete(this.vehicleArray[vehicleCoordinates]);
      this.numVehicles--;
    }
  }

  initializeVehicles() {
    for (var i = 0; i < this.numVehicles; ++i) {
      this.addVehicle();
    }
    debug(['Initialized vehicles']);
  }
  
  update (props) {
    if (props.tableRows != this.maxRows) {
      console.log('We are changing how many rows we have from', this.maxRows, 'to', props.tableRows);
      this.maxRows = props.tableRows;
    }
    if (props.numVehicles != this.numVehicles) {
      console.log('We are changing the number of vehicles from', this.numVehicles, 'to', props.numVehicles);
      if (props.numVehicles > this.numVehicles) {
        this.addVehicle();
      } else {
        this.removeVehicle();
      }
    }
    
    var vehicleArraySnap = Object.assign({}, this.vehicleArray);
    debug(['Beginning vehicles update, vehicleArray:', vehicleArraySnap]);
    for (let vehicle of this.vehicles) {
      vehicle.update(props);
    }
  }

  getVehicles() {
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
    return (<button className="arrow" onClick={this.handleControlClicked}> { (this.direction == "down" ? "<" : ">") } </button>);
  }

}

class Cell extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let cellClasses;
    if (this.props.vehicleId != -1) {
      //console.log('seeking vehicle', this.props.vehicleId, this.props.vehicles);
      var theVehicle = this.props.vehicles[this.props.vehicleId];
      cellClasses = `${theVehicle.type} cell`;
    } else {
      cellClasses = 'cell';
    }
    return (<div className={cellClasses}> {this.props.name} </div>);
  }
}

class Road extends React.Component {

  constructor(props) {
    super(props);
    this.numCols = 40;
    this.vehicleManager = 
      new VehicleManager({
        numVehicles: this.props.numVehicles,
        maxRows: this.props.tableRows,
        maxCols: this.numCols
      });
    this.updateInterval = this.props.updateInterval;
    this.state = {
      vehiclesHash: this.vehicleManager.getVehicles(),
      numVehicles: this.props.numVehicles
    }
  }
 
  // http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
  getRandomInt(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      this.updateInterval,
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.vehicleManager.update(this.props);
    this.setState({
      vehiclesHash : this.vehicleManager.getVehicles()
    });
  }

  generateRows() {
    var rowJsx = [];
    var colJsx;
    var vehicleId;
    //console.log('allVehicles = ', allVehicles);
    var vehicleCoordinates;
    //console.log('vehicleArray=',this.state.vehiclesHash.vehicleArray);
    for (var i = 0; i < this.props.tableRows; ++i) {
      colJsx = [];
      for (var j = 0; j < this.numCols; ++j) {
        vehicleCoordinates = i + '-' + j;
        vehicleId = (this.state.vehiclesHash.vehicleArray.hasOwnProperty(vehicleCoordinates) ? this.state.vehiclesHash.vehicleArray[vehicleCoordinates] : -1);
        // colJsx.push(<Cell vehicleId={vehicleId} vehicles={this.state.vehiclesHash.vehicles} name={`${i}-${j}`} />);
        colJsx.push(<Cell vehicleId={vehicleId} vehicles={this.state.vehiclesHash.vehicles} name={vehicleId} />);
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
      tableRows : this.props.tableRows,
      numVehicles: this.props.numVehicles
    };
  }

  carsControl = (direction) => {
    this.setState( { numVehicles : (direction == 'up' ? Math.min(this.state.numVehicles + 1,20) : Math.max(0,this.state.numVehicles - 1)) } );
    console.log('new number of vehicles will be: ', this.state.numVehicles);
  }

  tableSizer = (direction) => {
    this.setState( { tableRows : (direction == 'up' ? Math.min(this.state.tableRows + 1,10) : Math.max(2,this.state.tableRows - 1)) } );
    console.log('new table size will be: ', this.state.tableRows);
  }

  render() {
    return (
      <div id="app">
        <ArrowControl direction="down" handleControlClicked={this.tableSizer}/>&nbsp;
        <span className="control_label">{this.state.tableRows} Lanes</span>&nbsp;
        <ArrowControl direction="up" handleControlClicked={this.tableSizer} />

        &nbsp;&nbsp;

        <ArrowControl direction="down" handleControlClicked={this.carsControl}/>&nbsp;
        <span className="control_label">{this.state.numVehicles} Cars</span>&nbsp;
        <ArrowControl direction="up" handleControlClicked={this.carsControl} />

        <div><Road tableRows={this.state.tableRows} numVehicles={this.state.numVehicles} updateInterval={10} /></div>

      </div>
    );
  }

}

ReactDOM.render(
  <TrafficApp tableRows={2} numVehicles={1}/>,
  document.getElementById('root')
);
