//update functions
function updatevis() {
  let colorDefaul = $("input.setColorDefault").val();
  let highlightDefaul = $("input.setHighlightColor").val();

  $(".partition-content").each(function () {
    if (this.__vis__) {
      if(colorDefaul && colorDefaul !="#006699"){
        this.__vis__.setColor(colorDefaul);
      }
      if(highlightDefaul){
        this.__vis__.settings.highlightColor = highlightDefaul;
      }
      this.__vis__.data(_data_);
      this.__vis__.redraw();
    }
  });
}

//size items treeamp
function updateSize() {
  let size = $("select.selectSize").val();
  $(".partition-content").each(function () {
    if (this.__vis__) {
      this.__vis__.setSize(size);
      this.__vis__.data(_data_);
      this.__vis__.redraw();
    }
  });
}

function updateHie(hie){
  $(".partition-content").each(function () {
    if (this.__vis__) {
      if(hie.length){
        this.__vis__.hierarchy(hie);
      }
      else{
        this.__vis__.hierarchy();
      }
      this.__vis__.data(_data_);
      this.__vis__.redraw();
    }
  });
}

function updateColorContinues(attr,item,min,max){
  let color1 = $("#getColor1").val();
  let color2 = $("#getColor2").val();
  console.log(min,max);
  let c = d3.scaleLinear()
    .domain([min,max])
    .range([color1,color2]);
  $(".partition-content").each(function (i, index) {
    if ($(index).children("svg").length){
      this.__vis__.setColor(function (d, i) {
        if (d.data)
          return c(d.data[item]);
        else
          return c(d[item]);
      });
      this.__vis__.redraw();
    }
  });
}

function filterColorContinues(item,min,max,min_select,max_select){
  let color1 = "#fff"
  let color2 = "#006699";
  console.log(min,max);
  let c = d3.scaleLinear()
    .domain([min,max])
    .range([color1,color2]);
  $(".partition-content").each(function (i, index) {
    if ($(index).children("svg").length){
      this.__vis__.setColor(function (d, i) {
        if(d.data && d.data[item]>=min_select && d.data[item]<=max_select) {
          return c(d.data[item]);
        }
        else if(!d.data && d[item]>=min_select && d[item]<=max_select){
        return c(d[item]);
        }
        else{
          return "grey";
        }
      });
      this.__vis__.redraw();
    }
  });
}

function updateColor(attr,item,colors) {
  $(".partition-content").each(function () {
    $(".partition-content").each(function (i,index) {
      if($(index).children("svg").length){
        this.__vis__.setColor(function (d,i) {
          if(d.data)
            return colors[attr.indexOf(d.data[item])];
          else
            return colors[attr.indexOf(d[item])];
        });
        this.__vis__.redraw();
      }
    });
  });
};


function filterCategoricalValues(attr,item_name, item_value) {
  $(".partition-content").each(function () {
    $(".partition-content").each(function (i,index) {
      if($(index).children("svg").length){
        this.__vis__.setColor(function (d,i) {
          if(d.data && d.data[item_name] == item_value){
            return defautColor[attr.indexOf(d.data[item_name])];
          }
          else if(!d.data && d[item_name] == item_value) {
            return defautColor[attr.indexOf(d[item_name])];
          }
          else{
            return "grey";
          }
        });
        this.__vis__.redraw();
      }
    });
  });
};