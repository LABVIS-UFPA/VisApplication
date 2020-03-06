// import { thresholdFreedmanDiaconis } from "d3";

// class PartitionLayout {

//     /**
//      *@param root_html - onde vai ficar no html
//      */
//     constructor(root_html) {
//         this.root = root_html;
//     };


//     createLayoutbyJson(json){

//     };

//     random_id() {
//         return Math.floor(Math.random() * 1000);
//     };

//     addPartitionDiv(){
//         let container = document.createElement("div").classList.add("partition-node").style("background-color","grey");
//         return container;
//     };

//     createRootIfNotExists() {
//         let $root = $(this.root);
//         if ($(".partition-root").length === 0 && $root.length > 0) {
//             $root.append($("<div/>").addClass("partition-root"));
//         }
//     };

//     removePartitionDiv(ContainerId){
//         document.querySelectorAll("#"+ContainerId);

//     };

//     addRowLayout(){

//     };

//     removeRowLayout(){

//     };

//     removeCollumLayout(){

//     };



// };


class PartitionLayout {
    constructor(html_container) {
        this.html_container = html_container
    }

    export() {

    }

    create_Json() {

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
        let updateTree = (html) => {
            $(html.html)
                .css({
                    "flex-direction": html.direction,
                    "padding": html.isLeaf ? "5px" : 0
                })
                .outerWidth(html.width)
                .outerHeight(html.height);
            if(!html.children || html.children.length < 1) return;
            for (let i = 0; i < html.children.length; i++) {
                updateTree(html.children[i]);
            }
        };
        updateTree(this.root);
    }

}


class Partition {

    constructor(json) {
        // this.parent = 
        this.id = json.id || random_id();
        this.direction = json.direction || "row";
        this.children = [];
        this.proportion =  json.proportion || 1;
        this.isLeaf = typeof json.isLeaf === "boolean" ? json.isLeaf : true;
        this.html = $("<div/>").attr("id", this.id).css({
            "display": "flex",
            "flex-direction": this.direction,
            "flex-wrap": "nowrap"
        }).get(0);
        // direction:"",//vertical ou horizontal
        // children:[],//array partition node
        // parent:"",//outro partition node
        // proportion:0,//proporção dentro do grupo

        // html:"",//elemento html
    }

    addChild(partition) {
        this.children.push(partition);
        partition.parent = this;

        if(this.isLeaf) this.isLeaf = false;

        if (this.direction === "row") {
            partition.width = this.width * partition.proportion;
            partition.height = this.height;
            partition.direction = "column";
        } else {
            partition.width = this.width;
            partition.height = this.height * partition.proportion;
            partition.direction = "row";
        }

        $(this.html).append(partition.html);
    }

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
            }
        }
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










