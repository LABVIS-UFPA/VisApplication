/**
 * class
 * @description - classe responsavel para criação de layout dashbord completo
 */

class PartitionLayout {
    /**
     *
     * @param html_container - elemento html onde serão posicionadas as o layout dashbord
     */
    constructor(html_container) {
        this.html_container = html_container

        this.highlight_line_div = $('<div/>').addClass('partition-divisor')

        $(this.html_container.ownerDocument.defaultView).resize(() => {
            this.updateLayout()
            this.updateHTML()
        })

        //Somente para a ferramenta de corte (adicionar novo Partition)
        this.placeholder_cutter = new PlaceHolderDivisor('column')
        this.cutter_on = false

        $(this.html_container).on('click', '.partition-node', function (e) {
            let node = this.__node__;

            let $parentTarget = $(e.target).parent().get(0);
            if(!$parentTarget)
                return;

            let partition = $(e.target).parent().get(0).__node__;


            let partition_target = partition;
            let ph = node.layout.placeholder_cutter;

            let location = ph.p_dir === 'column' ? $(e.target).position().top : $(e.target).position().left
            if (node.layout.cutter_on && partition) { //&& this === partition){
                if (node === partition && partition.isLeaf || !partition.isLeaf && partition.hasChild(node)) {
                    if (ph.p_dir !== partition.direction && partition.parent) {
                        partition = partition.parent
                    }else if(!partition.parent){
                        partition.direction = ph.p_dir
                    }

                    let dif_proportion = ph.p_dir === 'column' ? location / partition_target.height : location / partition_target.width;

                    ph.setLocation(location)
                    // console.log(`dir:${ph.p_dir}   location:${location}  size:${ph.p_dir === 'column' ?partition_target.height:partition_target.width}`);

                    // caso 1
                    //--- partições para leaf tratar mudança de content do - parent para o conteudo ----
                    //metade pra cima metade para
                    if (partition.isLeaf) {
                        let content_svg = $(partition.html).children()?$(partition.html).children():null;
                        console.log(partition.html)
                        if(content_svg){
                            partition.addChild(new Partition(node.layout, {proportion: 1 - dif_proportion}), false,Infinity,content_svg);
                            $(partition.html).children().remove();
                            $(partition.html).children("div").remove();
                        }else{
                            partition.addChild(new Partition(node.layout, {proportion: 1 - dif_proportion}), false);
                        }
                        partition.addChild(new Partition(node.layout, {proportion: dif_proportion}));

                    } else {
                        let indexNode;
                        for (let i = 0; i < partition.children.length; i++) {
                            if(partition.children[i]===node){
                                indexNode = i;
                                break
                            }
                        }

                        let nodeprop = node.proportion
                        node.proportion = (1 - dif_proportion) * nodeprop;

                        partition.addChild(new Partition(node.layout, {proportion: nodeprop * dif_proportion}), true, indexNode);

                    }

                    ph.remove()
                    partition.layout.updateLayout();
                    partition.layout.updateHTML();

                    // for (let i = 0; i < partition.children.length; i++) {
                    //     console.log("partition: "+i+":" ,partition.children[i].html);
                    //
                    // }
                }

            }
        })

    }

    export() {
        return this.root.toJson()
    }

    import(json) {
        let self = this
        const add_child_tree = function (item, item_json) {

            if(item_json.children){
                this.addChild(item,true, Infinity,"")
            }else{
                this.addChild(item)
            }

            this.isLeaf = false;
            if (!item_json.children) return;

            for (const child of item_json.children) {
                console.log("item ",child.isLeaf)
                add_child_tree.call(item, new Partition(self, child), child)
            }
        }

        this.root = new Partition(this, json)
        let container_selection = $(this.html_container).append(this.root.html)

        this.root.width = container_selection.outerWidth()
        $(this.root.html).outerWidth(this.root.width)
        this.root.height = container_selection.outerHeight()
        $(this.root.html).outerHeight(this.root.height)

        for (const child of json.children) {
            add_child_tree.call(this.root, new Partition(this, child), child)
        }

        this.updateHTML()

    }

    /**
     * @param element
     */
    getChildren(element) {
        const children = this.root.children
        if (this.cutter_on) {
            for (const child of children) {
                const idName = element
                const idChidSelected = $(child.html).attr('id')

                console.log(idName, idChidSelected)

                if (idName === idChidSelected) {
                    console.log("deu certo", idName, idChidSelected)
                    return child

                }
            }
        }


    }

    updateLayout() {
        let container_selection = $(this.html_container)
        this.root.width = container_selection.outerWidth()
        this.root.height = container_selection.outerHeight()
        $(this.root.html).outerWidth(this.root.width)
        $(this.root.html).outerHeight(this.root.height)
        this.root.updateChildrenPositions()
    }

    updateHTML() {
        let updateTree = (partition) => {
            $(partition.html)
                .css({
                    'flex-direction': partition.direction,
                    'padding': partition.isLeaf ? '5px' : 0
                })
                .outerWidth(partition.width)
                .outerHeight(partition.height)
            partition.updateChildrenPositions()
            if (!partition.children || partition.children.length < 1) return
            for (const child of partition.children) {
                partition.html.appendChild(child.html);
                updateTree(child)
            }
        }
        updateTree(this.root)
    }

    /**
     * @description - metodo para criar o definir novas partições
     * @param active - metodo para ativa e desativar as linhas de corte
     * @param direction - parametro linha 'row' ou 'column' para definir o direcionamento das linhas
     */
    setCutter({active = true, direction = 'column'}) {
        this.cutter_on = active
        this.placeholder_cutter.remove()
        this.placeholder_cutter = new PlaceHolderDivisor(direction)

    }

    //DEBUG methods

    printProportions() {
        let printRec = (partition, ident) => {
            ident += '  '
            let sum = 0
            for (const child of partition.children) {
                sum += child.proportion
                // console.log(ident + child.proportion)
                printRec(child, ident)
            }
            if (partition.children.length > 0)
                console.log(ident + 'sum: ' + sum)
        }
        // console.log(this.root.proportion)
        printRec(this.root, '')
    }
}

/**
 * class
 * @description -cria divs de partições no layout
 */
class Partition {

    /**
     * description - Cria uma partição a partir de um jsonObject que é opcional.
     * defaut_json = {
     *     id: random, // Qualquer string
     *     direction: "row", // "row" ou "column"
     *     proportion: 1, // número entre [0,1]
     *     isLeaf: true // true ou false
     * }
     * @param json - objeto json com as descrições de layout
     */
    constructor(layout, {
        id = random_id(),
        direction = 'row',
        proportion = 1,
        isLeaf = true

    } = {}) {
        this.children = []
        this.divisors = []
        this.id = id
        this.direction = direction
        this.proportion = proportion
        this.isLeaf = isLeaf

        this.html = $('<div/>').attr('id', 'partition-' + this.id)
            .addClass('partition-node partition-' + this.direction)
            .css({
                'display': 'flex',
                'flex-direction': this.direction,
                'flex-wrap': 'nowrap'
            })
            .mousemove((e) => {
                if (this.layout.cutter_on && e.target.__node__) {
                    let partition = e.target.__node__
                    let ph = this.layout.placeholder_cutter

                    let location = ph.p_dir === 'row' ? e.offsetX : e.offsetY
                    // if (ph.p_dir !== partition.direction) {
                    //     partition = partition.parent
                    //     location = ph.p_dir === 'row' ? e.offsetX + e.target.offsetLeft : e.offsetY + e.target.offsetTop
                    // }
                    ph.remove()
                    $(partition.html).prepend(ph.html)

                    ph.setLocation(location)
                }

            })


            .get(0)
        this.html.__node__ = this
        this.layout = layout


    }


    /***
     * Adiciona uma partição como filha. Caso this seja leaf então deixará de ser.
     * Caso this.direction seja "row" a partição adicionada como child será "column"
     * e vice-versa. O tamanho da child será recalculado conforme sua proporção;
     * @param partition A partição filha a ser adicionada.
     * @param updateProportion proporção de update
     * @param index intex
     * @param content conteudo html caso exista
     */
    addChild( partition, updateProportion = true, index = Infinity,content) {
        //evita que um filho seja adicionado como filho novamente.
        if (this.indexOfChild(partition) >= 0)
            return

        let lasti =  this.children.length - 1;
        lasti = lasti===-1?0:lasti

        index = index===Infinity?lasti:index;

        this.children.splice(index, 0, partition)
        partition.parent = this

        if (this.isLeaf) this.isLeaf = false

        if (updateProportion) {
            this.fixProportion()
        }

        $(partition.html).removeClass('partition-row')
        $(partition.html).removeClass('partition-column')
        if (this.direction === 'row') {
            partition.width = this.width * partition.proportion
            partition.height = this.height
            partition.direction = 'column'
            $(partition.html).addClass('partition-column')
            if(content){
                $(partition.html).addClass('partiton-content')
                    .append(content)
            }
        else if(content===""){
                $(partition.html).addClass('partiton-content')
            }
        else{
            $(partition.html).addClass('partiton-content')
                .append($('<div/>')
                    .append($('<button/>').text(' view settings ')
                    .text('Add Visualization')
                    .addClass('btn btn-large btn-positive')
                    .addClass('icon icon-plus')
                    .attr("width", '20px')
                    .attr("height", '20px')
                    .attr('data-nodeid', $(this).attr('id'))
                    .css({'float': 'right'}))
                )
            }


        } else {
            partition.width = this.width
            partition.height = this.height * partition.proportion
            partition.direction = 'row'
            $(partition.html).addClass('partition-row')
            $(partition.html).addClass('partition-column')
            if(content){
                $(partition.html).addClass('partiton-content')
                    .append($(content))
            }
            else if(content===""){
                $(partition.html).addClass('partiton-content')
            }
        else{

            $(partition.html).addClass('partiton-content')
                .append($('<div/>')
                    .append($('<button/>').text(' view settings ')
                    .text('Add Visualization')
                    .addClass('btn btn-large btn-positive')
                    .addClass('icon icon-plus')
                    .attr("width", '20px')
                    .attr("height", '20px')
                    .attr('data-nodeid', $(this).attr('id'))
                    .css({'float': 'right'}))
                )
                // .css("background-color", this.gera_cor()).text(function () {
                // return $(this).attr("id") +"index:"+index;
            // })
            }

        }

        if (this.children.length > 1) {
            let len = this.children.length

            this.divisors.splice(index, 0, new Divisor(this.children[index], this.children[index+1]))

            for (let i = 0; i < this.divisors.length; i++) {
                this.divisors[i].resizeDivisions(true)
                this.divisors[i].partition1 = this.children[i];
                this.divisors[i].partition2 = this.children[i+1];

            }

            $(this.html.childNodes[index]).after(this.divisors[index].html)

        }

        partition.layout = this.layout
        $(this.html).append(partition.html)
        $(this.html).trigger("layout:created")

    }

    /**
     * @description add partition content
     * @param {object} selection - html selection jquery
     * */
    addContent(selection) {
        $(selection.html).append($("<div/>").addClass("partition-content"))//.width("100%").height("100%"))
    }


    hasChild(child) {
        return this.children.includes(child);
    }

    gera_cor() {
        var hexadecimais = '0123456789ABCDEF';
        var cor = '#';

        // Pega um número aleatório no array acima
        for (var i = 0; i < 6; i++) {
            //E concatena à variável cor
            cor += hexadecimais[Math.floor(Math.random() * 16)];
        }
        return cor;
    }


    /**
     * Retorna o índice do filho passado por parâmetro. Caso não encontre retorna -1.
     *
     * @param child Partition filho que se deseja saber o índice.
     * @returns {number} índice do child no array children do this
     */
    indexOfChild(child) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === child)
                return i
        }
        return -1
    }

    /**
     * Retorna o irmão da esquerda e direita (em caso de direction "column": cima e baixo)
     * em um array de duas posições, sendo 0 o irmão da esqueda e 1 o irmão da direita.
     * Caso não tenha irmão em uma posição será returnado undefined na respectiva posição.
     * @returns {[left_sibling, right_sibling]}
     */
    getSiblings() {
        let siblings = [undefined, undefined]
        let parent = this.parent
        if (parent) {
            let i = parent.indexOfChild(this)
            if (i >= 0) {
                if (i > 0) siblings[0] = parent.children[i - 1]
                if (i < parent.children.length - 1) siblings[1] = parent.children[i + 1]
            }
        }
        return siblings
    }


    /**
     * Redistribui a proporção das proportions entre os filhos do this.
     */
    fixProportion() {
        let sum = 0
        for (let c of this.children)
            sum += c.proportion
        for (let c of this.children)
            c.proportion /= sum
    }

    /**
     * Se remove (consequentemente todos os seus filhos) da árvore de partições. Basicamente faz
     * com que o parent remova o this da sua lista de children e redistribui a sua proporção
     * entre os irmãos.
     */
    remove() {
        let parent = this.parent
        let tirou = false
        if (parent) {
            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === this) {
                    parent.children.splice(i, 1)
                    this.html.remove()
                    tirou = true
                    break
                }
            }
            if (!tirou) return
            for (let i = 0; i < parent.divisors.length; i++) {
                if (parent.divisors[i].partition1 === this || parent.divisors[i].partition2 === this) {
                    if (i > 0 || i < parent.divisors.length - 1) {
                        parent.divisors[i + 1].partition1 = parent.divisors[i].partition1
                    }
                    parent.divisors[i].html.remove()
                    parent.divisors.splice(i, 1)
                    break
                }
            }

            if (parent.children.length === 1) {
                parent.isLeaf = true
                $(parent.html).empty().append(parent.children[0].html)
                parent.children = []
            } else if (parent.children.length === 0) {
                parent.isLeaf = true
            }
            // else {
            //     let addToBrothers = this.proportion / parent.children;
            //     for (let child of parent.children)
            //         child.proportion += addToBrothers;
            //     parent.fixProportion();
            // }
        }
    }

    /**
     * Retorna uma versão JSON do objeto sem parent para evitar referência circular.
     * Essa função já é recursiva, o que significa que já retornará todos os filhos de
     * filhos até os nós folhas.
     */
    toJson() {
        let json = {
            id: this.id,
            direction: this.direction,
            proportion: this.proportion,
            isLeaf: this.isLeaf,
        }
        if (!this.isLeaf) {
            json.children = []
            for (let c of this.children) {
                json.children.push(c.toJson())
            }
        }
        return json
    }

    updateChildrenPositions() {
        for (let child of this.children) {
            if (this.direction === 'row') {
                child.width = this.width * child.proportion
                child.height = this.height
            } else {
                child.width = this.width
                child.height = this.height * child.proportion
            }
        }
        for (let divisor of this.divisors) {
            divisor.updatePosition()
        }
        for (let child of this.children)
            child.updateChildrenPositions()
    }

    getAvailableSpace() {
        return this.direction === 'row' ? this.width : this.height
    }

}

/**
 * class
 * @description - responsavel por criar as linhas de divisão html
 */

class Divisor {

    constructor(partition1, partition2) {
        this.partition1 = partition1
        this.partition2 = partition2
        this.partition1.divisor_right = this
        this.partition2.divisor_left = this

        this.p_dir = this.partition1.parent.direction
        let p_dir = this.p_dir

        this.place_holder = new PlaceHolderDivisor(this.p_dir)
        let place_holder = this.place_holder
        let self = this
        this.move_ph = {}

        this.html = $('<div/>').addClass('partition-divisor')
            .addClass(p_dir === 'row' ? 'partition-divisor-ver' : 'partition-divisor-hor')
            .on('mousedown', function (event) {
                $(event.target).parent().prepend(place_holder.html)
                active_divisor = self
                self.move_ph.dmove = 10 - (p_dir === 'row' ? event.offsetX : event.offsetY)
                self.move_ph.page_start = p_dir === 'row' ? event.pageX : event.pageY
                place_holder.setLocation(self.location - self.move_ph.dmove)
            })

        this.resizeDivisions(true)
        this.updatePosition()
    }

    /**
     * description - movimento das linhas de divisão
     * @param e target evento html
     */
    mousemove(e) {
        let delta_move = (this.p_dir === 'row' ? e.pageX : e.pageY) - this.move_ph.page_start
        this.place_holder.setLocation(this.location + delta_move)

        let change = delta_move / this.partition1.parent.getAvailableSpace()
        let p1 = this.partition1.proportion + change
        let p2 = this.partition2.proportion - change
        if (p1 <= 0 || p2 <= 0) {
            this.place_holder.setBorderRed()
        } else {
            this.place_holder.resetBorderColor()
        }
    }

    /**
     * @param bollean
     */
    resizeDivisions(bollean = true) {
        // active_divisor = false
        // if (bollean) {
        // active_divisor = true
        $(window).mouseup((e) => {
            if (active_divisor) {
                active_divisor.mouseup(e)
                active_divisor = undefined
                $(this.html).trigger("layout:resize")

            }

        }).mousemove((e) => {
            if (active_divisor) {
                active_divisor.mousemove(e)

            }
        })
        // }

    }

    /**
     * @description - responsavel pelo calculo e redesenho das linhas quando solto o mouse
     * @param e - target evento html
     */
    mouseup(e) {
        this.place_holder.remove()
        let delta_move = (this.p_dir === 'row' ? e.pageX : e.pageY) - this.move_ph.page_start
        let change = delta_move / this.partition1.parent.getAvailableSpace()

        this.partition1.proportion += change
        this.partition2.proportion -= change

        if (this.partition1.proportion <= 0) {

            let sibs = this.partition1.parent.children
            for (let sib of sibs) {
                console.log(sib.proportion)
                if (sib !== this.partition2 && sib !== this.partition1) {
                    sib.proportion += this.partition1.proportion / (sibs.length - 2)
                    if (sib.proportion <= 0) sib.remove()
                }
            }
            // if(sib[0])
            //     sib[0].proportion+=this.partition1.proportion;
            this.partition1.remove()
            this.partition2.layout.printProportions()
            this.partition2.parent.fixProportion()
            this.partition2.layout.updateHTML()
            this.partition2.layout.printProportions()
        } else if (this.partition2.proportion <= 0) {

            let sibs = this.partition2.parent.children
            for (let sib of sibs) {
                if (sib !== this.partition2 && sib !== this.partition1) {
                    sib.proportion += this.partition2.proportion / (sibs.length - 2)
                    if (sib.proportion <= 0) sib.remove()
                }
            }
            // let sib = this.partition2.getSiblings();
            // if(sib[1])
            //     sib[1].proportion+=this.partition2.proportion;
            this.partition2.remove()
            this.partition2.layout.printProportions()
            // console.log('-----------------------------------')
            this.partition1.parent.fixProportion()
            this.partition1.layout.updateHTML()
            this.partition1.layout.printProportions()
        } else {
            this.partition1.layout.updateHTML()
        }
        $(this.html).trigger("layout:resize")

    }

    updatePosition() {
        let parent = this.partition1.parent
        let p_dir = parent.direction
        this.location = 0
        for (let c of parent.children) {
            this.location += parent.direction === 'row' ? c.width : c.height
            if (c === this.partition1){
                break
            }

        }

        this.html.css(p_dir === 'row' ? 'left' : 'top', (this.location - 10)+"px")
    }

}

let active_divisor

/**
 * description - classe para criação de divisões de layout dinamicamente
 */
class PlaceHolderDivisor {
    /***
     * @param p_dir
     */
    constructor(p_dir) {
        this.p_dir = p_dir
        this.html = $('<div/>').addClass('partition-divisor')
            .addClass(p_dir === 'row' ? 'partition-divisor-ver' : 'partition-divisor-hor')
            .css(p_dir === 'row' ? 'border-left' : 'border-top', '2px dashed gray').get(0)
    }

    setBorderRed() {
        $(this.html).css(this.p_dir === 'row' ? 'border-left' : 'border-top', '2px dashed red')
    }

    resetBorderColor() {
        $(this.html).css(this.p_dir === 'row' ? 'border-left' : 'border-top', '2px dashed gray')
    }

    setLocation(location) {
        $(this.html).css(this.p_dir === 'row' ? 'left' : 'top', location)
    }

    remove() {
        $(this.html).remove()
    }
}

const random_id = () => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'
    let text = ''
    for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}










