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
 * Essa função  atualiza as visualização resenhado e inserindo os dados para todas as visaulizações na tela  **/
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
 * @description Essa função  atualiza o tamanho do items conforme os atributo a dimensão da base de dados selecionada
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
 * @description Essa função  atualiza as hieraquias conforme as dimensões adicionadas
 * @param {array.<string>} hie -  array com titulo das dimensões selecionadas da base de dados para montar a hieraquia.
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
 * @description função  para coloração em dimensões continuas
 * @param {array.<string>} attr -  array com titulo da  dimensão continua.
 * @param {number} min -  valor minimo da dimensão continua .
 * @param {number} max -  valor máximo da dimensão continua .

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
 * @description função  para coloração em dimensões categoricas
 * @param {string} attr - Titulo de dimensão selecionada para coloração.
 * @param {array.<string>} item -  array com titulo do valores da categoricos da dimensão attr.
 * @param {array.<string>} colors -  array com titulo das dimensões selecionadas da base de dados para montar a hieraquia.
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
 * @description função  de filtro de cor para valores categoricos
 * @param {string} attr - Titulo da dimensão categorica selecionada para filtro.
 * @param {string} select_item - attributo da dimensão selecionado para o filtro
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
 * @description função  de filtro de cor para valores continuos
 * @param {string} attr - Titulo da dimensão categorica selecionada para filtro.
 * @param {number} min - valor minimo do atributo
 * @param {number} max - valor maximo do atributo
 * @param {number} min_select - limite minimo para filtro
 * @param {number} max_select - limite maximo para filtro

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




