//set main namespace
goog.provide('skybox');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');


	var scoreMsg;

skybox.score = function(name, done, failed) {
	scoreMsg.setText(name + ": " + done + ", " + failed);
}

// entrypoint
skybox.start = function(){

	var skyboxModel = new skybox.Model(4);

	var director = new lime.Director(document.body,1024,768);
	var scene = new lime.Scene();
	var allSats = new lime.Layer().setPosition(200,200);

	for ( i=0; i<skyboxModel.sats.length; i++ ) {
		var satView = new lime.Circle().setSize(50,50).setFill(i*10,i*20,i*30);
		skyboxModel.sats[i].view = satView;
		allSats.appendChild(satView);
	}

	scene.appendChild(allSats);

	scoreMsg = new lime.Label("scoring").setPosition(400,400);
	scene.appendChild(scoreMsg);

	director.makeMobileWebAppCapable();


	// set current scene active
	director.replaceScene(scene);

	skyboxModel.schedule();

	//var sata = new skybox.Satellite("skysat-a", mysat);

	

	//alert(sata.longitude + ", " + sata.latitude);

	//alert(lime.scheduleManager.getDisplayRate());
}


//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('skybox.start', skybox.start);
