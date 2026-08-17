(() => {
  const dialog = document.querySelector("[data-process-dialog]");
  const openButton = document.querySelector("[data-dialog-open]");
  const closeButton = document.querySelector("[data-dialog-close]");

  if (!dialog || !openButton || !closeButton) return;

  const open = () => {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  };

  const close = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  openButton.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", event => {
    if (event.target === dialog) close();
  });
})();
