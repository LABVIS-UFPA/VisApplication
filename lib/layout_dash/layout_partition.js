import { thresholdFreedmanDiaconis } from "d3";

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


class PartitionLayout{
    constructor(html_container){
        this.html_container = html_container

    }

    export(){
    
    }

    import(json){
        this.root = new Partition();
        let container_selection =$(this.html_container).append(this.root.html);


        $(this.root.html).width(this.root.width = container_selection.width());
        $(this.root.html).height(this.root.height = container_selection.height());

        for (let i = 0; i < json.children.length; i++) {
            this.root.addChild(new Partition());            
        }

    }



}


class Partition{

    constructor(){
        // this.parent = 
        this.id = random_id();
        this.direction = "row";
        this.children = [];
        this.proportion = 1;
        this.isLeaf = true;

        if(this.isLeaf){
            this.html = $("<div/>").attt("id",this.id).css({
                "flex-direction":this.direction
                // "width":this.proportion,
                // "height":this.proportion
            });
        }
    // direction:"",//vertical ou horizontal
    // children:[],//array partition node
    // parent:"",//outro partition node
    // proportion:0,//poroprção dentro do grupo
    
    // html:"",//elemento html
    }

    addChild(partition){
        this.children.push(partition);
        partition.parent = this;
        if(this.direction ==="row"){
            partition.width = this.width* partition.proportion;
            partition.height = this.height;
        } else {
            partition.width = this.width;
            partition.height = this.height*partition.proportion;
        }
    }
}








const random_id = () => {
    return Math.floor(Math.random() * 1000);
};










