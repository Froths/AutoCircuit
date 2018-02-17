var htmlScaling = 33;
var htmlOffset = 18;


function canvasDraw()
	{
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);

	var resistor = new Image();
	resistor.src = "resistor.png";
	var capacitor = new Image();
	capacitor.src = "capacitor.png";
	var inductor = new Image();
	inductor.src = "inductor.png";
	var vs = new Image();
	vs.src = "vs.png";
	var cs = new Image();
	cs.src = "cs.png";

	var commands = (currentTikzCode.split("\n")).concat(hiddenCode.split("\n"));
	for(var i = 0; i < commands.length; i++)
		{
		var coordRegex = /\((\d+,\d+)\)/g;

		var nodeRegex = /node at/;
		var labelRegex = /node at.*{(.*)}/;

		var shortRegex = /to\[short/;
		var resistorRegex = /\((.*)\).*resistor.*\((.*)\)/
		var capacitorRegex = /\((.*)\).*capacitor.*\((.*)\)/
		var inductorRegex = /\((.*)\).*inductor.*\((.*)\)/
		var csRegex = /\((.*)\).*current source.*\((.*)\)/
		var vsRegex = /\((.*)\).*voltage source.*\((.*)\)/

		if(nodeRegex.test(commands[i]))
			{
			var tmp = coordRegex.exec(commands[i]);
			var coords = tmp[1].split(",");

			var canvasCoords = [0 + (coords[0]*htmlScaling+htmlOffset), c.height - (coords[1]*htmlScaling+htmlOffset)];

			ctx.beginPath();
			ctx.arc(canvasCoords[0], canvasCoords[1], 2, 0, 2 * Math.PI);
			ctx.stroke();

			var label = labelRegex.exec(commands[i]);
			ctx.beginPath();
			ctx.font = "15px Georgia";
			ctx.textAlign="center";
			ctx.textBaseline="middle";
			ctx.fillText(label[1],canvasCoords[0], canvasCoords[1]);
			}

		if(shortRegex.test(commands[i]))
			{
			var coords = coordRegex.exec(commands[i])[1].split(",");
			var begin = coords;

			coords = coordRegex.exec(commands[i])[1].split(",");
			var end = coords;

			ctx.beginPath();
			ctx.moveTo(0 + (begin[0]*htmlScaling+htmlOffset), c.height -  (begin[1]*htmlScaling+htmlOffset));
			ctx.lineTo(0 + (end[0]*htmlScaling+htmlOffset), c.height - (end[1]*htmlScaling+htmlOffset));
			ctx.stroke();
			}

		if(resistorRegex.test(commands[i]))
			{
			var coords = coordRegex.exec(commands[i])[1].split(",");
			var begin = coords;

			coords = coordRegex.exec(commands[i])[1].split(",");
			var end = coords;

			drawComp({beginPoint: begin, endPoint: end, component: resistor});
			}

		if(capacitorRegex.test(commands[i]))
			{
			var coords = coordRegex.exec(commands[i])[1].split(",");
			var begin = coords;

			coords = coordRegex.exec(commands[i])[1].split(",");
			var end = coords;

			drawComp({beginPoint: begin, endPoint: end, component: capacitor});
			}

		if(inductorRegex.test(commands[i]))
			{
			var coords = coordRegex.exec(commands[i])[1].split(",");
			var begin = coords;

			coords = coordRegex.exec(commands[i])[1].split(",");
			var end = coords;

			drawComp({beginPoint: begin, endPoint: end, component: inductor});
			}

		if(vsRegex.test(commands[i]))
			{
			var coords = coordRegex.exec(commands[i])[1].split(",");
			var begin = coords;

			coords = coordRegex.exec(commands[i])[1].split(",");
			var end = coords;

			drawComp({beginPoint: begin, endPoint: end, component: vs});
			}

		if(csRegex.test(commands[i]))
			{
			var coords = coordRegex.exec(commands[i])[1].split(",");
			var begin = coords;

			coords = coordRegex.exec(commands[i])[1].split(",");
			var end = coords;

			drawComp({beginPoint: begin, endPoint: end, component: cs});
			}
		}
	}

function drawComp(options)
	{
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	let begin = options.beginPoint;
	let end = options.endPoint;
	let comp = options.component;
	
	var angle = Math.atan2(end[1]-begin[1], end[0]-begin[0]);
	var dist = htmlScaling*Math.sqrt(Math.pow(end[1]-begin[1], 2) + Math.pow(end[0]-begin[0], 2));

	ctx.beginPath();
	let translateX = (htmlScaling*begin[0] + htmlOffset);
	let translateY =  c.height - (htmlScaling*begin[1] + htmlOffset);

	let height = (dist/comp.width)*comp.height;

	ctx.translate(translateX,translateY);
	ctx.rotate(-angle);
	ctx.drawImage(comp, 0,-height/2, dist, height);
	ctx.rotate(angle);
	ctx.translate(-translateX, -translateY);
	}