let _ = require('underscore');


module.exports = class DataPreparation{
  constructor(data) {
    this.data = data;
    this.data_keys =_.keys(this.data[0]);
    this.data_values = [];
    this.limit_values = [];

    this.values();
    this.data_min_and_max();
  }

  getKeys(){
    return this.data_keys;
  }

  getValues(){
    return this.data_values;
  }

  //values of min and max
  getLimit(){
    return this.limit_values;

  }


  values(){
    for (let i = 0; i <this.data_keys.length; i++) {
      let values =_.pluck(this.data,this.data_keys[i]);
      values = _.uniq(values);
      // console.log(values);
      this.data_values.push(values);
    }
    return this.data_values;
  }

  data_min_and_max(){
    // console.log(this.data_keys);
    for (let i = 0; i <this.data_values.length; i++) {
      if(!isNaN(this.data_values[i][0])){
        this.limit_values.push(this.data_keys[i],_.min(this.data_values[i]),_.max(this.data_values[i]));
      }
    }
    return this.limit_values;
  }

}

