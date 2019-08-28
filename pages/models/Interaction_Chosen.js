module.exports = class Interaction_Chosen {
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
        // this.strategy = new ConcreteStrategyB()
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
    
    function zoomed() {
        g.attr("transform", d3.event.transform);
        g.translate(d3.event.transform.x, d3.event.transform.y);
        //g.scale(zoom.transform, d3.zoomIdentity);
        //g.save();
 
  
    //    g.restore();
      }
  }  
      
    console.log(' DetaionsOnStrategy created');
  }

}

class LineStategy extends Strategy{
  constructor(element) {
    super()
    var stage = new createjs.Stage("canvas");
    createjs.Ticker.on("tick", tick);

    var selection = new createjs.Shape(),
        g = selection.graphics.setStrokeStyle(1).beginStroke("#000").beginFill("rgba(0,0,0,0.05)"),
        sd = g.setStrokeDash([10,5], 0).command,
        r = g.drawRect(0,0,100,100).command,
        moveListener;


    stage.on("stagemousedown", dragStart);
    stage.on("stagemouseup", dragEnd);

    function dragStart(event) {
      stage.addChild(selection).set({x:event.stageX, y:event.stageY});
      r.w = 0; r.h = 0;
      moveListener = stage.on("stagemousemove", drag);
    };

    function drag(event) {
      r.w = event.stageX - selection.x;
      r.h = event.stageY - selection.y;
    }

    function dragEnd(event) {
      stage.off("stagemousemove", moveListener);
    }

    function tick(event) {
      stage.update(event);
      sd.offset--;
    }

  }

}
