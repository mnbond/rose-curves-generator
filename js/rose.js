class Rose {
    constructor(containerId, frameDurationMs, stepPerFrame, k, loopSizeDeg, 
                startAngleDeg, polygonSizeDeg, polygonPerGroup, palette) {

        this.animation = {
            currentAngleDeg: startAngleDeg,
            frameDurationMs: frameDurationMs,
            loopSizeDeg: loopSizeDeg,
            startAngleDeg: startAngleDeg,
            stepAngleDeg: 1,
            stepPerFrame: stepPerFrame,
            timerId: 0
        };

        this.colorsCount = 9;
        this.containerNode = document.getElementById(containerId);
        this.k = k;
        this.palette = palette;
        this.polygonSizeDeg = polygonSizeDeg;
        this.polygonPerGroup = polygonPerGroup;
        this.radius = 1000;
        
        this.appendSvgToContainer();
        this.start();
    }
    
    appendPathToSvg(color) {
        const newPathNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
        newPathNode.classList.add(color);
        newPathNode.setAttribute("d", "");
        
        const svgNode = this.containerNode.firstChild;
        svgNode.appendChild(newPathNode);
    }

    appendPointToPath(point) {
        const svgNode = this.containerNode.firstChild;
        const pathNode = svgNode.lastChild;

        let points = pathNode.getAttribute("d");
        points += (!points ? "M" : "L") + point[0] + "," + point[1];

        pathNode.setAttribute("d", points);
    }

    appendSvgToContainer() {
        while (this.containerNode.firstChild) {
            this.containerNode.firstChild.remove();
        }

        const newSvgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        newSvgNode.classList.add(this.palette);
        newSvgNode.setAttribute("viewBox", "0 0 " + (this.radius * 2 + 1) + " " + (this.radius * 2 + 1));

        this.containerNode.appendChild(newSvgNode);
    }
    
    static calcPointCartesian(k, radius, angleDeg) {
        let center = [radius, radius];
        if (k == 1) {
            center = [0, radius];
            radius *= 2;
        }
        
        const angleRad = angleDeg * Math.PI / 180;
        const l = (radius - 1) * Math.cos(k * angleRad);
        const x = l * Math.cos(angleRad);
        const y = l * Math.sin(angleRad);
        
        return [Math.round(center[0] + x), Math.round(center[1] - y)];
    }
    
    start() {
        clearInterval(this.animation.timerId);
        this.animation.timerId = setInterval(() => {
            for (let i = 0; i < this.animation.stepPerFrame; i++) {
                this.step();

                this.animation.currentAngleDeg += this.animation.stepAngleDeg;
                if (this.animation.currentAngleDeg - this.animation.startAngleDeg > this.animation.loopSizeDeg) {
                    this.stop();
                    break;
                }
            }
        }, this.animation.frameDurationMs);
    }
    
    step() {
        const currentLoopSizeDeg = this.animation.currentAngleDeg - this.animation.startAngleDeg;
        const currentPolygon = Math.floor(currentLoopSizeDeg / this.polygonSizeDeg);
        const currentGroup = Math.floor(currentPolygon / this.polygonPerGroup) % this.colorsCount;
        const currentPoint = Rose.calcPointCartesian(this.k, this.radius, this.animation.currentAngleDeg);

        if (currentLoopSizeDeg == 0) {
            this.appendPathToSvg("color-" + currentGroup);
        }

        this.appendPointToPath(currentPoint);
        
        if (currentLoopSizeDeg % this.polygonSizeDeg == 0 && 
            currentLoopSizeDeg > 0 && 
            currentLoopSizeDeg < this.animation.loopSizeDeg) {
            
            this.appendPathToSvg("color-" + currentGroup);
            this.appendPointToPath(currentPoint);
        }
    }
    
    stop() {
        clearInterval(this.animation.timerId);
    }
}