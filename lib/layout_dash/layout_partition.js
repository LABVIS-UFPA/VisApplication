
class PartitionLayout {
    constructor(html_container) {
        this.html_container = html_container
    }

    export() {
        return this.root.toJson();
    }

    import(json) {
        const add_child_tree = function (item, item_json) {

            this.addChild(item);
            if(!item_json.children) return;

            for (let i = 0; i < item_json.children.length; i++) {
                add_child_tree.call(item, new Partition(item_json.children[i]), item_json.children[i] );
            }

        };

        this.root = new Partition(json);
        let container_selection = $(this.html_container).append(this.root.html);

        $(this.root.html).outerWidth(this.root.width = container_selection.outerWidth());
        $(this.root.html).outerHeight(this.root.height = container_selection.outerHeight());

        for (let i = 0; i < json.children.length; i++) {
            add_child_tree.call(this.root, new Partition(json.children[i]), json.children[i]);
        }

        this.updateHTML();

    }


    updateHTML(){
        let updateTree = (partition) => {
            $(partition.html)
                .css({
                    "flex-direction": partition.direction,
                    "padding": partition.isLeaf ? "5px" : 0
                })
                .outerWidth(partition.width)
                .outerHeight(partition.height);
            if(!partition.children || partition.children.length < 1) return;
            for (let i = 0; i < partition.children.length; i++) {
                updateTree(partition.children[i]);
            }
        };
        updateTree(this.root);
    }

}


class Partition {

    /**
     * Cria uma partição a partir de um jsonObject que é opcional.
     * defaut_json = {
     *     id: random, // Qualquer string
     *     direction: "row", // "row" ou "column"
     *     proportion: 1, // número entre [0,1]
     *     isLeaf: true // true ou false
     * }
     * @param json
     */
    constructor(json) {
        if(!json) json = {};

        this.id = json.id || random_id();
        this.direction = json.direction || "row";
        this.children = [];
        this.proportion =  json.proportion || 1;
        this.isLeaf = typeof json.isLeaf === "boolean" ? json.isLeaf : true;
        this.divisors = [];
        this.html = $("<div/>").attr("id", "partition-"+this.id)
            .addClass("partition-node partition-"+this.direction)
            .css({
                "display": "flex",
                "flex-direction": this.direction,
                "flex-wrap": "nowrap"
            }).get(0);
    }

    /**
     * Adiciona uma partição como filha. Caso this seja leaf então deixará de ser.
     * Caso this.direction seja "row" a partição adicionada como child será "column"
     * e vice-versa. O tamanho da child será recalculado conforma sua proporção;
     * @param partition A partição filha a ser adicionada.
     */
    addChild(partition) {
        //evita que um filho seja adicionado como filho novamente.
        if(this.indexOfChild(partition)>=0)
            return;

        this.children.push(partition);
        partition.parent = this;

        if(this.isLeaf) this.isLeaf = false;

        $(partition.html).removeClass("partition-row");
        $(partition.html).removeClass("partition-column");
        if (this.direction === "row") {
            partition.width = this.width * partition.proportion;
            partition.height = this.height;
            partition.direction = "column";
            $(partition.html).addClass("partition-column");
        } else {
            partition.width = this.width;
            partition.height = this.height * partition.proportion;
            partition.direction = "row";
            $(partition.html).addClass("partition-row");
        }

        if(this.children.length > 1){
            let len = this.children.length;
            this.divisors.push(new Divisor(this.children[len-2], this.children[len-1]));
            let lasti = this.divisors.length-1;
            $(this.html).append(this.divisors[lasti].html);
        }

        $(this.html).append(partition.html);
    }

    /**
     * Retorna o índice do filho passado por parâmetro. Caso não encontre retorna -1.
     *
     * @param child Partition filho que se deseja saber o índice.
     * @returns {number} índice do child no array children do this
     */
    indexOfChild(child){
        for(let i=0;i<this.children.length;i++) {
            if (this.children[i] === child)
                return i;
        }
        return -1;
    }

    /**
     * Retorna o irmão da esquerda e direita (em caso de direction "column": cima e baixo)
     * em um array de duas posições, sendo 0 o irmão da esqueda e 1 o irmão da direita.
     * Caso não tenha irmão em uma posição será returnado undefined na respectiva posição.
     * @returns {[left_sibling, right_sibling]}
     */
    getSiblings(){
        let siblings = [undefined, undefined];
        let parent = this.parent;
        if(parent){
            let i = parent.indexOfChild(this);
            if(i>=0){
                if(i>0) siblings[0] = parent.children[i-1];
                if(i<parent.children.length-1) siblings[1] = parent.children[i+1];
            }
        }
        return siblings;
    }

    /**
     * Redistribui a proporção das proportions entre os filhos do this.
     */
    fixProportion(){
        let sum=0;
        for(let c of this.children)
            sum += c.proportion;
        for(let c of this.children)
            c.proportion/=sum;
    }

    /**
     * Se remove (consequentemente todos os seus filhos) da árvore de partições. Basicamente faz
     * com que o parent remova o this da sua lista de children e redistribui a sua proporção
     * entre os irmãos.
     */
    remove(){
        let parent = this.parent;
        let tirou = false;
        if(parent){
            for(let i=0; i<parent.children.length; i++){
                if(parent.children[i] === this){
                    parent.children.splice(i,1);
                    tirou = true;
                    break;
                }
            }
            if(!tirou) return;
            if(parent.children.length < 1){
                parent.isLeaf = true;
            }else {
                let addToBrothers = this.proportion / parent.children;
                for (let child of parent.children)
                    child.proportion += addToBrothers;
                parent.fixProportion();
            }
        }
    }

    /**
     * Retorna uma versão JSON do objeto sem parent para evitar referência circular.
     * Essa função já é recursiva, o que significa que já retornará todos os filhos de
     * filhos até os nós folhas.
     */
    toJson(){
        let json = {
            id: this.id,
            direction: this.direction,
            proportion: this.proportion,
            isLeaf: this.isLeaf,
        };
        if(!this.isLeaf){
            json.children = [];
            for(let c of this.children){
                json.children.push(c.toJson());
            }
        }
        return json;
    }

}


class Divisor{

    constructor(partition1,partition2){
        this.partition1=partition1;
        this.partition2=partition2;
        this.partition1.divisor_right = this;
        this.partition2.divisor_left = this;

        let p_dir = this.partition1.parent.direction;

        this.html = $("<div/>").addClass("partition-divisor")
            .attr("draggable", "true")
            .addClass(p_dir==="row"?"partition-divisor-ver":"partition-divisor-hor")
            .on("dragstart", function(event){
                $(event.target).css("background-color", "gray");
                console.log("dragstart", event);
            })
            .on("dragend", function(event){
                $(event.target).css("background-color", "transparent");
                console.log("dragend", event);
            });

        this.updatePosition();
    }

    updatePosition(){
        let parent = this.partition1.parent;
        let p_dir = parent.direction;
        let location = 0;
        for(let c of parent.children){
            location+=parent.direction==="row"?c.width:c.height;
            if(c===this.partition1)
                break;
        }
        this.html.css(p_dir==="row"?"left":"top",
            p_dir==="row"? location-10: location-10);
    }

}


const random_id = () => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
    let text = "";
    for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};










