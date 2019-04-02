class Interaction_Chosen {
  constructor(type,visualization){
    switch(type) {
      case "highlight":
        this.strategy = new HighlightStategy()
        break
      case "detail_on_demand":
        this.strategy = new DetaionsOnStrategy()
        break
      case "zoom":
        // this.strategy = new ConcreteStrategyB()
        break
      case "drilldown":
        // this.strategy = new ConcreteStrategyB()
        break
      case "selection":
        // this.strategy = new ConcreteStrategyB()
        break
      case "filter":
        // this.strategy = new ConcreteStrategyB()
        break
      default:
        this.strategy = new ConcreteStrategyA()
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
  constructor() {
    super()
    console.log('ConcreteStrategyA created')
  }

  AlgorithmInterface (){
    console.log('ConcreteStrategyA algorithm')
  }
}

class DetaionsOnStrategy extends Strategy{
  constructor() {
    super()
    console.log('ConcreteStrategyB created')
  }

  AlgorithmInterface (){
    console.log('ConcreteStrategyB algorithm')
  }
}
