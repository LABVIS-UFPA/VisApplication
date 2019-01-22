let attr_global;
let item_global;
let min_global;
let max_global;
let colors_global;
let old_Color = 0;
//update functions
function updatevis() {
  let colorDefaul = $("input.setColorDefault").val();
  let highlightDefaul = $("input.setHighlightColor").val();

  $(".partition-content").each(function () {
    if (this.__vis__) {
      if(colorDefaul && colorDefaul !="#006699"){
        this.__vis__.setColor(colorDefaul);
        this.__vis__.getColor();
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
  attr_global = attr;
  item_global = item;
  min_global = min;
  max_global = max;
  let c = d3.scaleLinear()
      .domain([min,max])
      .range([color1,color2]);
  $(".partition-content").each(function (i, index) {
    if ($(index).children("svg").length){
      this.__vis__.setColor(function (d, i) {
        if (d.data[item])
          return c(d.data[item]);
        if(d[item])
          return c(d[item]);
        else{
          return "grey";
        }
      });
      this.__vis__.redraw();
      old_Color = this.__vis__.getColor();
    }
  });
}

//categorical color
function updateCategoricalColor(attr, item, colors) {
  attr_global = attr;
  item_global = item;
  colors_global = colors;
  $(".partition-content").each(function () {
    $(".partition-content").each(function (i,index) {
      if($(index).children("svg").length){
        this.__vis__.setColor(function (d,i) {
          if(d.data[item]) {
            return colors[attr.indexOf(d.data[item])];
          }
          if(d[item]){
            return colors[attr.indexOf(d[item])];
          }else{
            return "grey";
          }

        });
        this.__vis__.redraw();
        old_Color = this.__vis__.getColor();
      }
    });
  });
};

function filterCategoricalValues(attr,item_name, item_value) {
  if($("input#getColor1").length){
    updateColorContinues(attr_global,item_global,min_global,max_global);
  }else{
    updateCategoricalColor(attr_global,item_global,colors_global);
  }
  $(".partition-content").each(function () {
    $(".partition-content").each(function (i,index) {
      if($(index).children("svg").length){
        this.__vis__.setColor(function (d,i) {
          if(d.data && d.data[item_name] != item_value){
            return "grey";
          }else if(!d.data && d[item_name] != item_value) {
            return "grey";
          }else{
            return old_Color;
          }
        });
        this.__vis__.redraw();
      }
    });
  });
};

function filterColorContinues(item,min,max,min_select,max_select){
  if($("input#getColor1").length){
    updateColorContinues(attr_global,item_global,min_global,max_global);
  }else{
    updateCategoricalColor(attr_global,item_global,colors_global);
  }
  $(".partition-content").each(function (i, index) {
    if ($(index).children("svg").length){
      this.__vis__.setColor(function (d, i) {
        if(d.data && d.data[item]>=min_select && d.data[item]<=max_select) {
          return old_Color;
        }
        else if(!d.data && d[item]>=min_select && d[item]<=max_select){
          return old_Color;
        }
        else{
          return "grey";
        }
      });
      this.__vis__.redraw();
    }
  });
}