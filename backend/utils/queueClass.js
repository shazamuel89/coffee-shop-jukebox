class Queue {

    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue(){
        if(this.isEmpty){
            return;
        }
        return this.items.shift();
    }

    isEmpty() {
        return this.length === 0;
    }

    printQueue(){
        const element = document.getElementById("queue");
        element.innerHTML = '';
        if(this.isEmpty()){
            let newElem =  document.createElement("p");
            let newNode = document.createTextNode("The Queue is currently empty.");
            newElem.appendChild(newNode);
            element.appendChild(newElem)

        }
        for(let i = 0; i < this.items.length; i++){
            let newElem =  document.createElement("p");
            let newNode = document.createTextNode(this.items[i]);
            newElem.appendChild(newNode);
            element.appendChild(newElem)
        }
    }
}

var test = new Queue();
test.enqueue("One");
test.dequeue();
test.enqueue("Two");
test.enqueue("Three");
test.enqueue("Four");
test.enqueue("Five");
test.enqueue("Six");
test.enqueue("Seven");

