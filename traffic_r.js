// TODOs
// Make buses and trucks longer
// Variable speed in each vehicle depending on circumstances, but they try to maintain "preferred" speed
// If you just switched from one lane, don't switch back to that same lane immediately even if worse blocked
// Change langes to one square in front of you
// 2,3, and 4 square look-ahead for lane changes (drivers that want to maintain speed)
// Make sure to wrap forward check around to right side
// Aggressive drivers vs more relaxed drivers
// Drivers pulling off the road
// Stopsigns and traffic lights
// Look at both previous squares before changing lanes
// Sometimes just stop (accident)
// Tailgaters: makes car in front speed up to get out of the way, and lane change
// Big spacer types
// Motorcycles/lane splitters
// Construction blockag

// DONES:
// XX Don't always change lanes; sometimes just slow down for a bit
// XX Randomly pick which lane to change to

class Traffic extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      maxSpeedCtr : 1000,
      moveInterval : 10,
      numVehicles : 10,
      maxRows : 3,
      maxCols : 59,
    }
    this.vehicleTypes = ['car','truck','bus'];
    this.vehicles = [];
    this.speeds = { 
      minimum: { car: 45, truck: 25, bus: 15 },
      maximum: { car: 85, truck: 75, bus: 55 }
    };
    this.buildTable();
    this.vehicleArray = this.initializeVehicleArray();
    for (var i = 0; i++ < this.state.numVehicles;) {
      this.vehicles.push(this.vehicleFactory(i));
    }
  }

  componentDidMount() {
    // Run the vehicles
    console.log('we have mounted our component');
    this.timerID = setInterval(
      () => this.moveVehicles,
      this.state.moveInterval
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }


  buildTable() {
    var innerTable = '';
    for (var i = 0; i < this.state.maxRows; i++) {
      innerTable += '<div class="row">';
      for (var j = 0; j < this.state.maxCols; j++) {
        var idStr = j + '-' + i;
        innerTable += '<div class="cell" id="cell-' + idStr + '">&nbsp;</div>';
      }
      innerTable += '</div>';
    }
    // console.log(innerTable);
    $('#container').html(innerTable);

  }

  initializeVehicleArray() {
    var vehicleArray = new Array(this.state.maxRows);
    for (var i = 0; i < this.state.maxCols; i++) {
      vehicleArray[i] = new Array(this.state.maxCols);
    }
    return(vehicleArray);
  }


  placeVehicle(vehicle) {
    var vId = vehicle.position.x + '-' + vehicle.position.y;
    $('#cell-' + vId).addClass(vehicle.type);
    $('#cell-' + vId).html(vehicle.id);
    this.vehicleArray[vehicle.position.y][vehicle.position.x] = vehicle.id;
  }

  removeVehicle(vehicle) {
    var vId = vehicle.position.x + '-' + vehicle.position.y;
    $('#cell-' + vId).removeClass(vehicle.type);
    $('#cell-' + vId).html('&nbsp');
    this.vehicleArray[vehicle.position.y][vehicle.position.x] = undefined;
  }

  moveVehicles() {
    for (var i = 0; i < this.state.numVehicles; ++i) {
      this.vehicles[i].speedCtr += this.vehicles[i].speed ;
      if (this.vehicles[i].speedCtr >= this.state.maxSpeedCtr) {
        vehicles[i].speedCtr = 0;
        vehicles[i].move();
      }
    }
  }

  changeLanes(vehicle) {
    // console.log('Changing lanes on vehicle id: ' + vehicle.id);
    var doItChance = Math.round(Math.random() * 2);
    //    if (doItChance > 0) {
    //      return;
    //    }
    var checkSpots = [];
    if (vehicle.position.y == 0) {
      checkSpots.push(1);
    } else if (vehicle.position.y == this.state.maxRows - 1) {
      checkSpots.push(this.state.maxRows - 2);
    } else {
      if (Math.round(Math.random()) == 1) {
        checkSpots.push(Math.max(vehicle.position.y - 1,0));
        checkSpots.push(Math.min(vehicle.position.y + 1,this.state.maxRows - 1));
      } else {
        checkSpots.push(Math.min(vehicle.position.y + 1,this.state.maxRows - 1));
        checkSpots.push(Math.max(vehicle.position.y - 1,0));
      }
    }
    var lastPos  = vehicle.position.y;
    for (var i = 0; i < checkSpots.length; i++) {
      if (this.vehicleArray[checkSpots[i]][vehicle.position.x] == undefined) {
        console.dir(checkSpots);
        vehicle.position.y = checkSpots[i];
      }
    }
    console.log('Changing lanes on vehicle id: ' + vehicle.id + ' to lane: ' + vehicle.position.y + ' from lane: ' + lastPos);
  }

  vehicleFactory(vId) {
    var theType = this.vehicleTypes[Math.floor(Math.random() * (this.vehicleTypes.length))];
    //console.log(theType);
    var vehicle = {
      id: vId,
      type: theType,
      position: {
        x: this.state.maxCols,
        y: Math.round(Math.random() * (this.state.maxRows - 1))
      },
      speedCtr: 0,
      cautionLevel: Math.round(Math.random() * 100), // used for how much space to keep in front
      switchiness:  Math.round(Math.random() * 100), // propensity to change lanes if something in front of the driver
    };
    //console.log(vehicle);
    vehicle.speed = Math.round(Math.random() * (this.speeds.maximum[vehicle.type] - this.speeds.minimum[vehicle.type])) + this.speeds.minimum[vehicle.type];
    console.log('set vehicle id ' + vehicle.id + ' of type ' + vehicle.type + ' to speed ' + vehicle.speed);
    vehicle.isClearInFront = function() {
      // Check if there's enough space in front of you to move. Depending on driver "cautionLevel" value, this may be more or less spaces.
      // Number of squares to check : (speed / 10) * cautionLevel. Ie, more cautious leaves more space, one square for each 10mph
      var numSquaresToCheck = Math.round((vehicle.speed / 10) * (vehicle.cautionLevel / 100));

      var clear = true;
      for (var i = 1, newX, newY; i <= numSquaresToCheck; ++i) {
        var newX = Math.max(vehicle.position.x - i,0);
        if (this.vehicleArray[vehicle.position.y][newX] !== undefined) {
          clear = false;
          console.log('Vehicle id ' + vehicle.id + ' not clear ' + numSquaresToCheck + ' squares in front, caution value:' + vehicle.cautionLevel);
          break;
        }
      }
      return(clear);
    };
    vehicle.move = () => {
      removeVehicle(vehicle);
      var newX = vehicle.position.x - 1;
      var newY = vehicle.position.y;
      if (newX < 0) {
        newX = this.state.maxCols;     // when vehicle wraps around, put them in a new row for variety's sake
        newY = Math.round(Math.random() * this.state.maxRows);
      }
      vehicle.position.y = newY;
      if (vehicle.isClearInFront()) {
        vehicle.position.x = newX;
      } else {
        this.changeLanes(vehicle);
      }
      this.placeVehicle(vehicle);
    }
    this.placeVehicle(vehicle);
    return(vehicle);
  }

}

console.log('here');
ReactDOM.render(
  <Traffic />,
  document.getElementById('root')
);
