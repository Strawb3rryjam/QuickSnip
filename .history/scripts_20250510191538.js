document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const startScreen = document.getElementById("startScreen");
  const cameraContainer = document.getElementById("cameraContainer");
  const camera = document.getElementById("camera");
  const captureButton = document.getElementById("captureButton");
  const startButton = document.getElementById("startButton");
  const cameraControls = document.getElementById("cameraControls");
  const countdown = document.getElementById("countdown");
  const flash = document.getElementById("flash");
  const photostripContainer = document.getElementById("photostripContainer");
  const photostrip = document.getElementById("photostrip");
  const downloadButton = document.getElementById("downloadButton");
  const resetButton = document.getElementById("resetButton");
  const colorPicker = document.getElementById("colorPicker");
  const stickerPicker = document.getElementById("stickerPicker");
  const loadingMessage = document.getElementById("loadingMessage");

  // Optional navigation buttons (used only on index.html)
  const photoboothExterior = document.getElementById("photoboothExterior");
  const appInterior = document.getElementById("appInterior");
  const enterBoothButton = document.getElementById("enterBoothButton");
  const exitBoothButton = document.getElementById("exitBoothButton");

  // App State
  let stream = null;
  let photosTaken = 0;
  const maxPhotos = 4;
  let photoElements = [];
  let isCountingDown = false;

  // Navigation (only if elements exist)
  if (enterBoothButton) {
    enterBoothButton.addEventListener("click", enterBooth);
  }

  if (exitBoothButton) {
    exitBoothButton.addEventListener("click", exitBooth);
  }

  function enterBooth() {
    if (!photoboothExterior || !appInterior) return;

    photoboothExterior.classList.add("fade-out");

    setTimeout(() => {
      photoboothExterior.style.display = "none";
      appInterior.style.display = "block";

      setTimeout(() => {
        appInterior.classList.add("fade-in");
      }, 50);
    }, 800);
  }

  function exitBooth() {
    if (!appInterior || !photoboothExterior) return;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    appInterior.classList.remove("fade-in");
    appInterior.classList.add("fade-out");

    setTimeout(() => {
      appInterior.style.display = "none";
      resetPhotobooth();

      photoboothExterior.style.display = "flex";
      setTimeout(() => {
        photoboothExterior.classList.remove("fade-out");
      }, 50);
    }, 800);
  }

  // Start button
  if (startButton) {
    startButton.addEventListener("click", initCamera);
  }

  async function initCamera() {
    startScreen.style.display = "none";
    cameraContainer.style.display = "block";

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      camera.srcObject = stream;
      loadingMessage.style.display = "none";
      cameraControls.style.display = "flex";
      captureButton.addEventListener("click", startPhotoSequence);
    } catch (err) {
      loadingMessage.textContent = "Camera access denied or not available :(";
      console.error("Error accessing camera:", err);
    }
  }

  function startPhotoSequence() {
    if (isCountingDown) return;

    isCountingDown = true;
    captureButton.disabled = true;
    startCountdown();
  }

  function startCountdown() {
    let count = 3;
    countdown.textContent = count;
    countdown.style.display = "block";

    const countInterval = setInterval(() => {
      count--;

      if (count > 0) {
        countdown.textContent = count;
      } else {
        clearInterval(countInterval);
        countdown.style.display = "none";
        takePhoto();
      }
    }, 1000);
  }

  function takePhoto() {
    if (!camera || photosTaken >= maxPhotos) return;

    flash.style.opacity = "0.8";
    setTimeout(() => {
      flash.style.opacity = "0";
    }, 100);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    const imgUrl = canvas.toDataURL("image/jpeg");

    photosTaken++;
    const photoElement = document.createElement("img");
    photoElement.src = imgUrl;
    photoElement.alt = `Photo ${photosTaken}`;
    photoElements.push(photoElement);

    if (photosTaken < maxPhotos) {
      setTimeout(() => {
        isCountingDown = false;
        startCountdown();
      }, 1000);
    } else {
      finishPhotoSession();
    }
  }

  function finishPhotoSession() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    cameraContainer.style.display = "none";
    cameraControls.style.display = "none";

    for (let i = 0; i < photoElements.length; i++) {
      photostrip.appendChild(photoElements[i]);
    }

    photostripContainer.style.display = "flex";
    initEditingTools();
  }

  function initEditingTools() {
    if (colorPicker) {
      colorPicker.querySelectorAll(".color").forEach((colorEl) => {
        colorEl.addEventListener("click", () => {
          colorPicker
            .querySelectorAll(".color")
            .forEach((el) => el.classList.remove("selected"));
          colorEl.classList.add("selected");
          const selectedColor = colorEl.getAttribute("data-color");
          photostrip.style.backgroundColor = selectedColor;
        });
      });
    }

    if (stickerPicker) {
      stickerPicker.querySelectorAll(".sticker").forEach((stickerEl) => {
        stickerEl.addEventListener("click", () => {
          addSticker(stickerEl.textContent);
        });
      });
    }

    if (downloadButton) {
      downloadButton.addEventListener("click", downloadPhotostrip);
    }

    if (resetButton) {
      resetButton.addEventListener("click", resetPhotobooth);
    }
  }

  function addSticker(emoji) {
    const sticker = document.createElement("div");
    sticker.classList.add("draggable-sticker");
    sticker.textContent = emoji;
    sticker.style.left = "50%";
    sticker.style.top = "50%";
    sticker.style.transform = "translate(-50%, -50%)";
    photostrip.appendChild(sticker);

    let isDragging = false;
    let offsetX, offsetY;

    sticker.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = sticker.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      sticker.style.zIndex = "1000";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const photoRect = photostrip.getBoundingClientRect();
      sticker.style.left = `${e.clientX - photoRect.left - offsetX}px`;
      sticker.style.top = `${e.clientY - photoRect.top - offsetY}px`;
      sticker.style.transform = "none";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      sticker.style.zIndex = "999";
    });

    sticker.addEventListener("touchstart", (e) => {
      isDragging = true;
      const touch = e.touches[0];
      const rect = sticker.getBoundingClientRect();
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;
      sticker.style.zIndex = "1000";
      e.preventDefault();
    });

    document.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const photoRect = photostrip.getBoundingClientRect();
      sticker.style.left = `${touch.clientX - photoRect.left - offsetX}px`;
      sticker.style.top = `${touch.clientY - photoRect.top - offsetY}px`;
      sticker.style.transform = "none";
      e.preventDefault();
    });

    document.addEventListener("touchend", () => {
      isDragging = false;
      sticker.style.zIndex = "999";
    });
  }

  function downloadPhotostrip() {
    html2canvas(photostrip).then((canvas) => {
      const link = document.createElement("a");
      link.download = "retro-photostrip.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.8);
      link.click();
    });
  }

  function resetPhotobooth() {
    photosTaken = 0;
    photoElements = [];

    const photos = photostrip.querySelectorAll("img");
    const stickers = photostrip.querySelectorAll(".draggable-sticker");

    photos.forEach((photo) => photo.remove());
    stickers.forEach((sticker) => sticker.remove());

    photostrip.style.backgroundColor = "white";
    if (colorPicker) {
      colorPicker
        .querySelectorAll(".color")
        .forEach((el) => el.classList.remove("selected"));
      const white = colorPicker.querySelector('[data-color="white"]');
      if (white) white.classList.add("selected");
    }

    photostripContainer.style.display = "none";
    startScreen.style.display = "flex";

    captureButton.disabled = false;
    isCountingDown = false;
  }
});
