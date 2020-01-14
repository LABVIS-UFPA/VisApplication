let attr_global;
let item_global;
let min_global;
let max_global;
let colors_global;
let old_Color = 0;
let oldColorMin;
let oldColorMax;

//update functions
// /** @module visualization */

/**
 * This function redraws all screen views, enters data, and redraws **/
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
/**
 * @description This function updates the size of items according to the attributes of the selected database dimension, works in hierarchical views.
 * @param {string} size - The title of dimesion chosen size.
 *
 * */
function updateSize(size) {
    $(".partition-content").each(function () {
        if (this.__vis__) {
            this.__vis__.setSize(size);
            this.__vis__.data(_data_);
            this.__vis__.redraw();
        }
    });
}


/**
 * @description This function creates hierarchies as dimensions are added to hierarchical views, they must be passed the title of the selected dimensions.
 * @param {array.<string>} hie -  array with title of the selected dimensions of the database to mount the hierarchy.
 *
 * */
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

/**
 * @description continuous color coloring function by tweening two colors, this function has effect on all screen views
 * @param {array.<string>} attr -  array with continuous dimension title.
 * @param {number} min -  minimum value of the dimension continues.
 * @param {number} max -  maximum value of the continuous dimension.

 *
 * */

function updateColorContinues(attr,min,max,colorMin,colorMax){
    // attr_global = attr;
    item_global = attr;
    min_global = min;
    max_global = max;
    oldColorMin = colorMin;
    oldColorMax = colorMax
    let c = d3.scaleLinear()
        .domain([min,max])
        .range([colorMin,colorMax]);

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
                    return c(d.data[attr]);
                else
                    return c(d[attr]);
            });
            this.__vis__.redraw();
            old_Color = this.__vis__.getColor();
        }
    });
}

//categorical color
/**
 * @description coloring function in categorical dimensions, this function has effect on all views
 * @param {string} attr - Dimension title selected for coloring.
 * @param {array.<string>} item -  title array of the attr category dimension values.
 * @param {array.<string>} colors - array with title of the selected dimensions of the database to mount the hierarchy.
 *
 * */
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

/**
 * @description Color filter function for categorical values, Color values are preserved. This function, once applied, has an effect on all views.
 * @param {string} attr - Title of the selected categorical dimension to filter.
 * @param {string} select_item - dimension attribute selected for filter
 * */

function filterCategoricalValues(attr, select_item) {
    //verificar a existencia dos inputs
    if($("input#getColor1").length){
        updateColorContinues(item_global,min_global,max_global,oldColorMin,oldColorMax);
    }else{
        updateCategoricalColor(attr_global,item_global,colors_global);
    }

    $(".partition-content").each(function () {
        $(".partition-content").each(function (i,index) {
            if($(index).children("svg").length){
                this.__vis__.setColor(function (d,i) {
                    if(d.data && d.data[item_name] != select_item){
                        return "grey";
                    }else if(!d.data && d[item_name] != select_item) {
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
/**
 * @description color filter function for continuous values, can pass the color filter range, and prescribe the visualization colors, this function has effect on all screen views
 * @param {string} attr - Title of the selected categorical dimension to filter.
 * @param {number} min - minimum attribute value
 * @param {number} max - attribute maximum value
 * @param {number} min_select - minimum filter limit
 * @param {number} max_select - maximum filter limit

 * */

function filterColorContinues(attr,min,max,min_select,max_select){
    if($("input#getColor1").length){
        updateColorContinues(item_global,min_global,max_global,oldColorMin,oldColorMax);
    }else{
        updateCategoricalColor(attr_global,item_global,colors_global);
    }
    $(".partition-content").each(function (i, index) {
        if ($(index).children("svg").length){
            this.__vis__.setColor(function (d, i) {
                if(d.data && d.data[attr]>=min_select && d.data[attr]<=max_select) {
                    console.log("deu certo")
                    return old_Color;
                }
                else if(!d.data && d[attr]>=min_select && d[attr]<=max_select){
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




