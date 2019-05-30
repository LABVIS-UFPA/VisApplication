module.exports = class Interaction_Chosen {
  constructor() {
    this.element;
    this.type;

  }

  setElemt(elem){
    this.element = elem;
  }

  setType(type){
    this.type = type;
  }

  selectInteraction(type) {
    this.setType(type);
    this.chosen();
  }

  chosen(d,i) {
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
        // this.strategy = new ConcreteStrategyB()
        break
      case "drilldown":
        // this.strategy = new ConcreteStrategyB()
        break
      case "Selection by attribute":
        // this.strategy = new ConcreteStrategyB()
        break
      case "filter":
        // this.strategy = new ConcreteStrategyB()
        break
      default:
        // this.strategy = new HighlightStategy(element,d,i);
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

    element.on("datamouseover",function(d,i){
      $(".partition-content").each(function(){
        if(this.__vis__){
          console.log("clicou", d, i);
          let elem = this.__vis__.getHighlightElement(i);
          this.__vis__.highlight(d,i);

        }
      });
    });
    console.log('StrategyA highlight created')
  }

}

class DetaionsOnStrategy extends Strategy{
  constructor(element) {
    super()
    detail_on(element);
    console.log(' DetaionsOnStrategy created');
  }

}

class ZoomOnStrategy extends Strategy{
  constructor(element) {
    super()
    layer(true);

    $(".partition-content").each(function(){
      if(this.__vis__){
        let elem = this.__vis__;
        console.log("element",elem);

        let g = d3.selectAll("svg")
        d3.selectAll("svg").call(d3.zoom()
            .scaleExtent([1, 5])
            .on("zoom", zoomed))
            .attr("transform", (d)=>{return "translate("+0+","+0+")";});

        function zoomed() {
          g.attr("transform", d3.event.transform);
          g.translate(d3.event.transform.x, d3.event.transform.y);
          // g.scale(zoom.transform, d3.zoomIdentity);

          // g.save();
          // g.clearRect(0, 0, width, height);
          // drawPoints();
          // g.restore();

        }

        //
      }
    });


    console.log(' DetaionsOnStrategy created');
  }

}

