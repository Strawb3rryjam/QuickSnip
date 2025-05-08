document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const photoboothExterior = document.querySelector("photobooth-exterior");
  const appInterior = document.getElementById("appInterior");
  const curtain = document.getElementById("curtain");

  const enterBoothButton = document.getElementById("enterBoothButton");
  const exitBoothButton = document.getElementById("exitBoothButton");

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

  // App State
  let stream = null;
  let photosTaken = 0;
  const maxPhotos = 4;
  let photoElements = [];
  let isCountingDown = false;

  //curtain
  curtain.addEventListener("click", enterBooth);

  const frames = [
    "/assets/curtain1.svg",
    "/assets/curtain2.svg",
    "/assets/curtain3.svg",
    "/assets/curtain4.svg",
  ];

  let interval = null;

  function animateCurtain(forward = true) {
    let index = forward ? 0 : frames.length - 1;

    clearInterval(interval);
    interval = setInterval(() => {
      curtain.src = frames[index];

      if (forward) {
        index++;
        if (index >= frames.length) clearInterval(interval);
      } else {
        index--;
        if (index < 0) clearInterval(interval);
      }
    }, 100); // change frame every 100ms
  }

  curtain.addEventListener("mouseenter", () => animateCurtain(true));
  curtain.addEventListener("mouseleave", () => animateCurtain(false));

  // Photobooth navigation
  enterBoothButton.addEventListener("click", enterBooth);
  exitBoothButton.addEventListener("click", exitBooth);

  // Enter the photobooth
  function enterBooth() {
    const photoboothExterior = document.querySelector(".photobooth-exterior");
    photoboothExterior.classList.add("fade-out");

    setTimeout(() => {
      photoboothExterior.style.display = "none";
      appInterior.style.display = "block";

      // Allow time for DOM update before adding the fade-in class
      setTimeout(() => {
        appInterior.classList.add("fade-in");
      }, 50);
    }, 800);
  }

  // Exit the photobooth
  function exitBooth() {
    // Stop camera if running
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
      // Allow time for DOM update before adding the fade-in class
      setTimeout(() => {
        photoboothExterior.classList.remove("fade-out");
      }, 50);
    }, 800);
  }

  // Start the photobooth
  startButton.addEventListener("click", initCamera);

  // Initialize the camera
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

  // Start the photo taking sequence
  function startPhotoSequence() {
    if (isCountingDown) return;

    isCountingDown = true;
    captureButton.disabled = true;
    startCountdown();
  }

  // Display countdown before taking photo
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

  // Take a photo
  function takePhoto() {
    // Create flash effect
    flash.style.opacity = "0.8";
    setTimeout(() => {
      flash.style.opacity = "0";
    }, 100);

    // Create the canvas to capture the photo
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match the video
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    // Draw the video frame on the canvas, flip horizontally
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);

    // Convert canvas to image
    const imgUrl = canvas.toDataURL("image/jpeg");

    // Add to photostrip
    photosTaken++;
    const photoElement = document.createElement("img");
    photoElement.src = imgUrl;
    photoElement.alt = `Photo ${photosTaken}`;
    photoElements.push(photoElement);

    // Check if we need to take more photos
    if (photosTaken < maxPhotos) {
      // Wait before next photo
      setTimeout(() => {
        isCountingDown = false;
        startCountdown();
      }, 1000);
    } else {
      // We're done taking photos
      finishPhotoSession();
    }
  }

  // Finish photo session and show the photostrip
  function finishPhotoSession() {
    // Stop camera
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }

    // Hide camera UI
    cameraContainer.style.display = "none";
    cameraControls.style.display = "none";

    // Add photos to photostrip
    for (let i = 0; i < photoElements.length; i++) {
      photostrip.appendChild(photoElements[i]);
    }

    // Show photostrip editor
    photostripContainer.style.display = "flex";

    // Initialize the editing tools
    initEditingTools();
  }

  // Initialize editing tools for photostrip
  function initEditingTools() {
    // Color picker functionality
    colorPicker.querySelectorAll(".color").forEach((colorEl) => {
      colorEl.addEventListener("click", () => {
        // Remove selected class from all colors
        colorPicker.querySelectorAll(".color").forEach((el) => {
          el.classList.remove("selected");
        });

        // Add selected class to clicked color
        colorEl.classList.add("selected");

        // Apply color to photostrip
        const selectedColor = colorEl.getAttribute("data-color");
        photostrip.style.backgroundColor = selectedColor;
      });
    });

    // Sticker functionality
    stickerPicker.querySelectorAll(".sticker").forEach((stickerEl) => {
      stickerEl.addEventListener("click", () => {
        addSticker(stickerEl.textContent);
      });
    });

    // Download button
    downloadButton.addEventListener("click", downloadPhotostrip);

    // Reset button
    resetButton.addEventListener("click", resetPhotobooth);
  }

  // Add a draggable sticker to the photostrip
  function addSticker(emoji) {
    const sticker = document.createElement("div");
    sticker.classList.add("draggable-sticker");
    sticker.textContent = emoji;
    sticker.style.left = "50%";
    sticker.style.top = "50%";
    sticker.style.transform = "translate(-50%, -50%)";
    photostrip.appendChild(sticker);

    // Make sticker draggable
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
      const x = e.clientX - photoRect.left - offsetX;
      const y = e.clientY - photoRect.top - offsetY;

      sticker.style.left = `${x}px`;
      sticker.style.top = `${y}px`;
      sticker.style.transform = "none";
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      sticker.style.zIndex = "999";
    });

    // Touch support for mobile
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
      const x = touch.clientX - photoRect.left - offsetX;
      const y = touch.clientY - photoRect.top - offsetY;

      sticker.style.left = `${x}px`;
      sticker.style.top = `${y}px`;
      sticker.style.transform = "none";
      e.preventDefault();
    });

    document.addEventListener("touchend", () => {
      isDragging = false;
      sticker.style.zIndex = "999";
    });
  }

  // Download the photostrip
  function downloadPhotostrip() {
    html2canvas(photostrip).then((canvas) => {
      const link = document.createElement("a");
      link.download = "retro-photostrip.jpg";
      link.href = canvas.toDataURL("image/jpeg", 0.8);
      link.click();
    });
  }

  // Reset the photobooth to start again
  function resetPhotobooth() {
    // Reset counters and arrays
    photosTaken = 0;
    photoElements = [];

    // Clear the photostrip
    const photos = photostrip.querySelectorAll("img");
    const stickers = photostrip.querySelectorAll(".draggable-sticker");

    photos.forEach((photo) => photo.remove());
    stickers.forEach((sticker) => sticker.remove());

    // Reset photostrip color
    photostrip.style.backgroundColor = "white";
    colorPicker.querySelectorAll(".color").forEach((el) => {
      el.classList.remove("selected");
    });
    colorPicker.querySelector('[data-color="white"]').classList.add("selected");

    // Hide photostrip and show start screen
    photostripContainer.style.display = "none";
    startScreen.style.display = "flex";

    // Reset buttons
    captureButton.disabled = false;
    isCountingDown = false;
  }
});
