// Array para almacenar los productos del carrito
let cart = [];
const TAX_RATE = 0.10; // 10% de impuestos (puedes ajustarlo)

// CONFIGURACIÓN IMPORTANTE: Reemplaza este número con el teléfono de tu restaurante (código de país + número, sin signos + o espacios).
const RESTAURANT_PHONE_NUMBER = '59178040515'; // Ejemplo: Bolivia (591) + Número

// Función para abrir/cerrar el modal del carrito
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        modal.style.display = "block";
        renderCart();
    }
}

// Función para añadir un producto al carrito (con soporte para notas)
function addItem(button) {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    
    // 1. Capturar el campo de notas asociado a este botón
    const itemContainer = button.closest('.menu-item');
    const notesField = itemContainer.querySelector(`input[data-notes-id="${id}"]`);
    const notes = notesField ? notesField.value.trim() : '';

    // Generar un ID único para este artículo específico (incluyendo notas)
    const uniqueId = notes ? `${id}-${notes}` : id;
    
    // Buscar si ya existe un artículo idéntico (mismo ID de plato Y mismas notas)
    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, uniqueId, name, price, quantity: 1, notes });
    }
    
    // 2. Limpiar el campo de notas después de añadir al carrito
    if (notesField) {
        notesField.value = '';
    }

    updateCartCount();
    
    // Pequeño efecto visual al añadir el artículo
    const itemElement = button.closest('.menu-item');
    itemElement.style.transform = 'scale(0.98)';
    setTimeout(() => {
        itemElement.style.transform = 'translateY(-5px)'; // Vuelve al estado hover
    }, 100);
}

// Función para renderizar el contenido del carrito en el modal
function renderCart() {
    const list = document.getElementById('cart-items-list');
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');

    list.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        list.innerHTML = '<p class="empty-cart">El carrito está vacío. ¡Añade algo delicioso!</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            // Mostrar el nombre del plato y las notas en el carrito
            const notesText = item.notes ? ` (Nota: ${item.notes})` : '';
            const itemName = `${item.name}${notesText}`;

            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <span>${itemName} (${item.quantity}x)</span>
                <span>$${itemTotal.toFixed(2)}</span>
            `;
            list.appendChild(itemDiv);
        });
    }

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Función para actualizar el contador del carrito en el botón
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Función clave: Genera el mensaje del pedido
function generateOrderMessage() {
    let message = "¡Hola, El Rincón Gourmet! Tengo un nuevo pedido:\n\n";
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        // Formateo del artículo
        let notesLine = item.notes ? ` (Nota: ${item.notes})` : "";
        message += `${item.quantity}x ${item.name} - $${itemTotal.toFixed(2)}${notesLine}\n`;
    });

    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    message += "\n--- RESUMEN ---\n";
    message += `Subtotal: $${subtotal.toFixed(2)}\n`;
    message += `Impuestos: $${tax.toFixed(2)}\n`;
    message += `TOTAL A PAGAR: $${total.toFixed(2)}\n\n`;
    message += "Por favor, confírmenme el tiempo de entrega y la dirección. ¡Gracias!";
    
    return message;
}

// FUNCIÓN DE PROCESO DE PEDIDO ACTUALIZADA PARA WHATSAPP
function processOrder() {
    if (cart.length === 0) {
        alert("El carrito está vacío. No puedes proceder con el pago.");
        return;
    }
    
    if (RESTAURANT_PHONE_NUMBER === '5917804051') {
         alert("¡ADVERTENCIA! Debes cambiar el número de teléfono en el archivo script.js para que WhatsApp funcione correctamente.");
    }

    const orderMessage = generateOrderMessage();
    
    // Codifica el mensaje para que sea seguro en una URL
    const encodedMessage = encodeURIComponent(orderMessage);
    
    // Construye la URL de WhatsApp
    const whatsappURL = `https://wa.me/${RESTAURANT_PHONE_NUMBER}?text=${encodedMessage}`;

    // Abre la URL en una nueva pestaña/ventana
    window.open(whatsappURL, '_blank'); 

    // Opcional: Limpia el carrito después de la redirección
    cart = [];
    updateCartCount();
    toggleCart(); // Cierra el modal
}

// Cierra el modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
}