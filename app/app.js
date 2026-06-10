const productPrice = 129;
const expressShipping = 15;

const cartCount = document.querySelector("[data-testid='cart-count']");
const subtotal = document.querySelector("[data-testid='subtotal']");
const shippingCost = document.querySelector("[data-testid='shipping-cost']");
const orderTotal = document.querySelector("[data-testid='order-total']");
const statusBanner = document.querySelector("[data-testid='order-status']");
const addToCartButton = document.querySelector("[data-testid='add-to-cart']");
const shippingButtons = Array.from(document.querySelectorAll("[data-shipping]"));
const placeOrderButton = document.querySelector("[data-testid='place-order']");

const state = {
  cartCount: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  cartReady: false,
  shippingReady: false,
  shippingSelection: "standard",
};

function currency(value) {
  return `$${value.toFixed(2)}`;
}

// The delays are the point of the demo: the UI completes in a random window,
// so fixed sleeps race the app while state-based waits stay stable.
function jitter() {
  return 100 + Math.floor(Math.random() * 220);
}

function setStatus(message, nextState = "working") {
  statusBanner.dataset.state = nextState;
  statusBanner.textContent = message;
}

function render() {
  cartCount.textContent = String(state.cartCount);
  subtotal.textContent = currency(state.subtotal);
  shippingCost.textContent = currency(state.shipping);
  orderTotal.textContent = currency(state.total);

  shippingButtons.forEach((button) => {
    button.dataset.active = String(button.dataset.shipping === state.shippingSelection);
  });
}

function addToCart() {
  state.cartReady = false;
  state.shippingReady = false;
  state.shipping = 0;
  state.shippingSelection = "standard";
  setStatus("Adding item to cart...");
  render();

  window.setTimeout(() => {
    state.cartCount = 1;
    state.subtotal = productPrice;
    state.total = productPrice;
    state.cartReady = true;
    setStatus("Ready for shipping", "ready");
    render();
  }, jitter());
}

function selectShipping(shippingType) {
  if (!state.cartReady) {
    setStatus("Cart update still in progress...");
    return;
  }

  state.shippingReady = false;
  state.shippingSelection = shippingType;
  setStatus(`Applying ${shippingType} shipping...`);
  render();

  window.setTimeout(() => {
    state.shipping = shippingType === "express" ? expressShipping : 0;
    state.total = state.subtotal + state.shipping;
    state.shippingReady = true;
    setStatus("Shipping updated", "ready");
    render();
  }, jitter());
}

function placeOrder() {
  if (!state.cartReady) {
    setStatus("Cart is not ready yet.");
    return;
  }

  setStatus("Submitting order...");

  window.setTimeout(() => {
    setStatus("Order confirmed", "confirmed");
  }, 80);
}

addToCartButton.addEventListener("click", addToCart);
shippingButtons.forEach((button) => {
  button.addEventListener("click", () => selectShipping(button.dataset.shipping));
});
placeOrderButton.addEventListener("click", placeOrder);

render();
