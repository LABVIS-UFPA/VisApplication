/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class DynamicPartition{

    constructor (root){
        this.root = root;
        this.partitionObj = this.root;
        this.start();
    }

    /**
     * @description gerar id randomicamente
     * @return {int} numero da id
     * */
    random_id() {
        return Math.floor(Math.random() * 1000);
    }

    /**
     * @description add linhas de divisão con drag move
     * @param{object} selection - seleção html para criação das partições
     * */
    addDragableLines(selection) {
        selection.append($("<div/>").addClass("partition-line").addClass("partition-ori-left"))
          .append($("<div/>").addClass("partition-line").addClass("partition-ori-right"))
          .append($("<div/>").addClass("partition-line").addClass("partition-ori-top"))
          .append($("<div/>").addClass("partition-line").addClass("partition-ori-bottom"));
    }


    /**
     * @description add partition content
     * @param {object} selection - html selection jquery
     * */
    addContent(selection) {
        selection.append($("<div/>").addClass("partition-content"))
    }

    addCustomNode(node_data,current_dir = node_data.dir, brother,position_top,position_left) {

        let node_selection = !($("#"+node_data.id)).length? this.$partition_root:  $("#"+node_data.id);


        let id = node_data.id + "-" + this.random_id();
        let new_node = { id: id, divisions: [], children: [], parent: node_data, left: 0, top: 0, right: 0, bottom: 0 };
        if (brother) {
            new_node.left = brother.left;
            new_node.top = brother.top;
            new_node.right = brother.right;
            new_node.bottom = brother.bottom;
        }
        node_data.children.push(new_node);

        let html_node = $("<div/>")
            .addClass("partition-node")
            .attr("id", id)

        //linha de seleção e conteudo
        this.addDragableLines(html_node);
        this.addContent(html_node);
        node_selection.append(html_node);

        let divisor, divisor_node;
        //Se tiver mais de um filho tem que colocar uma divisória
        if (node_data.children.length > 1 && current_dir) {

            divisor = $("<div/>").addClass("partition-divisor partition-dir-" + current_dir).css({"background-color":"blue"})
                .append($("<div/>").addClass("partition-divisor-line").css({"background-color":"blue"}));
            node_selection.append(divisor);

            divisor_node = { div_element: divisor, value: 0, dir: current_dir };
            divisor.get(0).__node__ = divisor_node;
            node_data.divisions.push(divisor_node);
        }


        if (node_data.dir) {
            new_node.dir = node_data.dir === "ver" ? "hor" : "ver";
        }

        html_node.get(0).__node__ = new_node;

        this.partitionObj.onnodecreated(new_node, html_node.get(0));

        let node_position = html_node.get(0)
        let line_position = divisor_node.div_element.get(0);

        console.log("brother",brother);
        let w = window.innerWidth;
        let h = window.innerHeight;

        if(current_dir ==="hor"){
            brother.css({"height":position_top,"width":w,"top":0})
        }
        if(current_dir==="ver"){
            brother.css({"width":position_left})
        }
        $(node_position).css({"width":w - position_left,"height":h - position_top,"left":position_left,"top":position_top})

        $(line_position).css({"left":position_left,"top":position_top})
        console.log(node_position);
        console.log(line_position);

        setTimeout(function () { html_node.trigger("layout:created"); }, 200);
        return [new_node, html_node, divisor_node];

    }


    /**
     * @description add node na view html
     * @param {object} node_data - dados associados a variavel _node_
     * @param {string} current_dir - poionamento para criar filhos ou irmãos ao elemento  "ver" : "hor"
     * @param {*} brother  -elemento pai para verificações
     */
    addNode(node_data,current_dir = node_data.dir, brother,positio_top,position_left) {
        console.log("------------------")
        console.log(node_data.dir);
        console.log(node_data);

        let node_selection = !($("#"+node_data.id)).length? this.$partition_root:  $("#"+node_data.id);

        if(!brother)
            $("#"+node_data.id).parent;

        console.log(current_dir);
        console.log("brother",brother);

        let id = node_data.id + "-" + this.random_id();
        let new_node = { id: id, divisions: [], children: [], parent: node_data, left: 0, top: 0, right: 0, bottom: 0 };
        if (brother) {
            new_node.left = brother.left;
            new_node.top = brother.top;
            new_node.right = brother.right;
            new_node.bottom = brother.bottom;
        }
        node_data.children.push(new_node);

        let html_node = $("<div/>")
          .addClass("partition-node")
          .attr("id", id)


        //linha de seleção e conteudo
        this.addDragableLines(html_node);
        this.addContent(html_node);
        node_selection.append(html_node);

        let divisor, divisor_node;
        //Se tiver mais de um filho tem que colocar uma divisória
        if (node_data.children.length > 1 && current_dir) {

            divisor = $("<div/>").addClass("partition-divisor partition-dir-" + current_dir).css({"background-color":"blue"})
              .append($("<div/>").addClass("partition-divisor-line").css({"background-color":"blue"}));
            node_selection.append(divisor);

            divisor_node = { div_element: divisor, value: 0, dir: current_dir };
            divisor.get(0).__node__ = divisor_node;
            node_data.divisions.push(divisor_node);
        }


        if (node_data.dir) {
            new_node.dir = node_data.dir === "ver" ? "hor" : "ver";
        }

        html_node.get(0).__node__ = new_node;

        this.partitionObj.onnodecreated(new_node, html_node.get(0));

        setTimeout(function () { html_node.trigger("layout:created"); }, 200);


        return [new_node, html_node, divisor_node];

    }

    addPartition(){
        //this.addNode()
    }


    /**
     * @description redesenha elementos no html
     * @param{object} node - no partição html selecionada
     * */
    redraw(node) {
        //Posiciona os divisores
        let $_node = $("#" + node.id);
        let leftOrTop = node.dir === "ver" ? "left" : "top";
        let wOrH = node.dir === "ver" ? "width" : "height";
        for (let divisor of node.divisions) {
            divisor.div_element.css(leftOrTop, ($_node[wOrH]() * divisor.value) - 10);
        }

        if (node.parent) {

            let $_parent = $("#" + node.parent.id);

            // posicina e dá tamanho para as divs em si
            $_node.css({
                left: $_parent.width() * node.left,
                right: $_parent.width() * node.right,
                top: $_parent.height() * node.top,
                bottom: $_parent.height() * node.bottom
            });

        }

        for (var i = 0; i < node.children.length; i++) {
            this.redraw(node.children[i]);
        }
        console.log("node agora vai isso:",this.nodes)

    }

    resize(){
        $(window).resize( ()=> {
            this.redraw(this.nodes);
        });

        //flag press ctrl
        let ctrl_press = false;
        $(document).on("keydown", function (e) {
            // if(e)
            //CTRL
            if (e.keyCode === 17 && !ctrl_press) {
                ctrl_press = true
                $(".partition-line").css("display", "block");
            }
        })
          .on("keyup", function (e) {
              //CTRL
              if (e.keyCode === 17) {
                  ctrl_press = false;
                  $(".partition-line").css('display', 'none');
              }
          });
    }

    /**
     * @description verifica  se as partiçções são irmão/colunas
     *
     * */
    isBrother(a, b) {
        return Math.abs(a + b - 1) < 0.00001;
    }

    /***
     * @description remove partições não visiveis
     * @param{object} node - no partição html selecionada
     */
    remove_unvisible(node) {
        if (node.left === 1 || node.right === 1 || node.top === 1 || node.bottom === 1
          || this.isBrother(node.top, node.bottom) || this.isBrother(node.left, node.right)) {

            //remove ou merge os divisores que se referem a ele
            this.divisions = [];
            var index = 0, i = 0;
            for (let d of node.parent.divisions) {
                if (d.node1 === node || d.node2 === node) {
                    this.divisions.push(d);
                    index = i;
                }
                i++;
            }
            if (this.divisions.length === 1) {
                $(this.divisions[0].div_element).remove();
            } else {
                if (this.divisions[0].node1 === this.divisions[1].node1) {
                    this.divisions[0].node1 = this.divisions[1].node2;
                } else if (this.divisions[0].node1 === this.divisions[1].node2) {
                    this.divisions[0].node1 = this.divisions[1].node1;
                } else if (this.divisions[0].node2 === this.divisions[1].node1) {
                    this.divisions[0].node2 = this.divisions[1].node2;
                } else if (this.divisions[0].node2 === this.divisions[1].node2) {
                    this.divisions[0].node2 = this.divisions[1].node1;
                }
                this.divisions[1].div_element.remove();
            }
            node.parent.divisions.splice(index, 1);
            console.log("deveria remover!");
            //remove o elemento em si.
            $("#" + node.id).remove();
            let position = -1;
            for (var i = 0; i < node.parent.children.length; i++)
                if (node.parent.children[i].id === node.id)
                    position = i;

            console.log(node.parent.children);
            if (position !== -1) {
                node.parent.children.splice(position, 1);
                return;
            }
            this.partitionObj.onnoderemoved(node);
        }

        for (i = 0; i < node.children.length; i++) {
            this.remove_unvisible(node.children[i]);
        }
    }

    /**
     * @description
     * @param node
     */
    fix(node) {
        if (node.parent && node.parent.children.length === 1 && node.parent.parent) {
            var current_node = $("#" + node.id);
            current_node.children().appendTo($("#" + node.parent.id).get(0));
            current_node.remove();
            node.parent.children = node.children;
            for (var i = 0; i < node.children.length; i++) {
                node.children[i].parent = node.parent;
            }
            node = node.parent;
        }

        for (var i = 0; i < node.children.length; i++) {
            this.fix(node.children[i]);
        }
    }

    /**
     * @description
     * @param class_name
     */
    getOriByClass(class_name) {
        return /partition-ori-(\w+)/g.exec(class_name)[1];
    }


    /**
    *
    * */

    isSame(a, b) {
        return Math.abs(a - b) < 0.00001;
    }

    /**
     * @description verifica se a partição esta dentro dos limites
     * */
    isInside(selection, x, y) {
        var posX = x - selection.offset().left;
        var posY = y - selection.offset().top;
        return (posX >= 0) && (posX <= selection.width()) && (posY >= 0) && (posY <= selection.height());
    }

    putInside(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }

    /**
     * @description remover higlith das linhas
     * @param {objecr} highlight seleção html para as linhas
     * */
    removeHighlight(highlight) {
        highlight.removeClass("partition-dir-ver");
        highlight.removeClass("partition-dir-hor");
        highlight.css({
            left: 0, right: 0, top: 0, bottom: 0
        });
        highlight.removeAttr("style");
        highlight.remove();
    }


    addPartitionNode(element){
    //<class="partition-node" id="partition-705-827" style="inset: 0px 0px 0px 381.258px;">
       let partitionNode = document.createElement("div")//.classList.add("partition-node");
       partitionNode.setAttribute("class","partition-node");
        partitionNode.setAttribute("class","partition-node");
        //
        //this.addNode();

    }

    /**
     * calculo de x e y w partições layout
     *
     */
    calculatePositions(e,left,top){
        if (this.target_border) {
            this.$partition_root.get(0).onmousemove = null;
            this.target.children(".partition-divisor").remove();
            var dev = 0;
            var brother_attr, target_attr, parent_attr;
            var parent_html = $("#" + this.selected_node.parent.id);

            //Remove todos os cursors erros.
            // parent_html.children().each(function(i, j){
            //     $(j).removeClass("partition-cursor-error");
            // });
            this.$partition_root.find("div.partition-node").not(this.target.get(0)).removeClass("partition-cursor-error");


            var border_dir = this.getOriByClass(this.target_border.attr("class"));

            this.removeHighlight(this.highlight_line_div);
            this.target_border = undefined;

            let rootOffset;
            let pageX ;
            let pageY;
            if(left){
                rootOffset = this.$partition_root.offset();
                pageX = this.putInside(left, rootOffset.left, rootOffset.left + this.$partition_root.width());
                pageY = this.putInside(top, rootOffset.top, rootOffset.top + this.$partition_root.height());
                console.log("root:"+rootOffset,"pageX:"+pageX,"pageY:"+pageY);

            }
            else if(top){
                rootOffset = this.$partition_root.offset();
                pageX = this.putInside(left, rootOffset.left, rootOffset.left + this.$partition_root.width());
                pageY = this.putInside(top, rootOffset.top, rootOffset.top + this.$partition_root.height());
                console.log("root:"+rootOffset,"pageX:"+pageX,"pageY:"+pageY);

            }
            else{
             rootOffset = this.$partition_root.offset();
             pageX = this.putInside(e.pageX, rootOffset.left, rootOffset.left + this.$partition_root.width());
             pageY = this.putInside(e.pageY, rootOffset.top, rootOffset.top + this.$partition_root.height());
             console.log("root:"+rootOffset,"pageX:"+pageX,"pageY:"+pageY);
            }


            //Adiciona ou Atualiza
            switch (border_dir) {
                case "left":
                    dev = pageX - parent_html.offset().left;
                    target_attr = "left";
                    brother_attr = "right";
                    parent_attr = "width";
                    break;
                case "top":
                    dev = pageY - parent_html.offset().top;
                    target_attr = "top";
                    brother_attr = "bottom";
                    parent_attr = "height";
                    break;
                case "right":
                    dev = pageX - parent_html.offset().left;
                    target_attr = "right";
                    brother_attr = "left";
                    parent_attr = "width";
                    break;
                case "bottom":
                    dev = pageY - parent_html.offset().top;
                    target_attr = "bottom";
                    brother_attr = "top";
                    parent_attr = "height";
                    break;
            }

            var brother;
            let target_position = parseFloat(this.target.css(target_attr)) / parent_html[parent_attr]();
            var current_dir = parent_attr === "width" ? "ver" : "hor";
            if (this.isInside(this.target, pageX, pageY)) {

                if (this.selected_node.parent.dir === current_dir) {
                    console.log("dir",this.selected_node.parent.dir,current_dir);


                    brother = this.addNode(this.selected_node.parent, current_dir, this.selected_node);
                    // console.log("caso1", selected_node.parent);
                    let division_changed;
                    for (let d of this.selected_node.parent.divisions) {
                        if (this.isBrother(d.value, target_position) || this.isSame(d.value, target_position)) {
                            division_changed = d;
                            console.log(d);
                        }
                    }
                    console.log(division_changed);
                    if (this.selected_node === division_changed.node1) {
                        division_changed.node1 = brother[0];
                    } else if (this.selected_node === division_changed.node2) {
                        division_changed.node2 = brother[0];
                    }

                    // brother[1].trigger("layout:created");

                } else if (this.selected_node.parent.dir) {
                    //Cria um novo target e brother e coloca dentro do target atual que vi o pai.
                    parent_html = $("#" + this.selected_node.id);
                    parent_html.children(".partition-line").remove();
                    //cria irmão e novo target
                    let newtarget = this.addNode(this.selected_node,  current_dir);
                    brother = this.addNode(this.selected_node,  current_dir);
                    //Atualiza o dir do novo pai
                    this.selected_node.dir = current_dir;
                    //troca tudo!
                    //                    target = $(newtarget[1]);
                    //TODO: um dia, quem sabe, alguém melhora isso, mas por hora ta assim mesmo.
                    $(newtarget[1]).children(".partition-content").remove();
                    parent_html.children(".partition-content")
                        .appendTo($(newtarget[1]).get(0));
                    parent_html.children(".partition-content").remove();
                    this.selected_node = newtarget[0];

                    // console.log("caso2", brother);
                    // brother[1].trigger("layout:created");
                    // newtarget[1].trigger("layout:created");

                } else {

                    brother = this.addNode(this.selected_node.parent, current_dir);
                    this.selected_node.parent.dir = current_dir;
                    // console.log("caso3", brother);
                    // brother[1].trigger("layout:created");
                }
            }


            //Criar função disso!
            //verificar se está dentro do irmão ou dentro dele mesmo.
            let invert = (target_attr === "left" || target_attr === "top");

            if (brother && (this.isInside(this.target, pageX, pageY) || this.isInside($(brother[1]), pageX, pageY))) {
                //Atualiza as posições
                let value = (parent_html[parent_attr]() - dev) / parent_html[parent_attr]();

                brother[0][brother_attr] = (invert ? value : 1 - value);
                this.selected_node[target_attr] = (invert ? 1 - value : value);

                //o brother[2] é o objeto responsável pela divisão entre o selected_node e o brother.
                //Atualiza o valor para a divisão
                brother[2].value = 1 - value;
                //DONE - quando puxa do meio tem ser o irmão do selected_node! Porra!
                //Porque ele abre um novo node no meios dos dois existentes
                brother[2].node1 = this.selected_node;
                brother[2].node2 = brother[0];

                this.remove_unvisible(this.nodes);
                this.fix(this.nodes);
                this.redraw(this.nodes);


                $("#" + this.selected_node.id).trigger("layout:resize");
                $("#" + brother[0].id).trigger("layout:resize");
            }


        } else if (this.divisor_target) {


            let node = this.divisor_target.get(0).__node__;
            let $parent = this.divisor_target.parent();
            // let parent_w = $parent.width(), parent_h = $parent.height();

            let $node1 = $("#" + node.node1.id), $node2 = $("#" + node.node2.id);

            // let min_left = Math.min(node.node1.left * parent_w, node.node2.left * parent_w);
            // let min_top = Math.min(node.node1.top * parent_h, node.node2.top * parent_h);
            let min_left = Math.min($node1.offset().left, $node2.offset().left);
            let min_top = Math.min($node1.offset().top, $node2.offset().top);


            let pageX = this.putInside(e.pageX, min_left, min_left
                + $node1.width() + $node2.width());
            let pageY = this.putInside(e.pageY, min_top, min_top +
                $node1.height() + $node2.height());

            console.log("min_top", min_top, "max", min_top + $node1.height() + $node2.height());

            this.removeHighlight(this.highlight_line_div);

            this.divisor_target.parent().get(0).onmousemove = undefined;

            this.divisor_target = undefined;

            let last_value = node.value;

            let ori1, ori2;
            if (node.dir === "ver") {
                node.value = (pageX - $parent.offset().left) / $parent.width();
                ori1 = "left";
                ori2 = "right";
            } else {
                node.value = (pageY - $parent.offset().top) / $parent.height();
                ori1 = "top";
                ori2 = "bottom";
            }

            if (this.isBrother(node.node1[ori2], last_value)) {
                node.node1[ori2] = 1 - node.value;
                node.node2[ori1] = node.value;
            } else if (this.isBrother(node.node1[ori1], last_value)) {
                node.node1[ori1] = 1 - node.value;
                node.node2[ori2] = node.value;
            } else if (this.isSame(node.node1[ori1], last_value)) {
                node.node1[ori1] = node.value;
                node.node2[ori2] = 1 - node.value;
            } else if (this.isSame(node.node1[ori2], last_value)) {
                node.node1[ori2] = node.value;
                node.node2[ori1] = 1 - node.value;
            }

            this.remove_unvisible(this.nodes);
            this.fix(this.nodes);
            this.redraw(this.nodes);
            //Chama o evento de resize nos nós.
            this.partitionObj.onnoderesized(node.node1, $node1);
            this.partitionObj.onnoderesized(node.node2, $node2);


            $node1.trigger("layout:resize", node.node1);
            $node2.trigger("layout:resize", node.node2);
            $node1.find(".partition-node").trigger("layout:resize");
            $node2.find(".partition-node").trigger("layout:resize");
        }

        console.log("fim calcule points ")

    }

    resizePartitionNode(e){

        let $node = $(e.target);
        console.log("target",e.target);

        while (!($node.attr("class")) || $node.attr("class").indexOf("partition-node") < 0) {
            $node = $node.parent();
        }
        //let $content = $node.children(".partition-content").children();

        //Se o nó não está atualmente selecionado, então ele selecionad
        let real_target = $node.get(0);
        if (this.partitionObj.selected_node !== real_target) {
            this.partitionObj.selected_node = real_target;
            this.partitionObj.onselectednode(real_target.__node__, real_target);
        }
        console.log("fim partition node")


    }

    //resize linha de divisão comear por aqui
    //e nessa função ou passa ou morre
    resizePartionDivisor(e,left, top){
        
        this.$target = $(e.target);

        if (this.$target.hasClass("partition-divisor-line"))
            this.$target = this.$target.parent();
        this.divisor_target = this.$target;

        let init_x = e.pageX;
        let init_y = e.pageY;

        if(left || top){
         init_x = left;
         init_y = top;
         console.log("aqui na função",init_x,init_y)
        }

        console.log("target", $(e.target));
        console.log("divisor x",init_x);
        console.log("divisor y",init_y);


        //Adiciona o Highlight no parent
        this.divisor_target.parent().append(this.highlight_line_div);
        this.highlight_line_div.addClass(this.$target.attr("class"));

        let dir = this.$target.get(0).__node__.dir;
        let init = (dir === "ver" ? init_x : init_y);
        let target_attr = (dir === "ver" ? "left" : "top");
        let xOrY = dir === "ver" ? "pageX" : "pageY";
        let last_position = parseFloat(this.$target.css(target_attr));

        this.highlight_line_div.css(target_attr, last_position);

        this.$target.parent().get(0).onmousemove =  (e2)=> {
            this.highlight_line_div.css(target_attr, last_position + e2[xOrY] - init);

            //                    highlight_line_div.css("");
        };

    console.log("fim divisor line")
    }

    resizePartitionLine(e,left,top){
        let init_x = e.pageX;
        let init_y = e.pageY;

        init_x = left;
        init_y = top;

        if(left){
            this.target_border = e;
        }else{
            this.target_border = $(e.target);
        }
        console.log("puta que pareiu1",$(this.target_border).get(0));

        this.target = this.target_border.parent();
        console.log("agora e de verdade",this.target);

        //adiciona a linha arrumada no outra linha criada
        this.target.append(this.highlight_line_div);

        this.selected_node = this.target.get(0).__node__;


        //var parent_html = $("#"+selected_node.parent.id);
        let target_attr, brother_attr;
        let xOrY;

        switch (this.getOriByClass(this.target_border.attr("class"))) {
            case "left":
                target_attr = "left";
                brother_attr = "right";
                xOrY = "pageX";
                this.highlight_line_div.addClass("partition-dir-ver");
                break;
            case "top":
                target_attr = "top";
                brother_attr = "bottom";
                xOrY = "pageY";
                this.highlight_line_div.addClass("partition-dir-hor");
                break;
            case "right":
                target_attr = "right";
                brother_attr = "left";
                xOrY = "pageX";
                this.highlight_line_div.addClass("partition-dir-ver");
                break;
            case "bottom":
                target_attr = "bottom";
                brother_attr = "top";
                xOrY = "pageY";
                this.highlight_line_div.addClass("partition-dir-hor");
                break;
        }


        // parent_html.children().each(function(i, j){
        //     if(j.__node__ && !isBrother(target.get(0).__node__[target_attr], j.__node__[brother_attr]) && target.get(0)!==j){
        //         $(j).addClass("partition-cursor-error");
        //     }
        // });
        // $partition_root.children
        // console.log(target.get(0));
        // console.log($partition_root.find("div.partition-node").not(target.get(0)));
        this.$partition_root.find("div.partition-node").not(this.target.get(0)).addClass("partition-cursor-error");

        let signal = (target_attr === "left" || target_attr === "top" ? 1 : -1);
        let init = (target_attr === "left" || target_attr === "right" ? init_x : init_y);
        // console.log(target_attr, signal*e2[xOrY] + (signal*-1)*init);
        this.highlight_line_div.css(target_attr, (signal * -1) * init - 10);

        this.$partition_root.get(0).onmousemove =  (e2)=> {

            // console.log(target_attr, signal*e2[xOrY] + (signal*-1)*init);
            this.highlight_line_div.css(target_attr, signal * e2[xOrY] + (signal * -1) * init - 10);
            // highlight_line_div.css("z-index",);
            // console.log(highlight_line_div);
            //                    highlight_line_div.css("");
        };
        console.log("fim partiton line")



    }


    //--------------mouse events ------------------------------------------------------------------
    /**
     * @description control mouse up function
     * */
    mouseup(){
        $(window).mouseup( (e)=> {
            this.calculatePositions(e);

        });
    }

    /**
    * @descripton mousedown function control da .partition-line .partition-divisor .partition-node
    * */
    mousedown(){

        this.$partition_root.attr("id", this.parent_id).on("mousedown", ".partition-line",  (e)=> {
            this.resizePartitionLine(e);

        });

        this.$partition_root.attr("id", this.parent_id).on("mousedown", ".partition-divisor",  (e)=> {
            this.resizePartionDivisor(e);
        });

        this.$partition_root.attr("id", this.parent_id).on("mousedown", ".partition-node",  (e) => {
            this.resizePartitionNode(e);

        });

    }

    addTarget(){
    // <div class="partition-line partition-ori-left"  style="display: block;">
    // <div class="partition-line partition-ver-top" wfd-invisible="true" style="display: block;">

        let divisor = $.append($("<div/>").addClass("partition-line").addClass("partition-ori-left")
            .attr("wfd-invisibl","true").css({"display":"block"}));

        console.log(divisor);
        return divisor
    }


    start(){
        this.parent_id = "partition-" + this.random_id();

        this.nodes = { id: this.parent_id, children: [], divisions: [] };
        let newNode = { id: this.nodes.id, children: [], divisions: [] };

        this.$partition_root = $(".partition-root").empty();


        this.addNode(this.nodes);

        this.highlight_line_div = $("<div/>").addClass("partition-divisor")
        .attr("id", "partition-highlight")
        .append($("<div/>")
            .addClass("partition-divisor-line")
            .css({"background-color":"green"}));
        console.log(this.target);

        this.target_border;
        this.target;


        this.mousedown();
        this.mouseup()
        console.log("target: ",this.divisor_target);
        //let divisor = this.addTarget()

        let partition = this.addNode(this.nodes,"ver",this.nodes);

        console.log("---uuuuuuuuuuuuuuuu",partition[0],partition[1].get(1),partition[2].div_element.get(0));
        let line_div = partition[2].div_element.get(0);
        //$(line_div).css("left",250);


        //this.resizePartitionLine(partition[2].div_element.get(0),250,0)


        this.redraw(this.nodes);
        this.resize();

    };



    createdLayoutPartitions(){
        console.log(this.parent_id);
        let nodeParent = $(".partition-root");
        let node = $(".partition-root").children().get(0);
        let node_data = node.__node__;

        console.log("data:",node_data);

        console.log("test:",node);

        let brother = $("#"+this.nodes.children[0].id);
        console.log("bb",brother)
       //  this.addNode(this.nodes,"ver",brother,250,0);
       //  this.resizePartitionLine(e);
       //  this.resizePartionDivisor(e);
       //  this.resizePartitionNode(e);
       //  //this.calculatePositions(0,250,0)
       //  //this.mousedown();
       // //this.mouseup()
       //  this.calculatePositions(0,250,0);
       //  this.redraw(this.nodes);
       //  this.resize();

        //this.addCustomNode(this.nodes,"hor",brother,400,0);


        // this.highlight_line_div = $("<div/>").addClass("partition-divisor")
        //   .attr("id", "partition-highlight")
        //   .append($("<div/>")
        //     .addClass("partition-divisor-line")
        //     .css({"background-color":"green"}));

        //this.addNode(this.nodes);



        //this.addNode(node_data,"hor",$(".partition-root"));



    }




}



class PartitionClass {

    constructor(root) {
        this.root = root;
        this.createRootIfNotExists.apply(this);
        let setup = new DynamicPartition(this);
        setup.createdLayoutPartitions();
    }


    removeNode() {

    }

    createRootIfNotExists() {
        let $root = $(this.root);
        if ($(".partition-root").length === 0 && $root.length > 0) {
            $root.append($("<div/>").addClass("partition-root"));
        }
    };

    onselectednode(node) { }
    onnodecreated(node) { }
    onnoderesized(node) { }
    onnoderemoved(node) { }


}

var PartitionLayout = PartitionClass;
