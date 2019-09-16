let attr_global;
let item_global;
let min_global;
let max_global;
let colors_global;
let old_Color = 0;
//update functions

function updatevis() {
    let colorDefault = $("input.setColorDefault").val();
    let highlightDefault = $("input.setHighlightColor").val();
    $(".partition-content").each(function () {
        if (this.__vis__) {
            if(colorDefault && colorDefault !="#006699"){
                this.__vis__.setColor(colorDefault);
                this.__vis__.getColor();
            }
            if(highlightDefault){
                this.__vis__.settings.highlightColor = highlightDefault;
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

    //refazendo a legenda continua

    $("div#legendColor").remove();
    d3.selectAll("div#legend").append("div").attr("id","legendColor").style("margin-top","10px")
        .append("svg").attr("class","rectInterpolate").attr("width","100%").attr("height","40px")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "100%")
        .attr("height", "40px")
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("fill", "url(#linear-gradient)");

    let svg = d3.selectAll("svg.rectInterpolate");
    let linearGradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color",$('#getColor1').val());

    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color",$('#getColor2').val());
    //update no setcolor
    $(".partition-content").each(function (i, index) {
        if ($(index).children("svg").length){
            this.__vis__.setColor(function (d, i) {
                if (d.data)
                    return c(d.data[item]);
                else
                    return c(d[item]);
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
                    if(d.data) {
                        return colors[attr.indexOf(d.data[item])];
                    }
                    else{
                        return colors[attr.indexOf(d[item])];
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
                        console.log("deu certo")
                        console.log(d)
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
                    console.log("deu certo")
                    return old_Color;
                }
                else if(!d.data && d[item]>=min_select && d[item]<=max_select){
                    console.log("deu certo")
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

//detalhes sobre demanda setar os itens
function details_on_demand(element,items) {
    let parentElement = element.parentElement;
    element.on("datamouseover",function(d,i){
        parentElement.__vis__.detail(d,i,items);


      });
}

//pegar os valores input
function get_values_details(){
    let check_details = [];
    $(".myCheckbox").each(function(i,item){
        if($(item).get(0).checked == true) {
            check_details.push($(item).val());
        }
    });
    return check_details;
}

// ativar detalhes sob demanda
function detail_on(element){
    //verifica os checkbox
    $(".myCheckbox").each(function(i,item){
        if($(item).get(0).checked == true) {
            let items = get_values_details();
            details_on_demand(element,item);
        }
    });

    $(".myCheckbox").change(function () {
    let items = get_values_details();
        return details_on_demand(element,items);
    });
}

function updateFilter_by_dimension(){
    const dimension_select = get_values_Filter_by_dimension();
        $(".partition-content").each(function () {
            if (this.__vis__) {
                this.__vis__.filterByDimension(dimension_select)
                this.__vis__.data(_data_);
                this.__vis__.redraw();
            }});
}

function get_values_Filter_by_dimension(){
    let check_details = [];
    $(".myCheckboxDimension").each(function(i,item){
        if($(item).get(0).checked == true) {
            check_details.push($(item).val());
        }
    });
    return check_details;
}




