// TODOs
// XX Don't always change lanes; sometimes just slow down for a bit
// XX Randomly pick which lane to change to
// 2,3, and 4 square look-ahead for lane changes (drivers that want to maintain speed)
// Aggressive drivers vs more relaxed drivers
// Drivers pulling off the road
// Stopsigns and traffic lights
// Make bus and truck longer
// Look at both previous squares before changing lanes
// Sometimes just stop (accident)
// Tailgaters: makes car in front speed up to get out of the way, and lane change
// Big spacer types

var moveInterval = 100;
var numVehicles = 10;
var vehicles = [];
var vehicleArray;
var maxRows = 2;
var maxCols = 42;
var vehicleTypes = ['car','truck','bus'];
var speeds = { minimum: { car: 500, truck: 2000, bus: 1000 },
	       maximum: { car: 10, truck: 200, bus: 50 }
	     };

var buildTable = function() {
    var innerTable = '';
    for (var i = 0; i < maxRows; i++) {
	innerTable += '<div class="row">';
	for (var j = 0; j < maxCols; j++) {
	    var idStr = j + '-' + i;
	    innerTable += '<div class="cell" id="cell-' + idStr + '">&nbsp;</div>';
	}
	innerTable += '</div>';
    }
    // console.log(innerTable);
    $('#container').html(innerTable);

}

var initializeVehicleArray = function() {
    var vehicleArray = new Array(maxRows);
    for (var i = 0; i < maxCols; i++) {
	vehicleArray[i] = new Array(maxCols);
    }
    return(vehicleArray);
};


var placeVehicle = function(vehicle) {
    var vId = vehicle.position.x + '-' + vehicle.position.y;
    $('#cell-' + vId).addClass(vehicle.type);
    $('#cell-' + vId).html(vehicle.id);
    vehicleArray[vehicle.position.y][vehicle.position.x] = vehicle.id;
};

var removeVehicle = function(vehicle) {
    var vId = vehicle.position.x + '-' + vehicle.position.y;
    $('#cell-' + vId).removeClass(vehicle.type);
    $('#cell-' + vId).html('&nbsp');
    vehicleArray[vehicle.position.y][vehicle.position.x] = undefined;
};

var moveVehicles = function() {
    for (var i = 0; i < numVehicles; ++i) {
	vehicles[i].speedCtr += moveInterval;
	if (vehicles[i].speedCtr >= vehicles[i].speed) {
	    vehicles[i].speedCtr = 0;
	    vehicles[i].move();
	}
    }
};

var changeLanes = function(vehicle) {
    // console.log('Changing lanes on vehicle id: ' + vehicle.id);
    var doItChance = Math.round(Math.random() * 2);
    if (doItChance > 0) {
	return;
    }
    var checkSpots = [];
    if (vehicle.position.y == 0) {
	checkSpots.push(1);
    } else if (vehicle.position.y == maxRows - 1) {
	checkSpots.push(maxRows - 2);
    } else {
	if (Math.round(Math.random()) == 1) {
	    checkSpots.push(Math.max(vehicle.position.y - 1,0));
	    checkSpots.push(Math.min(vehicle.position.y + 1,maxRows - 1));
	} else {
	    checkSpots.push(Math.min(vehicle.position.y + 1,maxRows - 1));
	    checkSpots.push(Math.max(vehicle.position.y - 1,0));
	}
    }
    var lastPos  = vehicle.position.y;
    for (var i = 0; i < checkSpots.length; i++) {
	if (vehicleArray[checkSpots[i]][vehicle.position.x] == undefined) {
	    console.dir(checkSpots);
	    vehicle.position.y = checkSpots[i];
	}
    }
    console.log('Changing lanes on vehicle id: ' + vehicle.id + ' to lane: ' + vehicle.position.y + ' from lane: ' + lastPos);
};

var vehicleFactory = function(vId) {
    var theType = vehicleTypes[Math.floor(Math.random() * (vehicleTypes.length))];
    //console.log(theType);
    var vehicle = {
	id: vId,
	type: theType,
	position: {
	    x: maxCols,
	    y: Math.round(Math.random() * (maxRows - 1))
	},
	speedCtr: 0	
    };
    //console.log(vehicle);
    vehicle.speed = Math.round(Math.random() * (speeds.minimum[vehicle.type] - speeds.maximum[vehicle.type])) + speeds.maximum[vehicle.type];
    vehicle.move = function() {
	removeVehicle(vehicle);
	var newX = vehicle.position.x - 1;
	var newY = vehicle.position.y;
	if (newX < 0) {
	    newX = maxCols;
	    newY = Math.round(Math.random() * maxRows);
	}
	vehicle.position.y = newY;
	if (vehicleArray[vehicle.position.y][newX] == undefined) {
	    vehicle.position.x = newX;
	} else {
	    changeLanes(vehicle);
	}
	placeVehicle(vehicle);
    };
    placeVehicle(vehicle);
    return(vehicle);
};


var runVehicles = function() {
    setInterval(moveVehicles, moveInterval);
};

$(function() {
    buildTable();
    vehicleArray = initializeVehicleArray();
    for (var i = 0; i++ < numVehicles;) {
	vehicles.push(vehicleFactory(i));
    }
    runVehicles();
});
