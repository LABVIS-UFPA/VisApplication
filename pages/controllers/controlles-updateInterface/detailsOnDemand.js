const details= () => {
  data_prep = new DataPreparation(_data_);
  const dimension = data_prep.data_keys;

  for (let i = 0; i < dimension.length; i++) {
      $("div.menu-details")
      .append($("<input/>")
        .attr("class","myCheckbox")
        .attr("type","checkbox")
        .attr("value",dimension[i]))
      .append($("<label/>")
        .css({
          "text-align": "center",
          "display": "initial",
          "font-size": "13px"})
        .text(dimension[i]).append($("<br/>")));
  }

};
