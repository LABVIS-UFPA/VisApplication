/**
 * Class Data Interaction Chosen for all visualizations.
 */
class Interaction_Chosen {
  constructor() {
    this.element = [];
    this.type;
  }

  setElemt(elem){
    this.element.push(elem);
  }

  setType(type){
    this.type = type;
  }


  selectInteraction(type) {
    this.setType(type);
    this.chosen();
  }

  chosen() {
    switch (this.type) {
      case "highlighted":
        this.strategy = new HighlightStategy(this.element);
        break
      case "Detail on Demand":
        this.strategy = new DetaionsOnStrategy(this.element);
        break
      case "Zoom":
        this.strategy = new ZoomOnStrategy(this.element);
        break
      case "Anottation":
        this.strategy = new AnotationStategy(this.element);
        break
      case "Line":
        this.strategy = new LineStategy(this.element);
        break
      case "Rect":
        // this.strategy = new ConcreteStrategyB()
        break
      case "handFree":
        // this.strategy = new ConcreteStrategyB()
        break
      case "Selection by attribute":
        // this.strategy = new ConcreteStrategyB()
        break
      case "filter":
        // this.strategy = new ConcreteStrategyB()
        break
      default:
        this.strategy = new HighlightStategy(this.element);
    }
  }


  ContextInterface (){

    this.strategy.AlgorithmInterface()
  }
}

class Strategy {
  constructor() {
  }

  AlgorithmInterface (){
  }
}

class HighlightStategy extends Strategy{
  constructor(element) {
    super()
    this.element = element;
  }

  start(){
    for (let i = 0; i <this.element.length ; i++) {
      this.element[i].on("datamouseover",function(d,i){
        $(".partition-content").each(function(){
          if(this.__vis__){
            let elem = this.__vis__.getHighlightElement(i);
            this.__vis__.highlight(d,i);
          }
        });
      });
      console.log('StrategyA highlight created')
    }
  }
}

class AnotationStategy extends Strategy{
  constructor(element) {
    super()
    this.element = element;

  }

  start(){
    for (let i = 0; i <this.element.length ; i++) {
    let parentElement = this.element[i].parentElement;
        this.element[i].on("dataclick",function(d,i){
        var x = event.offsetX;
        var y = event.offsetY;
          parentElement.__vis__.comments(x,y);

      });
      }


    console.log('StrategyA highlight created')
  }
}

class DetaionsOnStrategy extends Strategy{
  constructor(element) {
    super()
    this.element = element;

  }
  start(){
      for (let i = 0; i <this.element.length ; i++) {
        detail_on(this.element[i]);
        console.log(' DetaionsOnStrategy created');
      }
  }
}

class ZoomOnStrategy extends Strategy{
  constructor(element) {
    super()
    this.element = element
  }
  start(){
    //layer(true);

  for (let i = 0; i < this.element.length; i++) {
    let elem = this.element[i].parentElement;
    let g = d3.selectAll(this.element[i].parentElement.children)

    console.log("1:",this.element[i].parentElement.children);

    d3.selectAll(this.element[i].parentElement.children).call(d3.zoom()
    .scaleExtent([1, 5])
    .on("zoom", zoomed));

    // function zoomed() {
    //     g.attr("transform", d3.event.transform);
    //     g.translate(d3.event.transform.x, d3.event.transform.y);
    //     //g.scale(zoom.transform, d3.zoomIdentity);
    //     //g.save();
    //
    //
    // //    g.restore();
    //   }
  }

    console.log(' DetaionsOnStrategy created');
  }

}

class LineStategy extends Strategy{
  constructor(element) {
    super()
    this.element = element;
  }

  start(){
  let sel = vis.selection;
  var selection = d3.select(".interactionLayer")
  let line = [0,0,0,0];
  let drawLine=  selection.append('line')
  .attr('class','svgSelectionElement')
  .attr('stroke', 'grey')
  .attr('stroke-width','2px')
  .style("stroke-dasharray", ("10,3")) // make the stroke dashed


  let toggleSelected = true;
  selection.on('click',()=>{
    console.log("begin");
    if(toggleSelected == true) {
      console.log( d3.event.pageX, d3.event.pageY )
      line[0]= d3.event.clientX
      line[1]= d3.event.clientY
      d3.select(".interactionLayer").classed("selected", true);
      toggleSelected = false;

      selection.on('mousemove',()=>{
        line[2] = d3.event.pageX;
        line[3] = d3.event.pageY;
        drawLine
        .attr('x1',line[0])
        .attr('y1',line[1])
        .attr('x2', line[2])
        .attr('y2', line[3])
      });

    } else {
      d3.select(".interactionLayer").classed("deselected", true);
      toggleSelected = true;
      line[2] = d3.event.pageX;
      line[3] = d3.event.pageY;
      drawLine
      .attr('x2', line[2])
      .attr('y2', line[3])
      let lin2 =new sel.LineSelection(line);
      this.element[0].select(lin2);
      //this.element[0].redraw();

      line = [0,0,0,0]
      console.log("teste moves");
      selection.on('mousemove',()=>{
      });

    }

    console.log("end");
  });


  selection.on('dblclick',()=>{
    let lin2 =new sel.LineSelection([0,0,0,0]);
    //this.element[0].select(lin2);

    console.log(this.element[0])
    //this.element[0].redraw();
    console.log("db click")
    line= [0,0,0,0]
  });


  for (let i = 0; i <this.element.length ; i++) {
     this.element[i].setInteractionMode(true);
      console.log('LineStrategy created');
    }
}

}
