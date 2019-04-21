const { exec } = require('child_process');
const fs = require('fs');
//let ipc = require('electron').ipcRenderer;
let vis = require("@labvis-ufpa/vistechlib");
let d3 = require('d3');
let DataPreparation = require("./models/DataPreparation.js");


let _data_;
let data_prep;
let defautColor =["#006699","#24d068","#C53A10","#ff27ac",
  "#DBE70D","#08821e","#1135b2","#ff7043",
  "#78909c","#ECEDF0","#4D8000","#B33300",
  "#CC80CC","#66664D","#991AFF","#E666FF",
  "#4DB3FF","#1AB399","#E666B3","#33991A",
  "#CC9999","#B3B31A","#00E680","#4D8066",
  "#809980","#E6FF80","#1AFF33","#999933"];
let addVis
  = (visName, parentElement) => {
  let pc = new vis[visName](parentElement);

  pc
      .on("datacanvasmousedown",function(d){
          console.log(d,this);
          pc.removeSelect();
          let s = new vis.selection.LineSelection(0,0,d.innerX,d.innerY);
          pc.overlay.selectAll("line").remove();
          let selSVGElem = s.getSVGElement();
          selSVGElem.classList.add("svgSelectionElement");
          pc.overlay.node().appendChild(s.getSVGElement());
          let selected = pc.select(s);
          console.log(selected);
      })
    .on("highlightstart",function(d,i){
      $(".partition-content").each(function(){
        if(this.__vis__ && this.__vis__ !== pc){
          this.__vis__.highlight(d,i);
        }
      });
    })
    .on("highlightend",function(d,i){
      $(".partition-content").each(function(){
        if(this.__vis__ && this.__vis__ !== pc){
          this.__vis__.removeHighlight(d,i);
        }
      });
    })
    .on("datamouseover",function(d,i){
      pc.highlight(d,i);
      detail_on(pc);

    })
    .on("datamouseout",function(d,i){
      pc.removeHighlight(d,i);
    })
    .on("dataclick",function(d,i){
      $(".partition-content").each(function(){
        if(this.__vis__){
          console.log("clicou", d, i);
          let elem = this.__vis__.getHighlightElement(i);
          // d3.select(elem).selectAll(".lineHighlight").style("stroke", "limegreen");
          this.__vis__.annotate(elem);

        }
      });
    });


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
        g.attr("transform", d3.event.transform)
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
  // let color = d3.scale.category10();
  // pc.settings.color = (d) =>{ return color(d["bar_size"])};
};

ipc.on('add-vis', function(event, arg){
  addVis(arg, $(".partition-content").get(0))
});

ipc.on('file-data',function (event,data) {
  _data_ = data;
  clean_menus();
  updatevis();
});
ipc.on('change-datasample', function(event, data){
  _data_ = data;
  clean_menus();
  updatevis();

});

ipc.on('cl', function(event, arg){
  console.log("from_main: ", arg);
});