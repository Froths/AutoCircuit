//TODO: DONT LEECH OFF QUICKLATEX - Try integrating TexLive: http://manuels.github.io/texlive.js/#running
//TODO: Cache imgs
//TODO: Split logic into separate JS files (updating, processing shorthand)

var tikzPictureCode = "";
var currentTikzCode = "";
var hiddenCode = "";
var prevPicUpdateTime = (new Date).getTime() - 7000;

var whitespace = [' ', '\t'];

var xMult = 2;
var yMult = 2;

var MAX_ROWS = 7;
var MAX_COLS = 7;


//This should be called automatically at regular intervals
//Update Tikz circuit preview using an online compiler (quicklatex).
function updateTikzPic()
	{
	if(tikzPictureCode != currentTikzCode && ((new Date).getTime() - prevPicUpdateTime) > 10*1000)
		{
		var request = "formula=" + encodeURI(currentTikzCode) + "&fsize=12px&fcolor=000000&mode=0&out=1&remhost=quicklatex.com" +
			"&preamble=%5Cusepackage%7Bamsmath%7D%0A%5Cusepackage%7Bamsfonts%7D%0A%5Cusepackage%7Bamssymb%7D%0A%5Cusepackage%5Bsiunitx,%20american%5D%7Bcircuitikz%7D";

		prevPicUpdateTime = (new Date).getTime();

		tikzPictureCode = currentTikzCode;
		//doCORSRequest({data: request});
		}
	var img = document.getElementById('tikzpicture');
	img.setAttribute("style","margin-bottom:-" + img.height + "px");
	}

//Pass POST request containing circuit code to a proxy and update picture based on response.
function doCORSRequest(options)
	{
	var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
	var targetURL = 'http://www.quicklatex.com/latex3.f';
	var x = new XMLHttpRequest();

	x.open('POST', cors_api_url + targetURL);
	x.send(options.data);
	x.onload = x.onerror = function() {console.info(x.responseText); var text = x.response.split(" ")[0];
	document.getElementById("tikzpicture").src = x.responseText.split(" ")[0].substring(1,text.length);}

	console.info(options.data);

	if (typeof console === 'object')
		{
		console.log('// To test a local CORS Anywhere server, set cors_api_url. For example:');
		console.log('cors_api_url = "http://localhost:8080/"');
		}
	}



//This should be called every time the input area changes
//Processes user input to update html canvas preview and the LaTeX code preview
function update()
	{
	var defaultXMult = 2;
	var defaultXMult = 2;

	let tmp = document.getElementById("xMult").value;
	if(isNaN(tmp) || tmp == "" || tmp <= 0){ xMult = defaultXMult; }
	else{ xMult = tmp; }

	tmp = document.getElementById("yMult").value;
	if(isNaN(tmp) || tmp == "" || tmp <= 0){ yMult = defaultXMult; }
	else{ yMult = tmp; }

	//Convert user input to LaTeX. Take returned code and replace new lines / tabs with the html equivalent before displaying.
	currentTikzCode = updateTikzCode().replace(/&#9;/g, "\t").replace(/<br>/g, "\n");

	//Update the canvas preview of circuit
	canvasDraw();
	}

//Read input area --> convert to Tikz code --> return code
function updateTikzCode()
	{
	hiddenCode = "";

	var codeArea = document.getElementById("tikzcode");
	var input = document.getElementById("input").value;
	var output = "\\begin{tikzpicture}<br>";

	var parsedInput = parseInput(input);
	output+= parsedInput;

	output+=  "\\end{tikzpicture}";
	codeArea.innerHTML = output;

	return output;
	}

//Converts shorthand input to LaTeX
//Mostly just "if [keyword1] is followed by [keyword2] and a [value] then translate to ...."
function parseInput(input)
	{
	var output = { text: "" };

	//Split commands by whitespace
	var commands = input.split(/\s*[\s,]\s*/);

	//Remove empty commands
	for(var i = 0; i < commands.length; i++)
		{
		if(commands[i] == "")
			{
			commands.splice(i,1);
			i--;
			continue;
			}
		}

	var dims = parseDims(commands);
	var dimOpts = parseDimOpts(commands);
	writeDims(dims, dimOpts, output);

	var comps = parseComps(commands);
	writeComps(comps, dims, output);

	//var selectors = parseSelectors(commands);
	return output.text;
	}

function parseDims(commands)
	{
	for(var i = 0; i < commands.length; i++)
		{
		var x = commands[i].indexOf('x');
		if(x != -1 && !isNaN(commands[i].substring(0,x)) && !isNaN(commands[i].substring(x+1,commands[i].length)))
			{
			var options = {rows: commands[i].substring(0,x), cols: commands[i].substring(x+1,commands[i].length)};

			if(options.rows > MAX_ROWS) { options.rows = MAX_ROWS; }
			if(options.cols > MAX_COLS) { options.cols = MAX_COLS; }

			commands.splice(i,1);
			return options;
			}
		}
	return {rows: 0, cols: 0};
	}

function parseDimOpts(commands)
	{
	var opts = {fillShort: false, fillOpen: false, showLabels: false, writeNodes: true};

	for(var i = 0; i < commands.length; i++)
		{
		if(commands[i] == "fill")
			{
			commands.splice(i,1);
			if(commands[i] == "short" || commands[i] == "shorts")
				{
				opts.fillShort = true;
				commands.splice(i,1);
				i--;
				continue;
				}
			if(commands[i] == "open")
				{
				opts.fillOpen = true;
				commands.splice(i,1);
				i--;
				continue;
				}
			i--;
			continue;
			}
		if(commands[i] == "show")
			{
			commands.splice(i,1);
			if(commands[i] == "label" || commands[i] == "labels" || commands[i] == "nodes" || commands[i] == "node")
				{
				opts.showLabels = true;
				commands.splice(i,1);
				i--;
				continue;
				}
			i--;
			continue;
			}

		if(commands[i] == "hide")
			{
			commands.splice(i,1);
			if(commands[i] == "nodes" || commands[i] == "node" || commands[i] == "code" || commands[i] == "codes")
				{
				opts.writeNodes = false;
				commands.splice(i,1);
				if(commands[i] == "code" || commands[i] == "codes")
					{
					commands.splice(i,1)
					}
				i--;
				continue;
				}
			i--;
			continue;
			}
		}

	return opts;
	}

function writeDims(dims, dimOpts, output)
	{
	//Add nodes
	for(var i = 0; i < dims.rows; i++)
		{
		for(var j = 0; j < dims.cols; j++)
			{
			var label = "";
			if(dimOpts.showLabels){ label = "Node " + (i*dims.cols+j); }

			let text = "&#9;\\node at (" + j*xMult + "," + i*yMult + ")\t(" + (i*dims.cols+j) + ")\t{" + label + "};<br>";

			if(dimOpts.writeNodes)
				{
				output.text += text;
				}
			else
				{
				if(hiddenCode.indexOf((text.replace("<br>", "\n")).replace("&#9;", "\t")) == -1)
					{
					hiddenCode+= (text.replace("<br>", "\n")).replace("&#9;", "\t");
					}
				}
			}
		}

	//Fill with shorts (or opens) if specified
	var doFill = (dimOpts.fillOpen || dimOpts.fillShort);
	for(var i = 0; doFill && i < dims.rows; i++)
		 {
		for(var j = 0; j < dims.cols; j++)
			{
			var draw1 = "&#9;\\draw (" + xMult*j + "," + yMult*i + ") to[";

			if(i < dims.rows-1)
				{
				var draw2 = "] (" + xMult*j + "," + yMult*(i+1) + ");<br>";
				if(dimOpts.fillShort){ output.text+=  draw1 + "short" + draw2; }
				if(dimOpts.fillOpen){ output.text+=  draw1 + "open" + draw2; }
				}

			if(j < dims.cols-1)
				{
				var draw2 = "] (" + xMult*(j+1) + "," + yMult*(i) + ");<br>";
				if(dimOpts.fillShort){ output.text+=  draw1 + "short" + draw2; }
				if(dimOpts.fillOpen){ output.text+=  draw1 + "open" + draw2; }
				}
			}
		}
	}

function parseComps(commands)
	{
	var comps = { resistors:
					[{
					btwnPoints: false,
					btwnNodes: false,
					points: {startX: -1, startY: -1, endX: -1, endY: -1},
					nodes: {startNode: -1, endNode: -1}
					}],
				capacitors:
					[{
						btwnPoints: false,
						btwnNodes: false,
						points: {startX: -1, startY: -1, endX: -1, endY: -1},
						nodes: {startNode: -1, endNode: -1}
					}],
				inductors:
					[{
						btwnPoints: false,
						btwnNodes: false,
						points: {startX: -1, startY: -1, endX: -1, endY: -1},
						nodes: {startNode: -1, endNode: -1}
					}],
				vss:
					[{
						btwnPoints: false,
						btwnNodes: false,
						points: {startX: -1, startY: -1, endX: -1, endY: -1},
						nodes: {startNode: -1, endNode: -1}
					}],
				css:
					[{
						btwnPoints: false,
						btwnNodes: false,
						points: {startX: -1, startY: -1, endX: -1, endY: -1},
						nodes: {startNode: -1, endNode: -1}
					}]
				};

	for(var i = 0; i < commands.length; i++)
		{
		if("resistor".indexOf(commands[i]) == 0)
			{
			commands.splice(i,1);
			var postParse = parseSelection({index: i, commands: commands});

			if(postParse.btwnNodes || postParse.btwnPoints)
				{
				comps.resistors[comps.resistors.length] = postParse;
				}

			i--;
			continue;
			}

		if("capacitor".indexOf(commands[i]) == 0 && commands[i].length >= 3)
			{
			commands.splice(i,1);
			var postParse = parseSelection({index: i, commands: commands});

			if(postParse.btwnNodes || postParse.btwnPoints)
				{
				comps.capacitors[comps.capacitors.length] = postParse;
				}

			i--;
			continue;
			}
		if("inductor".indexOf(commands[i]) == 0 || commands[i] == 'l')
			{
			commands.splice(i,1);
			var postParse = parseSelection({index: i, commands: commands});

			if(postParse.btwnNodes || postParse.btwnPoints)
				{
				comps.inductors[comps.inductors.length] = postParse;
				}

			i--;
			continue;
			}

		if("vs".indexOf(commands[i]) == 0 || "volt".indexOf(commands[i]) != -1)
			{
			commands.splice(i,1);
			if(commands.length > 0 && (commands[i].indexOf("src") != -1 || commands[i].indexOf("source") != -1))
				{
				commands[i].splice(i,1);
				}

			var postParse = parseSelection({index: i, commands: commands});
			if(postParse.btwnNodes || postParse.btwnPoints)
				{
				comps.vss[comps.vss.length] = postParse;
				}

			i--;
			continue;
			}

		if("cs".indexOf(commands[i]) == 0 || "cur".indexOf(commands[i]) != -1)
			{
			commands.splice(i,1);
			if(commands.length > 0 && (commands[i].indexOf("src") != -1 || commands[i].indexOf("source") != -1))
				{
				commands[i].splice(i,1);
				}

			var postParse = parseSelection({index: i, commands: commands});
			if(postParse.btwnNodes || postParse.btwnPoints)
				{
				comps.css[comps.css.length] = postParse;
				}

			i--;
			continue;
			}
		}

	return comps;
	}

function parseSelection(options)
	{
	var i = options.index;
	var commands = options.commands;
	var comp = 	{
				btwnPoints: false,
				btwnNodes: false,
				points: {startX: -1, startY: -1, endX: -1, endY: -1},
				nodes: {startNode: -1, endNode: -1}
				};

	if(commands[i] == "node")
		{
		commands.splice(i,1);
		if(!isNaN(commands[i]))
			{
			var tmp = commands[i];
			commands.splice(i,1);
			if(!isNaN(commands[i]))
				{
				comp.btwnNodes = true;
				comp.nodes.startNode = tmp;
				comp.nodes.endNode = commands[i];
				commands.splice(i,1);
				return comp;
				}
			}
		}

	if(!isNaN(commands[i]) && !isNaN(commands[i+1]) && isNaN(commands[i+2]))
		{
		comp.btwnNodes = true;
		comp.nodes.startNode = commands[i];
		comp.nodes.endNode = commands[i+1];
		commands.splice(i,2);
		return comp;
		}

	if(!isNaN(commands[i]) && !isNaN(commands[i+1]) && !isNaN(commands[i+2]) && !isNaN(commands[i+3]))
		{
		comp.btwnPoints = true;
		comp.points.startX = commands[i];
		comp.points.startY = commands[i+1];
		comp.points.endX = commands[i+2];
		comp.points.endY = commands[i+3];
		commands.splice(i,4);
		return comp;
		}

	return comp;
	}

function writeComps(comps, dims, output)
	{
	for(var i = 0; i < comps.resistors.length; i++)
		{
		var res = comps.resistors[i];
		output.text += writeComp(res, "resistor", dims);
		}

	for(var i = 0; i < comps.capacitors.length; i++)
		{
		var cap = comps.capacitors[i];
		output.text += writeComp(cap, "capacitor", dims);
		}

	for(var i = 0; i < comps.inductors.length; i++)
		{
		var ind = comps.inductors[i];
		output.text += writeComp(ind, "inductor", dims);
		}

	for(var i = 0; i < comps.vss.length; i++)
		{
		var vs = comps.vss[i];
		output.text += writeComp(vs, "voltage source", dims);
		}

	for(var i = 0; i < comps.css.length; i++)
		{
		var cs = comps.css[i];
		output.text += writeComp(cs, "current source", dims);
		}
	}

function writeComp(comp, name, dims)
	{
	if(comp.btwnNodes)
		{
		var startCol = comp.nodes.startNode % dims.cols;
		var startRow = Math.floor(comp.nodes.startNode / dims.cols);

		var endCol = comp.nodes.endNode % dims.cols;
		var endRow = Math.floor(comp.nodes.endNode / dims.cols);

		return "&#9;\\draw (" + startCol*xMult + "," + startRow*yMult + ") to[" + name + "] (" + endCol*xMult + "," + endRow*yMult + ");<br>";
		}

	if(comp.btwnPoints)
		{
		return "&#9;\\draw (" + comp.points.startX*xMult + "," + comp.points.startY*yMult + ") to[" + name + "] (" + comp.points.endX*xMult + "," + comp.points.endY*yMult + ");<br>";
		}

	return "";
	}