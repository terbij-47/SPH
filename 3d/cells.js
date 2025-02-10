class cell
{
    cellSystem;
    pos; points = [];
    indexesInArray;

    color;

    constructor( cellSyst, pos )
    {
        this.cellSystem = cellSyst;
        this.pos = pos;
        this.color = new vec3(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
    }

    isInside( Pos )
    {
        return Pos.x >= this.pos.x && Pos.x <= this.pos.x + this.cellSystem.w &&
               Pos.y >= this.pos.y && Pos.y <= this.pos.y + this.cellSystem.h && 
               Pos.z >= this.pos.z && Pos.z <= this.pos.z + this.cellSystem.d; 
    }

    erasePoint( Point )
    {
        let ind;
        for (ind = 0; ind < this.points.length; ind++)
            if (this.points[ind] == Point)
                break;

        if (ind == this.points.length)
            return;   // no such element 

        if (ind == this.points.length - 1)
        {                                    // the last element
            this.points.pop();
            return;
        }

        this.points[ind] = this.points.pop();
    }

    isAdded( Point )
    {
        for (let p of this.points)
            if (p == Point)
                return true;
        return false;    
    }

    insertPoint( Point )
    {
        if (!this.isAdded(Point))
        {
            this.points.push(Point);
            Point.cell = this;
            return true;
        }
        return false;
    }
}

class cellSystem
{
    cells = []; 
    w; h; d;  // for one cell
    maxBound; maxBound2;
    // for global boundary
    boundary;
    diag;

    pos; sizeX; sizeY;  sizeZ;   // for general system

    // Another idea to define neighbours. Order: (x, y, z): 
    static neighborsOffsets = [new vec3(-1, 1, -1), new vec3(-1, 1, 0), new vec3(-1, 1, 1), new vec3(0, 1, -1), new vec3(0, 1, 0), new vec3(0, 1, 1), new vec3(1, 1, -1), new vec3(1, 1, 0), new vec3(1, 1, 1), 
                        new vec3(-1, 0, -1),  new vec3(-1, 0, 0),  new vec3(-1, 0, 1), new vec3(0, 0, -1), new vec3(0, 0, 1), new vec3(1, 0, -1), new vec3(1, 0, 0), new vec3(1, 0, 1),
                        new vec3(-1, -1, -1), new vec3(-1, -1, 0), new vec3(-1, -1, 1), new vec3(0, -1, -1), new vec3(0, -1, 0), new vec3(0, -1, 1), new vec3(1, -1, -1), new vec3(1, -1, 0), new vec3(1, -1, 1)];

    constructor( Pos, BoundBoxX, BoundBoxY, BoundBoxZ, W, H, D )
    {
        this.sizeX = Math.max(Math.ceil(BoundBoxX / W), 2);
        this.sizeY = Math.max(Math.ceil(BoundBoxY / H), 2);
        this.sizeZ = Math.max(Math.ceil(BoundBoxZ / D), 2);
        this.boundary = new vec3(BoundBoxX, BoundBoxY, BoundBoxZ);
        this.diag = Pos.add(this.boundary);

        this.pos = Pos;
        this.w = W;
        this.h = H;
        this.d = D;
        this.maxBound = Math.max(W, Math.max(H, D));
        this.maxBound2 = this.maxBound**2;

        // create cells
        for (let x = 0; x < this.sizeX; x++)
        {
            this.cells.push([]);
            for (let y = 0; y < this.sizeY; y++)
            {
                this.cells[x].push([]);
                for (let z = 0; z < this.sizeZ; z++)
                {
                    this.cells[x][y].push( new cell(this, this.pos.add(new vec3(x * W, y * H, z * D))));
                    this.cells[x][y][z].indexesInArray = new vec3(x, y, z);
                }
            }
        }
    }

    insertPoint( Point )
    {
        let delta = Point.pos.sub(this.pos);
        let cellX = Math.floor(delta.x / this.w);
        let cellY = Math.floor(delta.y / this.h);
        let cellZ = Math.floor(delta.z / this.d);
        if (cellX < 0 || cellX >= this.sizeX || cellY < 0 || cellY >= this.sizeY || cellZ < 0 || cellZ >= this.sizeZ)
        {
            // console.log('fatal error:: point is out of cell system');
            return;
        }    
        let cell = this.cells[cellX][cellY][cellZ];
        return cell.insertPoint(Point);
    }

    // check are cells changed for points?
    update(  )
    {
        for (let plane of this.cells)
        {
            for (let row of plane)            
            {
                for (let cell of row)
                {
                    let PointsToErase = [];
                    for (let point of cell.points)
                    {
                        if (cell.isInside(point.pos)) 
                            continue;

                        if (this.insertPoint(point))    
                            PointsToErase.push(point);               // cannot erase point from array now
                    }

                    for (let point of PointsToErase)
                        cell.erasePoint(point);
                }
            }
        }
    }

    // Func( particle &i, particle &j, double h2 )
    // this Func must change i
    forNearest( Particle, Func )
    {
        let currentInds = Particle.cell.indexesInArray;
        // console.log();
        for (let offset of cellSystem.neighborsOffsets)
        {
            let nOffset = currentInds.add(offset);
            // console.log(nOffset);
            let neighbour = undefined;
            if (this.cells[nOffset.x] != undefined && this.cells[nOffset.x][nOffset.y] != undefined)
                neighbour = this.cells[nOffset.x][nOffset.y][nOffset.z];

            if (neighbour == undefined) 
                continue;
            for (let part of neighbour.points)
                Func(Particle, part, this.maxBound2);
        }
        for (let part of Particle.cell.points)
            if (Particle != part)
                Func(Particle, part, this.maxBound2);  
    } 

}