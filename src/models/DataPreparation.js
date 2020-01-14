/**
 * Class Class Data preparation and processing class for later use.can return keys, arrays, minimum and maximum as needed for application
 * @param {object} data - Selected database.
 */

class DataPreparation{
  constructor(data) {
    this.data = data;
    this.data_keys =Object.keys(this.data[0]);
    this.data_values = [];
    this.limit_values = [];
    this.numeric_values = [];
    this.categorical_values = [];
    this.values();
    this.data_min_and_max();
    this.setNumeric_values();
    this.setCategorical_values();
  }

  /**
   * Get the keys of columns.
   * @return {string} the key values ​​of all columns.
   */
  getKeys(){
    return this.data_keys;
  }

  /**
   * set the values keys of columns.
   * @return {string} the key values ​​of all columns.
   */
  getValues(){
    return this.data_values;
  }

  /**
   * Get the column limit in the array where the minimum value **array[0]** and maximum value **array[1]**
   * @return {array<number>} the minimum and maximum limit values ​​of each column.
   */

  getLimit(){
    return this.limit_values;

  }

  values(){
    for (let i = 0; i <this.data_keys.length; i++) {

      let values =this.data.map(value=>value[this.data_keys[i]]);
      values = [...new Set(values)];
      this.data_values.push(values);
    }
    return this.data_values;
  }

  data_min_and_max(){
    // console.log(this.data_keys);
    for (let i = 0; i <this.data_values.length; i++) {
      if(!isNaN(this.data_values[i][0])){
        this.limit_values.push(
            this.data_keys[i],
            Math.min.apply(null,this.data_values[i]),
            Math.max.apply(null,this.data_values[i]));
      }
    }
    return this.limit_values;
  }

  setCategorical_values(){
    for (let i = 0; i < this.data_keys.length ; i++) {
      if(isNaN(this.data_values[i][0]) || (!isNaN(this.data_values[i][0]) && this.data_values.length<=10)){
       this.categorical_values.push(this.data_keys[i]);
      }
    }
  }


  /**
   * Get Categorical values of database.
   * @return {array<string>} The attribute of of each column in the dataset.
   */

  getCategorical_values(){
    return this.categorical_values;
  }


  setNumeric_values(){
    for (let i = 0; i < this.data_keys.length ; i++) {
      if(!isNaN(this.data_values[i][0])){
        this.numeric_values.push(this.data_keys[i]);
      }
    }
  }

  /**
   * Get numeric values of database.
   * @return {array<number>} The non-repeating values ​​of each dataset column.
   */
  getNumeric_values(){
    return this.numeric_values;
  }

}

