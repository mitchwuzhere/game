
// Overall Model
// attributes:
//	new job queue
//	satellites
//	

skybox.Model = function(numSats) {
	this.sats = new Array();
	for ( var i=0; i<numSats; i++ ) {
		var name = "SkySat-"+(i+1);
		var startLong = ( 360.0 / numSats ) * i - 180.0;
		var startLat = ( 180.0 / numSats ) * i - 90.0;
		this.sats.push(new skybox.Satellite(name, startLat, startLong));
	}
	this.newJobQueue = new Array();
	this.buildTargetList();
}

skybox.Model.prototype.buildTargetList = function() {
	this.allTargets = new Array();
	this.allTargets.push( new skybox.Target("New York", 45, 100) );
	this.allTargets.push( new skybox.Target("Los Angeles", 40, 120) );
	this.allTargets.push( new skybox.Target("Sydney", -50, -80) );
}

skybox.Model.prototype.schedule = function() {
	lime.scheduleManager.schedule(this.step, this);
	lime.scheduleManager.scheduleWithDelay(this.newJob, this, 1000);
	lime.scheduleManager.scheduleWithDelay(this.assignAJob, this, 2000);
}

skybox.Model.prototype.step = function(dt) {
	for ( var i=0; i< this.sats.length; i++ ) {
		this.sats[i].step(dt);
	}
}

skybox.Model.prototype.newJob = function() {
	var index = Math.floor(Math.random()*this.allTargets.length);
	var target = this.allTargets[index];
	this.newJobQueue.push(target);
}

skybox.Model.prototype.assignAJob = function() {
	var target = this.newJobQueue.shift();
	var job = new skybox.Job(target, 123);
	var index = Math.floor(Math.random()*this.sats.length);
	var sat = this.sats[index];
	var plan  = sat.contactPlans[1];
	plan.jobs.push(job);
}


// satellite
// attributes:
//	location
//	live queue
//	future queues

skybox.Satellite = function(name, latStart, longStart) {
	this.name = name;
	this.latitude = latStart;
	this.longitude = longStart;
	this.orbitTime = 1000;
	this.numOrbits = 4;
	this.dir = 1.0;
	this.currentPlan = new skybox.ContactPlan();
	this.contactPlans = new Array();
	for ( var i=0; i<5; i++ ) {
		this.contactPlans.push(new skybox.ContactPlan());
	}
}

skybox.Satellite.prototype.step = function(dt) {
	this.move(dt);
	this.handleTargets();
	this.dealWithGroundStation();
}

skybox.Satellite.prototype.move = function(dt) {
	this.latitude += (180 * dt * this.dir / this.orbitTime);
	this.longitude += (360 * dt / ( this.orbitTime * this.numOrbits));
	if ( this.latitude > 90.0 ) {
		this.dir = -1.0;
		this.longtitude += 180.0;
		this.latitude = 180 - this.latitude; 
	}
	if ( this.latitude < -90.0 ) {
		this.dir = 1.0;
		this.longtitude += 180.0;
		this.latitude = -180 - this.latitude; 
	}
	if ( this.longitude > 180.0 ) {
		this.longitude -= 360.0;
	}

	this.view.setPosition(this.longitude ,this.latitude);
}

skybox.Satellite.prototype.dealWithGroundStation = function() {
	if ( this.latitude < 85.0 && !this.waitingForGround ) {
		this.waitingForGround = true;
		this.view.setOpacity(1.0);

	}
	if ( this.waitingForGround && this.latitude >= 85.0 ) {
		this.score();
		this.currentPlan = this.contactPlans.shift();
		this.contactPlans.push(new skybox.ContactPlan());
		this.waitingForGround = false;
		this.view.setOpacity(0.0);
	}
}
		
skybox.Satellite.prototype.score = function() {
	var done = 0;
	var failed = 0;
	for ( var i=0; i<this.currentPlan.jobs.length; i++ ) {
		var job = this.currentPlan.jobs[i];
		if ( job.done ) {
			done++;
		} else {
			failed++;
		}
	}
	skybox.score(this.name, done, failed);
}

skybox.Satellite.prototype.handleTargets = function() {
	for ( var i=0; i<this.currentPlan.jobs.length; i++ ) {
		var job = this.currentPlan.jobs[i];
		if ( !job.done ) {
			//alert("checking");
			var deltaLat = Math.abs(this.latitude - job.target.latitude);
			var deltaLong = Math.abs(this.longitude - job.target.longitude);
			if ( deltaLat < 50.0 && deltaLong < 50.0 ) {
				job.done = true;
				//alert ( job.target.name + " done");
			}
		}
	}
}

// JOB
// attributes:
//	where
//	when
//	point value
//	status

skybox.Job = function(target, time) {
	this.target = target;
	this.time = time;
	this.done = false;
}


// TARGET
// attributes:
//	location(lat,long)
//	name

skybox.Target = function(name, latitude, longitude) {
	this.name = name;
	this.latitude = latitude;
	this.longitude = longitude;
}

// CONTACT PLAN
// attributes:
//	jobs
//	orbit time???

skybox.ContactPlan = function() {
	this.jobs = new Array();
}

