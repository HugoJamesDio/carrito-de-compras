// mostrar elementos de la "api"
const cards = document.querySelector('#cards')
const templateCard = document.querySelector('#template-card').content
const templateFooter = document.querySelector('#template-footer').content
const templateCarrito = document.querySelector('#template-carrito').content
const items = document.querySelector('#items')
const footer = document.querySelector('#footer')
console.log(templateFooter)
const fragment = document.createDocumentFragment()
let carrito = {}

document.addEventListener('DOMContentLoaded', () =>{
    fetchData()
})
const fetchData = async () =>{
    try {
        const response = await fetch('api.json')
        const data = await response.json()
        // console.log(data)
        pintarCartas(data)
    } catch (error) {
        
    }
}

/*
 Muestra los productos en la pantalla.
 Para no hacer uso de createElement, se hace uso del fragment, template y clone. Esto evita el reflow y de alguna manera hace más rápida la carga de la página.
 Como son objetos de un json se utiliza un for each para recorrer dichos elementos.
 Cada botón de compra debe tener el id del porducto para saber qué producto estoy comprando.
*/
const pintarCartas = (data) =>{
    // console.log(data)
    // Recorrido de los elementos
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.title
        templateCard.querySelector('p').textContent = producto.precio
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl)
        templateCard.querySelector('button').dataset.id = producto.id
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    });
    cards.appendChild(fragment)
}

/*
 Botón de compra - Delegación de eventos
 No se agregan eventos indivudualmente, sino que se agrega uno único a todos los elementos que deben manejar eventos.
 e captura el elemento que se quiere modificar.
 target es la referencia al objeto en el cual se lazó el evento, en este caso el botón
 stopPropagation ayuda a que se detenga cualquier otro evento que se pueda generar.
 parentElement obtiene el nodo padre del elemento y consigo los nodos "hermanos".
*/

cards.addEventListener('click', (e) => {
    agregarAlCarrito(e)
})

const agregarAlCarrito = (e) =>{
    // console.log(e.target)
    // console.log(e.target.classList.contains('btn-dark'))

    // Si a lo que le hago clic es un botón con esa clase (botón comprar)
    if (e.target.classList.contains('btn-dark')) {
        // Agregar al carrito y pintar los elementos seleccionados en la pantalla.
        setCarrito(e.target.parentElement)
    }
    e.stopPropagation()
}

// Agregar los elementos al carrito
const setCarrito = (objeto) =>{
    const producto = {
        id: objeto.querySelector('button').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    }
    // Aumentar la cantidad del mismo producto
    /*
     El método hasOwnProperty() devuelve un booleano indicando si el objeto tiene la propiedad especificada.
     En este caso, si el carrito tiene el id del producto duplicado, entonces la cantidad aumenta.
     Utilizar el spread operator ({...producto}), el operador de propagación crea una copia superficial del objeto producto. Esto asegura que carrito[producto.id] se asigne a un nuevo objeto con las mismas propiedades y valores que producto, en lugar de referenciar el mismo objeto.
    */
   if (carrito.hasOwnProperty(producto.id)) {
    producto.cantidad = carrito[producto.id].cantidad + 1    
   }
   carrito[producto.id] = {...producto}
//    console.log(carrito);
   pintarCarrito()
}

const pintarCarrito = () =>{
    console.log(carrito);
    /*
    Object.values() se utiliza para obtener un array con los valores de todas las propiedades enumerables de un objeto. Este método devuelve un array cuyos elementos son los valores de las propiedades del objeto pasado como argumento.
    */
   items.innerHTML =  ''
    Object.values(carrito).forEach(producto =>{
        templateCarrito.querySelector('th').textContent = producto.td
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    pintarFooter()
}

const pintarFooter = () =>{
    footer.innerHTML = ''
    // Si el carrito está vació:
    if(Object.keys(carrito).length == 0){
        // pintar el footer 'Carrito vacío, comience a comprar.
        footer.innerHTML = `
            <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `;
        return; // Se usa return para que ya no ekecute el código de abajo en caso de entrar al if
    }
    // Sumar la cantidad de productos y el precio total por todos los productos agregados al carrito.
    const nCantidad = Object.values(carrito).reduce((acc, {cantidad})=> acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio})=> acc + cantidad * precio, 0)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio
    
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    // Agregar funcionalidad al botón de 'Vaciar carrito'.
    const btnVaciarCarrito = document.querySelector('#vaciar-carrito')
    btnVaciarCarrito.addEventListener('click', ()=>{
        // Se vacía el carrito y se vuelve a mostrar el carrito (vacío).
        carrito = {};
        pintarCarrito();
    });
}

// Aumentar y disminuir cantidad de productos en el carrito. [Se usa event delegation]
items.addEventListener('click', (e)=>{
    btnAccion(e);
})

const btnAccion = (e) =>{
    // console.log(e.target)
    if (e.target.classList.contains('btn-info')) {
        carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = {...producto}
        pintarCarrito();
    }
    if (e.target.classList.contains('btn-danger')) {
        carrito[e.target.dataset.id]
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if(producto.cantidad == 0){
            delete carrito[e.target.dataset.id]
        }
        // carrito[e.target.data.id] = {...producto}
        pintarCarrito();
    }
    e.stopPropagation();
}