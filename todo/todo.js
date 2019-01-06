/**
 * Useful stuff:
 * https://blog.sessionstack.com/how-javascript-works-the-rendering-engine-and-tips-to-optimize-its-performance-7b95553baeda
 * https://www.thenorthface.com/shop/jester-nf0a3kv7?from=subCat&variationId=JK3&utm_medium=cpc&utm_source=Google&utm_campaign=Shopping&utm_term=NF0A3KV7JK3OS1&gclid=Cj0KCQiAxNnfBRDwARIsAJlH29BwifwJkUSYYmrGNFDjr1jUShcTtn-Kol7hYtDL89VU8Rb46M9nd7kaAp2MEALw_wcB&gclsrc=aw.ds#hero=0
 * 
 */

const API_TOKEN = "87a02c68";
const headers = { "Content-Type": "application/json"};
let isFormEnabled = true;
let nextId = 1;

function enableForm() {
    document.getElementById("input").removeAttribute("disabled");
    document.getElementById("add-item-button").removeAttribute("disabled");
    document.getElementById("clear-all-button").removeAttribute("disabled");
    document.getElementById("input").setAttribute("enabled", "true");
    document.getElementById("add-item-button").setAttribute("enabled", "true");
    document.getElementById("clear-all-button").setAttribute("enabled", "true");
}
function disableForm(){
    document.getElementById("input").removeAttribute("enabled");
    document.getElementById("add-item-button").removeAttribute("enabled");
    document.getElementById("clear-all-button").removeAttribute("enabled");
    document.getElementById("input").setAttribute("disabled", "true");
    document.getElementById("add-item-button").setAttribute("disabled", "true");
    document.getElementById("clear-all-button").setAttribute("disabled", "true");
}

function buildPayload(text, id) {
    const todos = [];
    for (let item of document.getElementById("list").childNodes) {
        let  value = item.firstChild.textContent;
        let id = Number.parseInt(item.getAttribute("id").split("-")[1]);
        todos.push({value, id})
    }
    todos.push({value: text, id});
    return JSON.stringify(todos);
}

function persistItem(id, text) {
    return fetch(`https://api.keyvalue.xyz/${API_TOKEN}/todo-list`, {
        method: 'POST',
        headers,
        body: buildPayload(text, id)
    })
    // .then(res => res.json())
    .then(todos => {
        console.log("Saved to api; new todos: ", todos);
    }).catch(error => {
        console.error("Error while saving to API: ", error);
    });
}

function addItemToDom(id, text) {
    // Remove the empty list message
    // document.getElementById("empty-list-text").innerHTML = "";
    let list = document.getElementById("list");
    let item = document.createElement("li");
    item.setAttribute("id", "item-" + id);

    // When an item in the list is clicked, mark it as done
    item.addEventListener("click", (event) => {
        let item = document.getElementById(event.target.id);
        item.style.textDecoration = "line-through";
        item.style.color = "red";
    });
    
    item.appendChild(document.createTextNode(text));
    list.appendChild(item);

    // Reset the input text
    document.getElementById("input").value = "";
}

/**
 * Add an item to existing list (of todos)
 * @param {string} text
 * @param {number} id
 */
function addItem(input) {
    // If the input is empty string don't add it
    if (input.length === 0) {
        return;
    }
    disableForm();
    const itemId = nextId++;
    persistItem(itemId, input).then(() => {
        addItemToDom(itemId, input);
        enableForm();
    }).catch(error => {
        console.log("persisting to api failed: ", error);
        enableForm();
    });
}

function clearAll() {
    document.getElementById("input").value = "";
    nextId = 1;
    var list =  document.getElementById("list");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    document.getElementById("empty-list-text").innerHTML = "No items to display!";
}

function loadDocument() {
    // Set the list text to empty
    document.getElementById("empty-list-text").innerHTML = "No items to display!";
    // Load list from api
    disableForm();
    fetch(`https://api.keyvalue.xyz/${API_TOKEN}/todo-list`, { headers }).then(res => res.json()).then(todos => {
        console.log("Todos: ", todos);
        todos.forEach((todo, index) => {
            console.log("todo value, id: ", todo.value, ", ", todo.id)
            addItemToDom(todo.id, todo.value);
        });
        nextId = todos.length + 1;
        enableForm();
        if (todos.length) {
            document.getElementById("empty-list-text").innerHTML = "";
        }
    }).catch(error => {
        console.log("loading from api failed: ", error);
        enableForm();
    });
}