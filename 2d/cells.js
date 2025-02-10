class cell
{
    CellSystem;
    Pos; Points = [];
    NeighborsOffset = [[-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]];
    Color;

    constructor( cellSyst, pos )
    {
        this.CellSystem = cellSyst;
        this.Pos = pos;
        this.Color = new vec3(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
    }

    isInside( Pos )
    {
        return Pos.X >= this.Pos.X && Pos.X <= this.Pos.X + this.CellSystem.W &&
               Pos.Y >= this.Pos.Y && Pos.Y <= this.Pos.Y + this.CellSystem.H;
    }

    erasePoint( Point )
    {
        let ind;
        for (ind = 0; ind < this.Points.length; ind++)
            if (this.Points[ind] == Point)
                break;

        if (ind == this.Points.length)
            return;   // no such element 

        if (ind == this.Points.length - 1)
        {                                    // the last element
            this.Points.pop();
            return;
        }

        this.Points[ind] = this.Points.pop();
    }

    isAdded( Point )
    {
        for (let p of this.Points)
            if (p == Point)
                return true;
        return false;    
    }

    insertPoint( Point )
    {
        if (!this.isAdded(Point))
        {
            this.Points.push(Point);
            Point.cell = this;
            return true;
        }
        return false;
    }
}

class cellSystem
{
    Cells = []; 
    W; H;  // for one cell
    Pos; SizeX; SizeY;   // for general system

    constructor( Pos, BoundBoxX, BoundBoxY, W, H )
    {
        this.SizeX = Math.max(Math.ceil(BoundBoxX / W), 2);
        this.SizeY = Math.max(Math.ceil(BoundBoxY / H), 2);
        this.Pos = Pos;
        this.W = W;
        this.H = H;

        // create cells
        for (let x = 0; x < this.SizeX; x++)
        {
            this.Cells.push([]);
            for (let y = 0; y < this.SizeY; y++)
                this.Cells[x].push( new cell(this, this.Pos.add(new vec2(x * W, y * H))));
        }
    }

    insertPoint( Point )
    {
        let delta = Point.pos.sub(this.Pos);
        let cell = this.Cells[Math.floor(delta.X / this.W)][Math.floor(delta.Y / this.H)];
        let flag = cell.insertPoint(Point);
        return flag;
    }

    // check are cells changed for points?
    update(  )
    {
        for (let row of this.Cells)
        {
            for (let c of row)
            {
                let PointsToErase = [];
                for (let point of c.Points)
                {
                    if (c.isInside(point.pos))
                        continue;

                    if (this.insertPoint(point))
                        PointsToErase.push(point);               // cannot erase point from array now
                }
                for (let p of PointsToErase)
                    c.erasePoint(p);
            }
        }
    }

    render( ToStandartCSFunc, ctx )
    {
        ctx.beginPath();    
        for (let x = 0; x <= this.SizeX; x++)
        {
            let v1 = ToStandartCSFunc(this.Pos.add(new vec2(x * this.W, 0)));
            let v2 = ToStandartCSFunc(this.Pos.add(new vec2(x * this.W, this.SizeY * this.H)));
            ctx.moveTo(v1.X, v1.Y);
            ctx.lineTo(v2.X, v2.Y);            
        }
        for (let y = 0; y <= this.SizeY; y++)
        {
            let v1 = ToStandartCSFunc(this.Pos.add(new vec2(0, y * this.H)));
            let v2 = ToStandartCSFunc(this.Pos.add(new vec2(this.W * this.SizeX, y* this.H)));
            ctx.moveTo(v1.X, v1.Y);
            ctx.lineTo(v2.X, v2.Y);            
        }
        ctx.stroke();

    }
}