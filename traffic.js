var numVehicles = 10;
var vehicles = [];
var vehicleArray;
var maxRows = 6;
var maxCols = 42;
var vehicleTypes = ['car','truck','bus'];
var speeds = { minimum: { car: 500, truck: 2000, bus: 1000 },
	       maximum: { car: 10, truck: 200, bus: 50 }
	     };

var buildTable = function() {
    var innerTable = '';
    for (var i = 0; i++ < maxRows; ) {
	innerTable += '<div class="row">';
	for (var j = 0; j++ < maxCols; ) {
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

var changeLanes = function(vehicle) {
    // console.log('Changing lanes on vehicle id: ' + vehicle.id);
    var checkSpots = [];
    if (vehicle.position.y == 0) {
	checkSpots.push(1);
    } else if (vehicle.position.y == maxRows) {
	checkSpots.push(maxRows - 1);
    } else {
	checkSpots.push(vehicle.position.y - 1);
	checkSpots.push(vehicle.position.y + 1);
    }
    for (var i = 0; i < checkSpots.length; i++) {
	if (vehicleArray[checkSpots[i]][vehicle.position.x] == undefined) {
	    vehicle.position.y = checkSpots[i];
	}
    }
    console.log('Changing lanes on vehicle id: ' + vehicle.id + ' to lane: ' + vehicle.position.y);
};

var vehicleFactory = function(vId) {
    var theType = vehicleTypes[Math.floor(Math.random() * (vehicleTypes.length))];
    //console.log(theType);
    var vehicle = {
	id: vId,
	type: theType,
	position: {
	    x: maxCols,
	    y: Math.round(Math.random() * maxRows)
	}
    };
    //console.log(vehicle);
    vehicle.speed = Math.round(Math.random() * (speeds.minimum[vehicle.type] - speeds.maximum[vehicle.type])) + speeds.maximum[vehicle.type];
    placeVehicle(vehicle);
    moveVehicle = function() {
	removeVehicle(vehicle);
	var newPosition = (vehicle.position.x - 1 > 0 ? vehicle.position.x - 1 : maxCols);
	if (vehicleArray[vehicle.position.y][newPosition] == undefined) {
	    vehicle.position.x = newPosition;
	} else {
	    changeLanes(vehicle);
	}
	placeVehicle(vehicle);
    };
    setInterval(moveVehicle, vehicle.speed);
    return(vehicle);
};



$(function() {
    buildTable();
    vehicleArray = initializeVehicleArray();
    for (var i = 0; i++ < numVehicles;) {
	var vehicle = vehicleFactory(i);
    }
});
