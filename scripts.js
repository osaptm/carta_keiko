document.addEventListener("DOMContentLoaded", function () {

    const cartCounter = document.getElementById("cart-counter");
    const cartIcon = document.getElementById("cart-icon");
    const pescadito = document.getElementById("pescadito");

    const cartModal = document.getElementById("cart-modal");
    const closeModal = document.querySelector(".close");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    let cart = [];
    try {
        const storedCart = localStorage.getItem("carrito");
        cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.warn("Error accessing localStorage:", e);
        cart = [];
    }

    let totalItems = cart.reduce((total, item) => total + item.cantidad, 0);
    cartCounter.textContent = totalItems;

    const backToTopContainer = document.querySelector(".back-to-top-container");

    // Abrir el modal cuando se haga clic en el carrito general
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            updateCartModal();
            cartModal.style.display = "flex";
        });
    }

    // Cerrar el modal cuando se haga clic en la "X"
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            cartModal.style.display = "none";
            // No recargamos la página, solo actualizamos los contadores
            restoreProductCounters();
        });
    }

    // Cerrar el modal si el usuario hace clic fuera de él (usando click para mejor compatibilidad con WebView)
    document.addEventListener("click", (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = "none";
            restoreProductCounters();
        }
    });

    // También agregamos soporte para touch en dispositivos móviles
    document.addEventListener("touchstart", (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = "none";
            restoreProductCounters();
        }
    });

    // Función para actualizar el modal con los productos del carrito
    function updateCartModal() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let itemsCount = 0;

        cart.forEach((item, index) => {
            let subtotal = item.precio * item.cantidad;
            total += subtotal;
            itemsCount += item.cantidad;

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
        cartCounter.textContent = itemsCount;
        totalItems = itemsCount;

        // Actualizar todos los badges de productos después de modificar el carrito
        updateAllProductCounters();
    }

    // Manejar los botones "+" y "-" dentro del modal
    cartItemsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("plus") || event.target.classList.contains("minus")) {
            const index = parseInt(event.target.getAttribute("data-index"));
            const productName = cart[index]?.nombre; // Guardar nombre antes de modificar

            if (event.target.classList.contains("plus")) {
                cart[index].cantidad++;
            } else {
                cart[index].cantidad--;
                if (cart[index].cantidad <= 0) {
                    cart.splice(index, 1); // Eliminar producto si la cantidad es 0
                }
            }

            saveCart();
            updateCartModal();

            // Actualizar el badge del producto específico que fue modificado
            if (productName) {
                updateSpecificProductCounter(productName);
            }
        }
    });

    // Función helper para guardar carrito
    function saveCart() {
        try {
            localStorage.setItem("carrito", JSON.stringify(cart));
        } catch (e) {
            console.warn("Error saving to localStorage:", e);
        }
    }

    // Manejo del botón "Vaciar Carrito"
    const clearCartBtn = document.getElementById("clear-cart");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            cart = [];
            try {
                localStorage.removeItem("carrito");
            } catch (e) {
                console.warn("Error removing from localStorage:", e);
            }
            updateCartModal();
            document.getElementById("cart-counter").textContent = "0";

            // Ocultar todos los badges de productos
            hideAllProductCounters();

            // Agregar la clase para el efecto de palpitación
            const cartContainer = document.getElementById("cart-container");
            if (cartContainer) {
                cartContainer.classList.add("palpitar");
                setTimeout(() => {
                    cartContainer.classList.remove("palpitar");
                }, 1000);
            }
        });
    }

    // Manejo del botón "Realizar Pedido"
    const checkoutBtn = document.getElementById("checkout");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                showAlert("Tu carrito está vacío. Agrega productos antes de realizar el pedido.");
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

            // Abrir WhatsApp - CORREGIDO: usar window.open en lugar de document.open
            window.open(urlWhatsApp, "_blank");

            // Limpiar el carrito después de enviar el pedido
            cart = [];
            try {
                localStorage.removeItem("carrito");
            } catch (e) {
                console.warn("Error removing from localStorage:", e);
            }
            document.getElementById("cart-counter").textContent = "0";

            // Cerrar el modal
            document.getElementById("cart-modal").style.display = "none";

            // Notificar a la app nativa si existe
            sendToApp({ action: "order_completed" });
        });
    }

    // Función para desplazarse a una sección (versión global)
    window.scrollToSection = function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
        // Notificar a la app nativa
        sendToApp({ action: "scroll_to", section: sectionId });
    };

    // Versión alternativa para myScrollToSection
    window.myScrollToSection = function (sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
        // Notificar a la app nativa
        sendToApp({ action: "scroll_to", section: sectionId });
    };

    // Mostrar/ocultar el botón para volver al inicio
    // CORREGIDO: usar window.addEventListener en lugar de document
    window.addEventListener("scroll", () => {
        const categoriesSection = document.getElementById("inicio");
        if (categoriesSection) {
            const categoriesBottom = categoriesSection.getBoundingClientRect().bottom;
            if (categoriesBottom < 0) {
                backToTopContainer.style.display = "block";
            } else {
                backToTopContainer.style.display = "none";
            }
        }
    });

    // Hacer clic en el botón para volver al inicio
    if (backToTopContainer) {
        backToTopContainer.addEventListener("click", () => {
            window.scrollToSection("inicio");
        });
    }

    // Función para actualizar el contador de cada producto
    function updateProductCounter(productCard) {
        let cartContainer = productCard.querySelector(".cart-container");

        if (!cartContainer) {
            // Crear contenedor del carrito si no existe
            cartContainer = document.createElement("div");
            cartContainer.classList.add("cart-container");

            const cartIcon = productCard.querySelector(".add-to-cart");
            if (cartIcon && cartIcon.parentNode) {
                cartIcon.parentNode.replaceChild(cartContainer, cartIcon);
                cartContainer.appendChild(cartIcon);
            }
        }

        let counter = cartContainer.querySelector(".product-counter");
        if (!counter) {
            // Si no existe, creamos el contador
            counter = document.createElement("span");
            counter.classList.add("product-counter");
            cartContainer.appendChild(counter);
        }

        // Obtener el nombre del producto
        const productNameElement = productCard.querySelector("h3");
        if (!productNameElement) return;

        const productName = productNameElement.textContent;
        const productInCart = cart.find(item => item.nombre === productName);

        // Actualizar el contador en la tarjeta
        if (productInCart) {
            counter.textContent = `x${productInCart.cantidad}`;
            counter.style.display = "flex"; // Asegurar que sea visible
        } else {
            counter.textContent = "";
            counter.style.display = "none";
        }
    }

    // Restaurar contadores de cada producto en la página después de recargar
    function restoreProductCounters() {
        cart.forEach(producto => {
            const productCards = document.querySelectorAll(".product-card");
            productCards.forEach(card => {
                const h3Element = card.querySelector("h3");
                if (h3Element && h3Element.textContent === producto.nombre) {
                    updateProductCounter(card);
                }
            });
        });
    }

    // Función para actualizar el contador de un producto específico por nombre
    function updateSpecificProductCounter(productName) {
        const productCards = document.querySelectorAll(".product-card");
        productCards.forEach(card => {
            const h3Element = card.querySelector("h3");
            if (h3Element && h3Element.textContent === productName) {
                updateProductCounter(card);
            }
        });
    }

    // Función para actualizar TODOS los contadores de productos
    function updateAllProductCounters() {
        const productCards = document.querySelectorAll(".product-card");
        productCards.forEach(card => {
            updateProductCounter(card);
        });
    }

    // Función para ocultar todos los contadores de productos (cuando se vacía el carrito)
    function hideAllProductCounters() {
        const allCounters = document.querySelectorAll(".product-counter");
        allCounters.forEach(counter => {
            counter.textContent = "";
            counter.style.display = "none";
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
            if (!productCard) return;

            const productNameElement = productCard.querySelector("h3");
            const priceElement = productCard.querySelector(".price");

            if (!productNameElement || !priceElement) return;

            const productName = productNameElement.textContent;
            const priceText = priceElement.textContent.replace("S/.", "").replace(",", ".");
            const productPrice = parseFloat(priceText);

            if (isNaN(productPrice)) {
                console.error("Error parsing price:", priceText);
                return;
            }

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

            // Agregar la clase para el efecto de palpitación
            const cartContainer = document.getElementById("cart-container");
            if (cartContainer) {
                cartContainer.classList.add("palpitar");
                setTimeout(() => {
                    cartContainer.classList.remove("palpitar");
                }, 1000);
            }

            updateProductCounter(productCard);
            saveCart();

            console.clear();
            console.table(cart);

            // Animar el pescadito
            animatePescadito(event);
        });
    });

    // Función para animar el pescadito
    function animatePescadito(event) {
        if (!pescadito || !cartIcon) return;

        const rectButton = event.target.getBoundingClientRect();
        const rectCart = cartIcon.getBoundingClientRect();

        // Usar window.scrollX/Y en lugar de document.scrollX/Y para mejor compatibilidad
        const scrollX = window.scrollX || window.pageXOffset || 0;
        const scrollY = window.scrollY || window.pageYOffset || 0;

        // Posición inicial del pescadito
        pescadito.style.left = `${rectButton.left + scrollX + rectButton.width / 2}px`;
        pescadito.style.top = `${rectButton.top + scrollY}px`;
        pescadito.style.display = "block";

        // Destino del carrito
        const cartX = rectCart.left + scrollX;
        const cartY = rectCart.top + scrollY;

        // Verificar si GSAP está disponible (para WebView que cargan desde CDN)
        if (typeof gsap !== "undefined") {
            gsap.fromTo(
                pescadito,
                { x: 0, y: 0, rotation: 0, scale: 1 },
                {
                    x: (cartX - rectButton.left - scrollX) / 2,
                    y: -100,
                    rotation: 360,
                    scale: 1.8,
                    duration: 1.2,
                    ease: "power1.out",
                    onComplete: () => {
                        gsap.to(pescadito, {
                            x: cartX - rectButton.left - scrollX,
                            y: cartY - rectButton.top - scrollY,
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
        } else {
            // Fallback simple si GSAP no está disponible
            pescadito.style.transition = "all 1s ease";
            pescadito.style.left = `${cartX}px`;
            pescadito.style.top = `${cartY}px`;
            pescadito.style.transform = "scale(0.5)";

            setTimeout(() => {
                pescadito.style.display = "none";
                pescadito.style.transition = "";
                pescadito.style.transform = "scale(1)";
            }, 1000);
        }
    }

    // Notificar a la app que la página está lista
    sendToApp({ action: "page_ready" });
});

// Receptor universal para ambas plataformas
window.receiveFromApp = function (message) {
    console.log("Mensaje recibido de la app:", message);

    // Intentar parsear si es string
    let data = message;
    if (typeof message === "string") {
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.warn("Could not parse message as JSON:", message);
        }
    }

    // Manejar diferentes acciones
    if (data && data.action) {
        switch (data.action) {
            case "clear_cart":
                try {
                    localStorage.removeItem("carrito");
                    location.reload();
                } catch (e) {
                    console.warn("Error clearing cart:", e);
                }
                break;
            case "get_cart":
                let cart = [];
                try {
                    const storedCart = localStorage.getItem("carrito");
                    cart = storedCart ? JSON.parse(storedCart) : [];
                } catch (e) {
                    console.warn("Error reading cart:", e);
                }
                sendToApp({ action: "cart_data", data: cart });
                break;
            case "scroll_to":
                if (data.section) {
                    const section = document.getElementById(data.section);
                    if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                    }
                }
                break;
            default:
                console.log("Unknown action:", data.action);
        }
    }
};

// Enviar a la app (compatible con Android/iOS)
window.sendToApp = function (message) {
    try {
        const messageString = typeof message === "string" ? message : JSON.stringify(message);

        // Android
        if (window.AndroidApp && typeof window.AndroidApp.postMessage === "function") {
            window.AndroidApp.postMessage(messageString);
            return true;
        }
        // iOS WKWebView
        else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosListener) {
            window.webkit.messageHandlers.iosListener.postMessage(messageString);
            return true;
        }
        // iOS UIWebView (legacy)
        else if (window.iosListener && typeof window.iosListener.postMessage === "function") {
            window.iosListener.postMessage(messageString);
            return true;
        }

        // No hay puente disponible - solo log en consola
        console.log("No native bridge available. Message would be sent:", message);
        return false;
    } catch (e) {
        console.error("Error sending to app:", e);
        return false;
    }
};

// Función helper para mostrar alertas (con fallback para WebView)
function showAlert(message) {
    if (typeof alert !== "undefined") {
        alert(message);
    } else {
        console.warn("Alert not available, message:", message);
        // En WebView modernos, podríamos enviar a la app nativa
        sendToApp({ action: "show_alert", message: message });
    }
}
