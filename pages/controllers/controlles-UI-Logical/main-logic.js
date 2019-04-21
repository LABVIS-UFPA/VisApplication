
let ipc = require('electron').ipcRenderer;

$(document).ready(function() {

  ipc.send("document-ready");
  let $body = $("body");
  let partitionLayout = new PartitionLayout($body.get(0));

  $(window).resize(function(){
    $(".partition-content").each(function(){
      if(this.__vis__)
        this.__vis__.resize();
    });
  });

  $body.on("layout:resize", ".partition-node", function(e){
    let content = $(this).children(".partition-content").get(0);

    if(content && content.__vis__){
      content.__vis__.resize();
    }
  });
  $body.on("layout:created", ".partition-node", function(e){

    console.log("layout:created", this);
    if(this !== e.target)
      return;

    if($(this).children(".partition-content").children().is("button.btn.btn-large.btn-positive")) {
      $(this).children(".partition-content").children().attr("data-nodeid", $(this).attr("id"));
      return;
    }else
    if($(this).children(".partition-content").children().is("#menu_settings")){

      return
    }
    //verificar para abrir apenas um menu de settings
    $(".partition-content").each(function(i,item){
      $(item).children(".AddSettings").remove();
    });

    if(!$("#menu_settings").length) {
      $(this).children(".partition-content").append($("<button/>")
        .text(" view settings ")
        .addClass("AddSettings")
        .addClass("btn btn-large btn-positive")
        .addClass("icon icon-cog")
        .attr("data-nodeid", $(this).attr("id"))
        .css({ "float": "right" }));

      $.contextMenu({
        selector: '.AddSettings',
        trigger: 'left',
        callback: function (key) {
          if (_data_) {
            let content = $("#" + $(this).attr("data-nodeid")).children(".partition-content");
            // let content = $("#"+$(this).attr("data-nodeVis")).children(".partition-content");
            let partition = $(this).parents('.partition-node').attr('id');
            content.empty();
            addMenu(content);
            ipc.send('update-sampledata', {});
            updateInteface();
          } else {
            alert("You have to link data first");
            ipc.send('not-data');
          }
        },
        items: {
          "menu settings visualization": { name: "settings visualization" }
        }

      });

    }
    $(this).children(".partition-content").append($("<button/>")
      .text("Add Visualization")
      .addClass("btn btn-large btn-positive")
      .attr("data-nodeid", $(this).attr("id"))
      .css({"float": "right"}));

    $.contextMenu({
      selector: '.btn.btn-large.btn-positive',
      trigger: 'left',
      callback: function (key) {
        if(_data_){
          let content = $("#"+$(this).attr("data-nodeid")).children(".partition-content");
          content.empty();
          addVis(key, content.get(0));
          ipc.send('update-sampledata', {});
          updatevis();
        }else{
          alert("You have to link data first");
          ipc.send('not-data');
        }
      },
      items: {
        "ParallelCoordinates": {name: "Parallel Coordinates"},
        "ParallelBundling": {name: "Bundled Parallel Coordinates"},
        "ScatterplotMatrix": {name: "Scatter Plot"},
        "BeeswarmPlot": {name: "Beeswarm Plot"},
        "Treemap": {name: "Treemap"} ,
        "Histogram": {name: "Histogram"},
        "Sunburst": {name: "Sunburst"},
        "BarChart": {name: "Bar Chart"}
      }
    });

    $(this).children(".partition-content").append($("<button/>")
      .text("Download Visualizations")
      .addClass("btn btn-large btn-default")
      .attr("data-nodeid", $(this).attr("id"))
      .css({"float": "right"})
      .click(() => {
        let viss = ["ParallelCoordinates", "ScatterplotMatrix", "BeeswarmPlot", "Histogram", "BarChart"];
        for(let v of viss){
          let element = document.createElement("div");
          $(element).css({
            "position":"fixed",
            "width":"801px",
            "height":"601px",
            "opacity":"0"
          });
          document.body.appendChild(element);

          let pc = new vis[v](element, {
            size_type:"absolute",
            width: "800px",
            height: "600px"
          });
          pc.data(_data_);
          pc.redraw();
          let file = new Blob([element.innerHTML], {type: "image/svg+xml"});
          let a = document.createElement("a");
          let url = URL.createObjectURL(file);
          a.href = url;
          a.download = v+".svg";
          document.body.appendChild(a);
          //a.click();

          let locationFile = __dirname.replace('pages', 'svgExported\\');

          fs.writeFile(locationFile + v + ".svg", element.innerHTML, function(err) {
            if(err) {
              return console.log(err);
            }
            console.log("The file was saved!");
          });

          exec('"C:\\Program Files\\Inkscape\\inkscape.exe" ' + locationFile + v+'.svg' + ' --export-area-page --without-gui --export-pdf=' + locationFile + v+'.pdf', (err, stdout, stderr) => {
            if (err) {
              console.log(err);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
          });

          setTimeout(function() {
            document.body.removeChild(a);
            document.body.removeChild(element);
            window.URL.revokeObjectURL(url);
          }, 0);
        }
      }));
  });
});
