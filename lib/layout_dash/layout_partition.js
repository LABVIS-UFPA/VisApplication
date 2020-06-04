
class PartitionLayout {
    constructor(html_container) {
        this.html_container = html_container
    }

    export() {
        return this.root.toJson();
    }

    import(json) {
        let self = this;
        const add_child_tree = function (item, item_json) {

            this.addChild(item);
            if(!item_json.children) return;

            for (let i = 0; i < item_json.children.length; i++) {
                add_child_tree.call(item, new Partition(item_json.children[i], self), item_json.children[i] );
            }

        };

        this.root = new Partition(json, this);
        let container_selection = $(this.html_container).append(this.root.html);

        $(this.root.html).outerWidth(this.root.width = container_selection.outerWidth());
        $(this.root.html).outerHeight(this.root.height = container_selection.outerHeight());

        for (let i = 0; i < json.children.length; i++) {
            add_child_tree.call(this.root, new Partition(json.children[i], this), json.children[i]);
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
            partition.updateChildrenPositions();
            if(!partition.children || partition.children.length < 1) return;
            for (let i = 0; i < partition.children.length; i++) {
                updateTree(partition.children[i]);
            }
        };
        updateTree(this.root);
    }


    //DEBUG methods
    printProportions(){
        let printRec = (partition, ident) =>{
            ident+='  ';
            let sum = 0;
            for(let i=0;i<partition.children.length;i++){
                sum+=partition.children[i].proportion;
                console.log(ident+partition.children[i].proportion);
                printRec(partition.children[i], ident)
            }
            if(partition.children.length>0)
                console.log(ident+"sum: "+sum);
        };
        console.log(this.root.proportion);
        printRec(this.root, "")
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
    constructor(json, layout) {
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
        this.layout = layout;
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
                    this.html.remove();
                    tirou = true;
                    break;
                }
            }
            if(!tirou) return;
            for(let i=0; i<parent.divisors.length; i++){
                if(parent.divisors[i].partition1===this || parent.divisors[i].partition2===this){
                    if(i>0||i<parent.divisors.length-1){
                        parent.divisors[i+1].partition1 = parent.divisors[i].partition1
                    }
                    parent.divisors[i].html.remove();
                    parent.divisors.splice(i,1);
                    break;
                }
            }

            if(parent.children.length === 1) {
                parent.isLeaf = true;
                $(parent.html).empty().append(parent.children[0].html);
                parent.children = [];
            }else if(parent.children.length===0){
                parent.isLeaf = true;
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

    updateChildrenPositions(){
        for(let child of this.children){
            if (this.direction === "row") {
                child.width = this.width * child.proportion;
                child.height = this.height;
            } else {
                child.width = this.width;
                child.height = this.height * child.proportion;
            }
        }
        for(let divisor of this.divisors) {
            divisor.updatePosition();
        }
    }

    getAvailableSpace(){
        return this.direction === "row"?this.width:this.height;
    }

}


class Divisor{

    constructor(partition1,partition2){
        this.partition1=partition1;
        this.partition2=partition2;
        this.partition1.divisor_right = this;
        this.partition2.divisor_left = this;

        this.p_dir = this.partition1.parent.direction;
        let p_dir = this.p_dir;

        this.place_holder = new PlaceHolderDivisor(this.p_dir);
        let place_holder = this.place_holder;
        let self = this;
        this.move_ph = {};

        this.html = $("<div/>").addClass("partition-divisor")
            .addClass(p_dir==="row"?"partition-divisor-ver":"partition-divisor-hor")
            .on("mousedown", function(event){
                $(event.target).parent().prepend(place_holder.html);
                active_divisor = self;
                self.move_ph.dmove = 10-(p_dir==="row"?event.offsetX:event.offsetY);
                self.move_ph.page_start = p_dir==="row"?event.pageX:event.pageY;
                place_holder.setLocation(self.location-self.move_ph.dmove);
            });

        this.updatePosition();
    }

    mousemove(e){
        let delta_move = (this.p_dir==="row"?e.pageX:e.pageY) - this.move_ph.page_start;
        this.place_holder.setLocation(this.location+delta_move);

        let change = delta_move/this.partition1.parent.getAvailableSpace();
        let p1 = this.partition1.proportion+change;
        let p2 = this.partition2.proportion-change;
        if(p1<=0 || p2 <=0){
            this.place_holder.setBorderRed();
        }else{
            this.place_holder.resetBorderColor();
        }
    }

    mouseup(e){
        this.place_holder.remove();
        let delta_move = (this.p_dir==="row"?e.pageX:e.pageY) - this.move_ph.page_start;
        let change = delta_move/this.partition1.parent.getAvailableSpace();

        this.partition1.proportion+=change;
        this.partition2.proportion-=change;

        if(this.partition1.proportion<=0){

            let sib = this.partition1.getSiblings();
            if(sib[0])
                sib[0].proportion+=this.partition1.proportion;
            this.partition1.remove();
            this.partition2.layout.updateHTML();
            this.partition2.layout.printProportions();
        }else if(this.partition2.proportion<=0){

            let sib = this.partition2.getSiblings();
            if(sib[1])
                sib[1].proportion+=this.partition2.proportion;
            this.partition2.remove();
            this.partition1.layout.updateHTML();
            this.partition1.layout.printProportions();
        }else{
            this.partition1.layout.updateHTML();
        }

    }

    updatePosition(){
        let parent = this.partition1.parent;
        let p_dir = parent.direction;
        this.location = 0;
        for(let c of parent.children){
            this.location+=parent.direction==="row"?c.width:c.height;
            if(c===this.partition1)
                break;
        }
        this.html.css(p_dir==="row"?"left":"top", this.location-10);
    }

}

let active_divisor;
$(window).mouseup( (e)=> {
    if(active_divisor){
        active_divisor.mouseup(e);
        active_divisor = undefined;
    }
}).mousemove((e)=> {
    if(active_divisor){
        active_divisor.mousemove(e);
    }
});


class PlaceHolderDivisor{
    constructor(p_dir){
        this.p_dir = p_dir;
        this.html = $("<div/>").addClass("partition-divisor")
            .addClass(p_dir==="row"?"partition-divisor-ver":"partition-divisor-hor")
            .css(p_dir==="row"?"border-left":"border-top", "2px dashed gray").get(0);
    }

    setBorderRed(){
        $(this.html).css(this.p_dir==="row"?"border-left":"border-top", "2px dashed red");
    }

    resetBorderColor(){
        $(this.html).css(this.p_dir==="row"?"border-left":"border-top", "2px dashed gray");
    }

    setLocation(location){
        $(this.html).css(this.p_dir==="row"?"left":"top", location);
    }

    remove(){
        $(this.html).remove();
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










