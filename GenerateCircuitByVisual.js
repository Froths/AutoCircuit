//TODO: +Add support for +
//		~Change move arrays from size 8 to size 9 for better symmetry
//		+Add input tabbing preservation
//		-?Remove main line requirement?
//		+Add more input options (namely scaling)
//		~Change node naming/numbering to be more intuitive
//		~Reference key character array rather than hard-coding the char (eg nodeChars[i] instead of 'N')
//		~MAKE SYNTAX BETTER FOR SHORTHAND
//			~Reduce necessity of shift


var moveChars = ['|', '-', '/', '\\', '^', 'v', '<', '>'];
var nodeChars = ['N'];
var otherChars = ['\'', '_'];

var backSlashMove = [0, 1, 1, 1, 1, 1, 1, 0];
var slashMove =     [1, 1, 0, 1, 1, 0, 1, 1];
var pipeMove = 		[1, 0, 1, 1, 1, 1, 0, 1];
var dashMove = 		[1, 1, 1, 0, 0, 1, 1, 1];
var hatMove = 		[1, 0, 1, 1, 1, 1, 1, 1];
var vMove = 		[1, 1, 1, 1, 1, 1, 0, 1];
var leftMove = 		[1, 1, 1, 0, 1, 1, 1, 1];
var rightMove = 	[1, 1, 1, 1, 0, 1, 1, 1];
var moves = [pipeMove, dashMove, slashMove, backSlashMove, hatMove, vMove, leftMove, rightMove];

function getRowHeight(line)
    {
    for (var i = 0; i < line.length - 2; i++)
        {
        if ((line[i] == '|' || line[i] == '\'') && line[i + 1] == '*' && isNaN(line[i + 2]))
            {
            return parseInt(line[i + 2]);
            }
        }
    return 1;
    }

function isSpecial(char)
    {
    for (var i = 0; i < moveChars.length; i++)
        {
        if (moveChars[i] == char)
            {
            return true;
            }
        }
    for (var i = 0; i < nodeChars.length; i++)
        {
        if (nodeChars[i] == char)
            {
            return true;
            }
        }
    for (var i = 0; i < otherChars.length; i++)
        {
        if (otherChars[i] == char)
            {
            return true;
            }
        }
    return false;
    }

function insertOrdered(val, arr)
    {
    if (arr.length == 0)
        {
        arr[0] = val;
        return;
        }

    if (val > arr[arr.length - 1])
        {
        arr.splice(arr.length, 0, val);
        return;
        }

    if (val < arr[0])
        {
        arr.splice(0, 0, val);
        return;
        }

    for (var i = 1; i < arr.length; i++)
        {
        if (val > arr[i - 1] && val < arr[i])
            {
            arr.splice(i, 0, val)
            return;
            }
        }

    return;
    }

function findVal(val, arr)
    {
    for (var i = 0; i < arr.length; i++)
        {
        if (arr[i] == val)
            {
            return i;
            }
        }
    return -1;
    }

function isMoveChar(char)
    {
    for (var i = 0; i < moveChars.length; i++)
        {
        if (char == moveChars[i])
            {
            return true;
            }
        }
    return false;
    }

//Rename this shit. It's supposed to add a given connection (edge) found to the array of connections while avoiding dupes.
//Input: 	(row, col) = Where the edge terminates
//			(origRow, origcol) = Where the edge begins
//			endPoints = { node1[], node2[], node3[], node4[], ...}
// 					where node = {row, col, edge[]}
// 						where edge[] contains row + col of connected nodes
//
//Given an origin node and the node an edge terminates on, adds the origin node TO THE TERMINATION NODE's list of connections, ie NOT THE NODE WHERE THE EDGE BEGAN.
function addNodeArr(row, col, endPoints, origNodeRow, origNodeCol)
    {
    for (var i = 0; i < endPoints.length; i++)
        {
        if (endPoints[i][0] == row && endPoints[i][1] == col)
            {
            for (var j = 0; j < endPoints[i][2].length; j++)
                {
                if (endPoints[i][2][j][0] != origNodeRow || endPoints[i][2][j][1] != origNodeCol)
                    {
                    endPoints[i][2][j].push([origNodeRow, origNodeCol]);
                    }
                }
            //alert("(" + endPoints[i][0] + ", " + endPoints[i][1] + ") failed check against (" + row + ", " + col + ")");
            return;
            }
        }
    endPoints[endPoints.length] = [row, col, [[origNodeRow, origNodeCol]]];
    return;
    }


function checkForConnector(tempRow, tempCol, tempChar, tempIgnore, lines, colLocs, isNode, endPoints, origNodeRow, origNodeCol)
    {
    var char = lines[tempRow][colLocs[tempCol]];
    if (!isNode && char == 'N')
        {
        //alert(tempChar);
        addNodeArr(tempRow, tempCol, endPoints, origNodeRow, origNodeCol);
        //alert("Found node at row = " + tempRow + " and col = " + tempCol);
        }
    else
        {
        if (char == tempChar)
            {
            //alert("Found connector " + tempChar + " at row = " + tempRow + " and col = " + tempCol);
            var pointsFound = findNodes(tempRow, tempCol, lines, colLocs, tempIgnore, false, origNodeRow, origNodeCol);
            for (var i = 0; i < pointsFound.length; i++)
                {
                addNodeArr(pointsFound[i][0], pointsFound[i][1], endPoints, origNodeRow, origNodeCol);
                }
            }
        }
    }

//Returns termination points: [..., [row, colIndex], ...]
function findNodes(row, colIndex, lines, colLocs, ignoreArr, isNode, origNodeRow, origNodeCol)
    {
    //alert("Looking for connectors around (row = " + row + ", col = " + colIndex + ")");
    var endPoints = [];
    if (ignoreArr.length < 8)
        {
        ignoreArr = [0, 0, 0, 0, 0, 0, 0, 0];
        }


    //Check for boundaries
    if (row == 0 || colIndex == 0 || colLocs[colIndex - 1] >= lines[row - 1].length)
        {
        ignoreArr[0] = 1;
        }
    if (row == 0 || colLocs[colIndex] >= lines[row - 1].length)
        {
        ignoreArr[1] = 1;
        }
    if (row == 0 || colIndex == colLocs.length - 1 || colLocs[colIndex + 1] >= lines[row - 1].length)
        {
        ignoreArr[2] = 1;
        }

    if (colIndex == 0 || colLocs[colIndex - 1] >= lines[row].length)
        {
        ignoreArr[3] = 1;
        }
    if (colIndex == colLocs.length - 1 || colLocs[colIndex + 1] >= lines[row].length)
        {
        ignoreArr[4] = 1;
        }

    if (row == lines.length - 1 || colIndex == 0 || colLocs[colIndex - 1] >= lines[row + 1].length)
        {
        ignoreArr[5] = 1;
        }
    if (row == lines.length - 1 || colLocs[colIndex] >= lines[row + 1].length)
        {
        ignoreArr[6] = 1;
        }
    if (row == lines.length - 1 || colIndex == colLocs.length - 1 || colLocs[colIndex + 1] >= lines[row + 1].length)
        {
        ignoreArr[7] = 1;
        }


    if (isNode)
        {
        var clever = [['\\', 0, 7, backSlashMove], ['/', 2, 5, slashMove], ['|', 1, 6, pipeMove], ['-', 3, 4, dashMove]];

        for (var i = 0; i < 4; i++)
            {
            var tempChar = clever[i][0];
            var a = clever[i][1];
            var b = clever[i][2];
            var a1 = 0;
            var a2 = 0;
            var b1 = 0;
            var b2 = 0;

            if (a < 3)
                {
                a1 = -1;
                }
            if (a > 4)
                {
                a1 = 1;
                }
            if (a == 0 || a == 3 || a == 5)
                {
                a2 = -1;
                }
            if (a == 2 || a == 4 || a == 7)
                {
                a2 = 1;
                }
            if (b < 3)
                {
                b1 = -1;
                }
            if (b > 4)
                {
                b1 = 1;
                }
            if (b == 0 || b == 3 || b == 5)
                {
                b2 = -1;
                }
            if (b == 2 || b == 4 || b == 7)
                {
                b2 = 1;
                }

            if (!ignoreArr[a])
                {
                var tempRow = row + a1;
                var tempCol = colIndex + a2;
                var tempIgnore = clever[i][3].slice();
                tempIgnore[b] = 1;
                checkForConnector(tempRow, tempCol, tempChar, tempIgnore, lines, colLocs, true, endPoints, origNodeRow, origNodeCol);
                }

            if (!ignoreArr[b])
                {
                var tempRow = row + b1;
                var tempCol = colIndex + b2;
                var tempIgnore = clever[i][3].slice();
                tempIgnore[a] = 1;
                checkForConnector(tempRow, tempCol, tempChar, tempIgnore, lines, colLocs, true, endPoints, origNodeRow, origNodeCol);
                }
            }
        }
    else
        {
        //var clever = [[0,7], [1,6], [2,5], [3,4]];
        for (var a = 0; a < 8; a++)
            {
            //alert("a = " + a);
            var a1 = 0;
            var a2 = 0;

            if (a < 3)
                {
                a1 = -1;
                }
            if (a > 4)
                {
                a1 = 1;
                }
            if (a == 0 || a == 3 || a == 5)
                {
                a2 = -1;
                }
            if (a == 2 || a == 4 || a == 7)
                {
                a2 = 1;
                }

            var tempRow = row + a1;
            var tempCol = colIndex + a2;
            //alert("Checking (row = " + tempRow + ", col = " + tempCol + ")");
            for (var i = 0; i < moveChars.length && !ignoreArr[a]; i++)
                {
                var tempChar = moveChars[i];
                var tempIgnore = moves[i].slice();
                tempIgnore[7 - a] = 1;
                checkForConnector(tempRow, tempCol, tempChar, tempIgnore, lines, colLocs, false, endPoints, origNodeRow, origNodeCol);
                }
            }
        }

    return endPoints;
    }


var selected = "2" + "\n" +
    "_ _ _ _ _ _ _ _ N" + "\n" +
    "N - - N - - N _ |" + "\n" +
    "| _ / | _ _ | _ |" + "\n" +
    "| / _ | _ _ N - N" + "\n" +
    "N _ _ N - N";

/*var selected2 = "2" +
"                N" + "\n" +
"N - - N - - N _ |" + "\n" +
"|   / |     |   |" + "\n" +
"| /   |     N - N" + "\n" +
"N     N - N";*/


//Split into lines ---------------
var lines = [];
var firstIndex = 0;
for (var i = 0; i < selected.length; i++)
    {
    if (selected[i] == "\n")
        {
        lines[lines.length] = selected.substring(firstIndex, i);
        firstIndex = i + 1;
        }
    }
lines.push(selected.substring(firstIndex, selected.length));

//Identify main line number ---------------
//Input read is NOT ZERO-INDEXED, but stored value IS ZERO-INDEXED
var mainLineNum = parseInt(lines[0]) - 1;
var mainLine = "" + lines[mainLineNum + 1];
lines.splice(0, 1);


//Get row heights ---------------
var rowHeights = [];
var totalHeight = 0;
for (var i = 0; i < lines.length; i++)
    {
    rowHeights[i] = getRowHeight(lines[i]);
    if (i != lines.length - 1)
        {
        totalHeight += rowHeights[i];
        }
    }


//Get y-coordinate of each row ---------------
var rowY = [0];
for (var i = 1; i < rowHeights.length; i++)
    {
    rowY[i] = rowY[i - 1] + rowHeights[i - 1];
    }


//ID nodes on main line ---------------
var nodeArr = [];
var mainX = -1;
var mainY = rowY[mainLineNum];
for (var i = 0; i < mainLine.length; i++)
    {
    //alert(i);
    if (mainLine[i] == 'N')
        {
        mainX++;
        // alert(i + "");
        nodeArr.push({
                         num: nodeArr.length,
                         x: mainX,
                         y: mainY,
                         cNodes: []
                     });
        }
    if (mainLine[i] == '-' || mainLine[i] == '_')
        {
        //@TODO: OOB?
        if (mainLine[i + 1] == '*')
            {
            mainX += parseInt(mainLine[i + 2]);
            }
        else
            {
            mainX++;
            }
        }
    }


//Identify visual grid ---------------
var colLocs = [];
for (var i = 0; i < lines.length; i++)
    {
    for (var j = 0; j < lines[i].length; j++)
        {
        if (isSpecial(lines[i][j]))
            {
            insertOrdered(j, colLocs);
            }
        }
    }


function getColWidth(colIndex, lines, colLocs)
    {
    var x = colLocs[colIndex];
    for (var i = 0; i < lines.length - 2; i++)
        {
        if (x < lines[i].length)
            {
            if ((lines[i][x] == '-' || lines[i][x] == '_') && lines[i][x + 1] == '*' && isNaN(lines[i][x + 2]))
                {
                return parseInt(lines[i][x + 2]);
                }
            }
        }
    return 1;
    }

//Get col widths
var colX = [0];
for (var i = 1; i < colLocs.length; i++)
    {
    colX[i] = colX[i - 1] + getColWidth(i - 1, lines, colLocs);
    }


function addNodeClasses(nodeArrArr, nodeClassArr)
    {
    for (var i = 0; i < nodeArrArr.length; i++)
        {
        var dupe = false;
        for (var k = 0; k < nodeClassArr.length; k++)
            {
            if (nodeArrArr[i][1] == nodeClassArr[k].x && nodeArrArr[i][0] == nodeClassArr[k].y)
                {
                dupe = true;
                for (var m = 0; m < nodeArrArr[i][2].length; m++)
                    {
                    var dupe2 = false;
                    for (var n = 0; n < nodeClassArr[k].cNodes.length; n++)
                        {
                        if (nodeClassArr[k].cNodes[n][0] == nodeArrArr[i][2][m][1] && nodeClassArr[k].cNodes[n][1] == nodeArrArr[i][2][m][0])
                            {
                            dupe2 = true;
                            }
                        }
                    if (!dupe2)
                        {
                        nodeClassArr[k].cNodes.push([nodeArrArr[i][2][m][1], nodeArrArr[i][2][m][0]])
                        }
                    }
                }
            }
        if (!dupe)
            {
            var tempNodes = [];
            for (var k = 0; k < nodeArrArr[i][2].length; k++)
                {
                tempNodes.push([nodeArrArr[i][2][k][1], nodeArrArr[i][2][k][0]]);
                }
            nodeClassArr.push({
                                  num: nodeClassArr.length,
                                  x: nodeArrArr[i][1],
                                  y: nodeArrArr[i][0],
                                  cNodes: tempNodes
                              });
            }
        }
    }

//Scan next lines for nodes ---------------
for (var i = 0; i < lines.length; i++)
    {
    for (var j = 0; j < lines[i].length; j++)
        {
        if (lines[i][j] == 'N')
            {
            var colIndex = findVal(j, colLocs);
            var nodesFound = findNodes(i, colIndex, lines, colLocs, [], true, i, colIndex);
            nodesFound.push([i, colIndex, []]);
            addNodeClasses(nodesFound, nodeArr);
            }
        }
    }


//Identify unique connections
var connections = [];
for (var i = 0; i < nodeArr.length; i++)
    {
    for (var j = 0; j < nodeArr[i].cNodes.length; j++)
        {
        var tempp = [nodeArr[i].cNodes[j][0], nodeArr[i].cNodes[j][1]];
        var temppNode = -1;

        for (var k = 0; k < nodeArr.length; k++)
            {
            if (tempp[0] == nodeArr[k].x && tempp[1] == nodeArr[k].y)
                {
                temppNode = k;
                break;
                }
            }

        var dupe = false;
        for (var k = 0; k < connections.length; k++)
            {
            if ((temppNode == connections[k][0] && i == connections[k][1]) || (temppNode == connections[k][1] && i == connections[k][0]))
                {
                dupe = true;
                break;
                }
            }

        if (!dupe)
            {
            connections.push([i, temppNode]);
            }
        }
    }


//FINNALLLY TRANSLATING - :BLOBSCREMA:
var nodeDeclrs = "";
for (var i = 0; i < nodeArr.length; i++)
    {
    nodeDeclrs += ";\\node\t\tat(" + (nodeArr[i].x) + "," + (totalHeight - nodeArr[i].y) + ")\t\t(n" + i + ")\t\t{};\n";
    }

var connCode = "";
for (var i = 0; i < connections.length; i++)
    {
    connCode += "(n" + connections[i][0] + ")  to[short] (n" + connections[i][1] + ")\n";
    }

var testMsg = nodeDeclrs + "\n\\draw\n" + connCode;

//var testMsg = "";
for (var i = 0; i < nodeArr.length; i++)
    {
    var connects = "";
    for (var j = 0; j < nodeArr[i].cNodes.length; j++)
        {
        connects += "\t\t(" + nodeArr[i].cNodes[j][0] + ", " + nodeArr[i].cNodes[j][1] + ")\n";
        }
    //alert("Node " + nodeArr[i].num + " is at (" + nodeArr[i].x + ", " + nodeArr[i].y + ")\n" + connects);
    //testMsg += "Node " + nodeArr[i].num + " is at (" + nodeArr[i].x + ", " + nodeArr[i].y + ")\n" + connects + "\n***************************\n";
    }

//testMsg += "\n----------------------------------------------\n"
for (var i = 0; i < connections.length; i++)
    {
    //testMsg += "(" + connections[i][0] + ", " + connections[i][1] + ")";
    }

//alert(testMsg);
console.info(testMsg);


//function findNodes(row, colIndex, lines, colLocs, ignoreArr, isNode, origNodeRow, origNodecol)

var div = document.createElement("div");
var para = document.createElement("PRE");
var node = document.createTextNode(testMsg);
para.appendChild(node);
div.append(para);

document.body.appendChild(div);