# AutoCircuit
Demo: http://htmlpreview.github.io/?https://github.com/Froths/AutoCircuit/blob/master/mainmaybe.html

# Currently supported syntax:

- `{numRows}x{numCols}`	: 	Creates a grid of numbered nodes with the specified dimesnions

- `{show/hide} labels`	:	Show/hide the LaTeX code for the nodes

- `fill {comp}`			: 	Connects each node to its neighbors (up/down, left/right) with the specified component
	- Currently supported components are `short` and `open`
	
- `{comp} {node1} {node2}`:	Draws a component that starts at `{node1}` and ends at `{node2}`
	- Currently supported components are: 
		- `resistor`
		- `capacitor`
		- `cs` or `current source`
		- `vs` or `voltage source`

- `{comp} {x1} {y1} {x2} {y2}`: Draws a component that starts at the coordinate `(x1,y1)` and ends at `(x2,y2)`
	- Currently supported components are the same as for the `{comp} {node1} {node2}` syntax
