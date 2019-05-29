module.exports = class Interaction_Chosen {
  constructor(element) {
    this.element = element;
    this.type = "";

  }

  setType(type){
      this.type = type;


  }

  chosen(type,d,i) {
    switch (this.type) {
      case "highlighted":
        this.strategy = new HighlightStategy(this.element, d, i);
        break
      case "Detail on Demand":
        this.strategy = new DetaionsOnStrategy(this.element, d, i);
        break
      case "Zoom":
        // this.strategy = new ConcreteStrategyB()
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
  constructor(element,d,i) {
    super()
    element.highlight(d,i);
    console.log('ConcreteStrategyA created')
  }

  AlgorithmInterface (){
    console.log('ConcreteStrategyA algorithm')
  }
}

class DetaionsOnStrategy extends Strategy{
  constructor(element) {
    super()
    detail_on(element);
    console.log('ConcreteStrategyB created');
  }

  AlgorithmInterface (){
    console.log('ConcreteStrategyB algorithm')
  }
}
