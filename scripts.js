
document.addEventListener("DOMContentLoaded", function () {

      const cartCounter = document.getElementById("cart-counter");
      const cartIcon = document.getElementById("cart-icon");
      const pescadito = document.getElementById("pescadito");
  
      const cartModal = document.getElementById("cart-modal");
      const closeModal = document.querySelector(".close");
      const cartItemsContainer = document.getElementById("cart-items");
      const cartTotal = document.getElementById("cart-total");
  
  
      let cart = JSON.parse(localStorage.getItem("carrito")) || [];
      let totalItems = cart.reduce((total, item) => total + item.cantidad, 0);
      cartCounter.textContent = totalItems;
  
      const backToTopContainer = document.querySelector(".back-to-top-container");
  
  
     // Abrir el modal cuando se haga clic en el carrito general
     cartIcon.addEventListener("click", () => {
      updateCartModal();
      cartModal.style.display = "flex";
  });
  
  // Cerrar el modal cuando se haga clic en la "X"
  closeModal.addEventListener("click", () => {
      cartModal.style.display = "none";
      location.reload(); // Recargar la página al cerrar el modal
  });
  
  
  // Cerrar el modal si el usuario hace clic fuera de él
  document.addEventListener("pointerdown", (event) => {
      if (event.target === cartModal) {
          cartModal.style.display = "none";
          location.reload();
      }
  });
  
    
  // Función para actualizar el modal con los productos del carrito
  function updateCartModal() {
      cartItemsContainer.innerHTML = "";
      let total = 0;
  
      cart.forEach((item, index) => {
          let subtotal = item.precio * item.cantidad;
          total += subtotal;
  
          let row = document.createElement("tr");
  
          row.innerHTML = `
              <td>${item.cantidad}</td>
              <td>${item.nombre}</td>
              <td>S/.${item.precio.toFixed(2)}</td>
              <td>S/.${subtotal.toFixed(2)}</td>
              <td>
                  <button class="btn-action plus" data-index="${index}">+</button>
                  <button class="btn-action minus" data-index="${index}">-</button>
              </td>
          `;
  
          cartItemsContainer.appendChild(row);
      });
  
      cartTotal.textContent = total.toFixed(2);
  }
  
  // Manejar los botones "+" y "-" dentro del modal
  cartItemsContainer.addEventListener("click", (event) => {
      if (event.target.classList.contains("plus") || event.target.classList.contains("minus")) {
          const index = event.target.getAttribute("data-index");
          if (event.target.classList.contains("plus")) {
              cart[index].cantidad++;
          } else {
              cart[index].cantidad--;
              if (cart[index].cantidad <= 0) {
                  cart.splice(index, 1); // Eliminar producto si la cantidad es 0
              }
          }
  
          localStorage.setItem("carrito", JSON.stringify(cart));
          updateCartModal();
      }
  });
  
  // Manejo del botón "Vaciar Carrito"
  document.getElementById("clear-cart").addEventListener("click", () => {
      cart = [];
      localStorage.removeItem("carrito");
      updateCartModal();
      document.getElementById("cart-counter").textContent = "0";

    // *** Agregar la clase para el efecto de palpitación ***
    const cartContainer = document.getElementById("cart-container");
    cartContainer.classList.add("palpitar");

    // Remover la clase después de la animación
    setTimeout(() => {
        cartContainer.classList.remove("palpitar");
    }, 1000);


  });
  
  // Manejo del botón "Realizar Pedido"
  document.getElementById("checkout").addEventListener("click", () => {
      if (cart.length === 0) {
          alert("Tu carrito está vacío. Agrega productos antes de realizar el pedido.");
          return;
      }
  
      // Número de WhatsApp (sin espacios ni símbolos)
      const numeroWhatsApp = "955818631";
  
      // Mensaje base
      let mensaje = "Hola, quisiera que me atiendan con mi pedido:\n\n";
  
      // Agregar cada producto al mensaje
      cart.forEach(item => {
          mensaje += `* ${item.cantidad} - ${item.nombre} \n`;
      });
  
      // Codificar mensaje para URL
      const mensajeCodificado = encodeURIComponent(mensaje);
  
      // Generar enlace de WhatsApp
      const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
  
      // Redirigir al usuario a WhatsApp
      document.open(urlWhatsApp, "_blank");
  
      // Limpiar el carrito después de enviar el pedido
      cart = [];
      localStorage.removeItem("carrito");
      document.getElementById("cart-counter").textContent = "0";
  
      // Cerrar el modal y recargar la página para actualizar la interfaz
      document.getElementById("cart-modal").style.display = "none";
      location.reload();
  });
  
  
  
  
      // Función para desplazarse a una sección
      window.scrollToSection = function (sectionId) {
         alert("OK");
          const section = document.getElementById(sectionId);
          if (section) {
              section.scrollIntoView({ behavior: "smooth" });
          }
      };

      function myScrollToSection(sectionId){
        alert("OK");
         const section = document.getElementById(sectionId);
         if (section) {
             section.scrollIntoView({ behavior: "smooth" });
         }
     };
  
      // Mostrar/ocultar el botón para volver al inicio
  
      document.addEventListener("scroll", () => {
      const categoriesSection = document.getElementById("inicio");
      const categoriesBottom = categoriesSection.getBoundingClientRect().bottom;
  
      if (categoriesBottom < 0) {
          backToTopContainer.style.display = "block";
      } else {
          backToTopContainer.style.display = "none";
      }
  });
  
  // Hacer clic en el botón para volver al inicio
  backToTopContainer.addEventListener("click", () => {
      scrollToSection("inicio");
  });
  
      // Función para actualizar el contador de cada producto
      function updateProductCounter(productCard) {
          let cartContainer = productCard.querySelector(".cart-container");
  
          if (!cartContainer) {
              // Crear contenedor del carrito si no existe
              cartContainer = document.createElement("div");
              cartContainer.classList.add("cart-container");
  
              const cartIcon = productCard.querySelector(".add-to-cart");
              cartIcon.parentNode.replaceChild(cartContainer, cartIcon);
              cartContainer.appendChild(cartIcon);
          }
  
          let counter = cartContainer.querySelector(".product-counter");
          if (!counter) {
              // Si no existe, creamos el contador
              counter = document.createElement("span");
              counter.classList.add("product-counter");
              cartContainer.appendChild(counter);
          }
  
          // Obtener el nombre del producto
          const productName = productCard.querySelector("h3").textContent;
          const productInCart = cart.find(item => item.nombre === productName);
  
          // Actualizar el contador en la tarjeta
          if (productInCart) {
              counter.textContent = `x${productInCart.cantidad}`;
              counter.style.display = "flex"; // Asegurar que sea visible
          }
      }
  
      // Restaurar contadores de cada producto en la página después de recargar
      function restoreProductCounters() {
          cart.forEach(producto => {
              const productCard = [...document.querySelectorAll(".product-card")].find(
                  card => card.querySelector("h3").textContent === producto.nombre
              );
              if (productCard) {
                  updateProductCounter(productCard);
              }
          });
      }
  
      // Llamar a la función para restaurar contadores al cargar la página
      restoreProductCounters();
  
      console.clear();
      console.table(cart);
  
      // Agregar funcionalidad de agregar productos al carrito
      document.querySelectorAll(".add-to-cart").forEach(button => {
          button.addEventListener("click", function (event) {
              const productCard = event.target.closest(".product-card");
              const productName = productCard.querySelector("h3").textContent;
              const productPrice = parseFloat(productCard.querySelector(".price").textContent.replace("S/.", ""));
  
              let productIndex = cart.findIndex(item => item.nombre === productName);
  
              if (productIndex !== -1) {
                  cart[productIndex].cantidad += 1;
              } else {
                  cart.push({
                      nombre: productName,
                      precio: productPrice,
                      cantidad: 1
                  });
              }
  
              totalItems++;
              cartCounter.textContent = totalItems;


                 // *** Agregar la clase para el efecto de palpitación ***
                const cartContainer = document.getElementById("cart-container");
                cartContainer.classList.add("palpitar");

                // Remover la clase después de la animación
                setTimeout(() => {
                    cartContainer.classList.remove("palpitar");
                }, 1000);


              
  
              updateProductCounter(productCard);
  
              // Guardar el carrito actualizado en localStorage
              localStorage.setItem("carrito", JSON.stringify(cart));
  
              console.clear();
              console.table(cart);
  
              animatePescadito(event, cartIcon);
          });
      });
  
      // Función para animar el pescadito

function animatePescadito(event, cartIcon) {
    const rectButton = event.target.getBoundingClientRect();
    const rectCart = cartIcon.getBoundingClientRect();
    
    // Posición inicial del pescadito
    pescadito.style.left = `${rectButton.left + document.scrollX + rectButton.width / 2}px`;
    pescadito.style.top = `${rectButton.top + document.scrollY}px`;
    pescadito.style.display = "block";

    // Destino del carrito
    const cartX = rectCart.left + document.scrollX;
    const cartY = rectCart.top + document.scrollY;

    gsap.fromTo(
        pescadito,
        { x: 0, y: 0, rotation: 0, scale: 1 },
        {
            x: (cartX - rectButton.left - document.scrollX) / 2,  // Corrección en X
            y: -100,  // Movimiento hacia arriba
            rotation: 360,
            scale: 1.8,
            duration: 1.2,
            ease: "power1.out",
            onComplete: () => {
                gsap.to(pescadito, {
                    x: cartX - rectButton.left - document.scrollX, // Corrección en X
                    y: cartY - rectButton.top - document.scrollY, // Corrección en Y
                    rotation: 0,
                    scale: 1,
                    duration: 1,
                    ease: "power1.in",
                    onComplete: () => {
                        pescadito.style.display = "none";
                    },
                });
            },
        }
    );
}

// Receptor universal para ambas plataformas
function receiveFromApp(message) {
    alert("Mensaje recibido:", message);
}

// Enviar a la app (compatible con Android/iOS)
function sendToApp(message) {
    try {
        // Android
        if (window.AndroidApp) {
            AndroidApp.postMessage(JSON.stringify(message));
        } 
        // iOS
        else if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.iosListener.postMessage(JSON.stringify(message));
        }
    } catch (e) {
        alert("Error sending to app:", e);
    }
}

 });
  
  