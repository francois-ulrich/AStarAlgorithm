import Node from './Node';
import Client from './Client';

interface mapConfigInterface {
    width:number,
    height:number,
    drawOptions: {
        cellSize: number,
    }
}

export default class Map {
    private grid:Node[][] = [];
    private client:Client;
    private width: number = 20;
    private height: number = 20;
    private cellSize: number = 20;

    private startNode:Node;
    private goalNode:Node;

    private closedList:Array<Node> = [];
    private openList:Array<Node> = [];
    private pathList:Array<Node> = [];

    constructor(config:mapConfigInterface){
        if (config.width)
            this.width = Math.floor(config.width);

        if (config.height)
            this.height = Math.floor(config.height);

        if (config.drawOptions){
            let drawConfig = config.drawOptions;

            if(drawConfig.cellSize){
                this.cellSize = Math.floor(drawConfig.cellSize);
            }
        }

        // Set array size
        for(let y:number=0; y<this.height; y++){
            this.grid.push([]);
        }

        // Add nodes to grid
        for(let y:number=0; y<this.height; y++){
            for(let x:number=0; x<this.width; x++){
                let walkable = true;
                let map = this;
                this.grid[y][x] = new Node(map,x,y,walkable);
            }
        }

        this.setStartNode(this.getNodeAtPosition(5,10));
        this.setGoalNode(this.getNodeAtPosition(15,10));
    }

    // Accessors
    public getNodeAtPosition(x:number,y:number){
        return this.grid[y][x];
    }

    public getClient(){
        return this.client;
    }

    public getWidth(){
        return this.width;
    }

    public getHeight(){
        return this.height;
    }

    public getCellSize(){
        return this.cellSize;
    }

    public getStartNode(){
        return this.startNode;
    }

    public getGoalNode(){
        return this.goalNode;
    }

    public getOpenList(){
        return this.openList;
    }

    public getClosedList(){
        return this.closedList;
    }

    public getPathList(){
        return this.pathList;
    }

    // Mutators
    public setStartNode(node:Node){
        this.openList.length = 0;
        this.closedList.length = 0;

        // If the passed node is declared but isn't walkable or is the goal node, the method is canceled
        if(node && (!node.getWalkable() || node===this.goalNode))
            return;

        // If the passed node is null, we set the start node at null and we draw it.
        if(!node){
            this.startNode = null;
            this.client.draw();
        }
        // If the passed node is valid, we draw an empty node in place of the old node and place and draw the new node
        else{
            let oldNode = this.startNode;
            this.startNode = node;

            if(oldNode){
                oldNode.draw();
            }

            this.addNodeToOpenList(this.startNode);
            this.startNode.draw();
        }
    }

    public setGoalNode(node:Node){
        if(node && (!node.getWalkable() || node===this.startNode))
            return;

        if(!node){
            this.goalNode = null;
            this.client.draw();
            return;
        }else{
            let oldNode = this.goalNode;
            this.goalNode = node;
            if(oldNode){
                oldNode.draw();
            }
            this.goalNode.draw();
        }
    }

    public appendHtmlEditorToElement(element:HTMLElement){
        // Set client
        this.client = new Client(this,element);
        this.client.draw();
    }

    public addNodeToOpenList(node:Node){
        this.openList.push(node);
    }

    public addNodeToClosedList(node:Node){
        this.closedList.push(node);
    }

    public deleteNodeFromOpenList(node:Node){
        let nodeToDeleteIndex = this.openList.indexOf(node);
        if (nodeToDeleteIndex > -1) {
            this.openList.splice(nodeToDeleteIndex, 1);
        }
    }
/*
    public deleteNodeFromClosedList(node:Node){
        let nodeToDeleteIndex = this.closedList.indexOf(node);
        if (nodeToDeleteIndex > -1) {
            this.closedList.splice(nodeToDeleteIndex, 1);
        }
    }
*/
    public moveNodeFromOpenToClosedList(node:Node){
        this.deleteNodeFromOpenList(node);
        this.addNodeToClosedList(node);
        node.draw();
    }

    /*
    ==================
    Algorithms
    ==================
    */
    public publicAStarExecuteNextStep(){
        // If goal is not found, we try to find it first....

        if(!this.getClosedList().includes(this.getGoalNode())){
            if(!this.startNode || !this.goalNode){
                console.log("No start or goal node!");
                return;
            }

            if(this.getClosedList().includes(this.getGoalNode())){
                console.log("The goal node has been found! No need to continue.");
                return;
            }

            if(this.openList.length==0){
                console.log("No more paths to explore...");
                return;
            }

            // We select the Node with the lowest FCost
            var nodeWithLowestFCost:Node = null;

            this.openList.forEach((currentNode,index) => {
                if(index==0 || currentNode.getFCost()<nodeWithLowestFCost.getFCost()){
                    nodeWithLowestFCost = this.openList[index];
                }
            });

            if(nodeWithLowestFCost){
            // Add every possible neighbours of the open list to the open list
                for(let y = nodeWithLowestFCost.getGridPosition().y-1 ; y<nodeWithLowestFCost.getGridPosition().y+2 ; y++){
                    for(let x= nodeWithLowestFCost.getGridPosition().x-1; x<nodeWithLowestFCost.getGridPosition().x+2 ; x++){
                        // We don't want to check the current node
                        if(x==nodeWithLowestFCost.getGridPosition().x && y==nodeWithLowestFCost.getGridPosition().y)
                            continue;
                        
                        // If x or y is out of bounds, continue
                        if(x<0 || y<0 || x>this.width-1 || y>this.height-1)
                            continue;

                        // Get current neighbour
                        let neighbourNode:Node = this.getNodeAtPosition(x,y);

                        var xx:number = nodeWithLowestFCost.getGridPosition().x - x;
                        var yy:number = nodeWithLowestFCost.getGridPosition().y - y;
                        
                        if(yy!=0){
                            if(yy==-1){
                                if(xx!=0){
                                    if(this.getNodeAtPosition(neighbourNode.getGridPosition().x+xx,neighbourNode.getGridPosition().y+yy).getWalkable())

                                    if(xx==-1){
                                        // Top left corner
                                        // If corner walkable
                                        if(!this.getNodeAtPosition(neighbourNode.getGridPosition().x,neighbourNode.getGridPosition().y-1).getWalkable() && !this.getNodeAtPosition(neighbourNode.getGridPosition().x-1,neighbourNode.getGridPosition().y).getWalkable())
                                            continue;
                                    }
                                    else
                                    if(xx==1){
                                        // Top right corner
                                        // If corner walkable
                                        if(!this.getNodeAtPosition(neighbourNode.getGridPosition().x,neighbourNode.getGridPosition().y-1).getWalkable() && !this.getNodeAtPosition(neighbourNode.getGridPosition().x+1,neighbourNode.getGridPosition().y).getWalkable())
                                            continue;
                                    }
                                }
                            }
                            else
                            if(yy==1){
                                if(xx!=0){
                                    if(xx==-1){
                                        // Bottom left corner
                                        // If corner walkable
                                        if(!this.getNodeAtPosition(neighbourNode.getGridPosition().x,neighbourNode.getGridPosition().y+1).getWalkable() && !this.getNodeAtPosition(neighbourNode.getGridPosition().x-1,neighbourNode.getGridPosition().y).getWalkable())
                                            continue;
                                    }
                                    else
                                    if(xx==1){
                                        // Bottom right corner
                                        // If corner walkable
                                        if(!this.getNodeAtPosition(neighbourNode.getGridPosition().x,neighbourNode.getGridPosition().y+1).getWalkable() && !this.getNodeAtPosition(neighbourNode.getGridPosition().x+1,neighbourNode.getGridPosition().y).getWalkable())
                                            continue;
                                    }
                                }
                            }
                        }

                        // Check if current node is the goal node.
                        if(neighbourNode == this.getGoalNode()){
                            console.log("Path found!!");
                        }

                        if(neighbourNode.inClosedList() || neighbourNode.inOpenList() || neighbourNode.getWalkable()==false)
                            continue;
                        
                        this.addNodeToOpenList(neighbourNode);
                        neighbourNode.draw();
                    }
                }

                this.moveNodeFromOpenToClosedList(nodeWithLowestFCost);
            }
        }
        // If goal is found, we trace the path until we find the start node
        else if(!this.pathList.includes(this.startNode)){
            if(this.pathList.length==0){
                this.pathList.push(this.goalNode);
            }else{
                //Last node of path
                var lastNodeInPathList:Node = this.pathList[this.pathList.length-1];
                var neighbourWithLowestFCost = lastNodeInPathList.getNeighbourWithLowestFCost();
                if(neighbourWithLowestFCost){
                    this.pathList.push(neighbourWithLowestFCost);
                    neighbourWithLowestFCost.draw();
                }
            }
        }
    }
}