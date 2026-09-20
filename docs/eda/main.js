const slidePicker = document.querySelector("#slide-picker");
const openSlidePicker = document.querySelector("#open-slide-picker");
const closeSlidePicker = document.querySelector("#close-slide-picker");
const cancelSlidePicker = document.querySelector("#cancel-slide-picker");
const openSelectedWeek = document.querySelector("#open-selected-week");

if (slidePicker && openSlidePicker) {
  openSlidePicker.addEventListener("click", () => slidePicker.showModal());

  [closeSlidePicker, cancelSlidePicker].forEach((button) => {
    button?.addEventListener("click", () => slidePicker.close());
  });

  openSelectedWeek?.addEventListener("click", () => {
    const selectedWeek = slidePicker.querySelector('input[name="lecture-week"]:checked');
    if (selectedWeek) window.location.href = selectedWeek.value;
  });

  slidePicker.addEventListener("click", (event) => {
    if (event.target === slidePicker) slidePicker.close();
  });
}

