document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const curtain = document.getElementById("curtain");

  if (curtain) {
    const frames = [
      "assets/curtain1.svg",
      "assets/curtain2.svg",
      "assets/curtain3.svg",
      "assets/curtain4.svg",
    ];

    let interval = 0;

    function animateCurtain(forward = true) {
      let index = forward ? 0 : frames.length - 1;
      clearInterval(interval);
      interval = setInterval(() => {
        curtain.src = frames[index];
        index = forward ? index + 1 : index - 1;
        if (index < 0 || index >= frames.length) clearInterval(interval);
      }, 100);
    }

    curtain.addEventListener("mouseenter", () => animateCurtain(true));
    curtain.addEventListener("mouseleave", () => animateCurtain(false));

    // 👉 Navigate to photobooth.html on click
    curtain.addEventListener("click", () => {
      window.location.href = "photobooth.html";
    });
  } else {
    console.error("Curtain element not found!");
  }

  // back to home button
  const homeButton = document.getElementById("home");
  if (homeButton) {
    homeButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

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

  // Start the photobooth
  if (startButton) {
    startButton.addEventListener("click", initCamera);
  }

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
    if (photosTaken >= maxPhotos) return;

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

    // Show printing overlay
    const printingOverlay = document.createElement("div");
    printingOverlay.className = "printing-overlay active";

    const printingMessage = document.createElement("div");
    printingMessage.className = "printing-message";
    printingMessage.textContent = "Printing your photos...";

    printingOverlay.appendChild(printingMessage);
    document.body.appendChild(printingOverlay);

    // Play printer sound
    const printerSound = document.getElementById("printerSound");
    if (printerSound) {
      printerSound.play();
    } else {
      // Fallback if the element doesn't exist in HTML
      const audioElement = document.createElement("audio");
      audioElement.className = "printer-sound";
      audioElement.src = "assets/printer-sound.mp3";
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
    }

    // Show photostrip container
    photostripContainer.style.display = "flex";

    // Add the printing class to photostrip
    photostrip.classList.add("printing");

    // Add printing class to branding
    const branding = photostrip.querySelector(".photostrip-branding");
    if (branding) {
      branding.classList.add("printing");
    }

    // Add photos to photostrip with a delay for the animation
   // Add photos to photostrip with a delay for the animation (top to bottom)
setTimeout(() => {
  let i = 0;

  function addNextPhoto() {
    if (i < photoElements.length) {
      const photo = photoElements[i];
      photo.classList.add("photo"); // add animation class
      photostrip.appendChild(photo);
      i++;
      setTimeout(addNextPhoto, 500); // delay between each photo
    } else {
      // All photos added, now clean up overlay and init tools
      setTimeout(() => {
        printingOverlay.classList.remove("active");
        setTimeout(() => {
          printingOverlay.remove();
          const sound = document.querySelector(".printer-sound");
          if (sound) sound.remove();
        }, 500);
      }, 3200);

      initEditingTools();
    }
  }

  addNextPhoto();
}, 300);


      // Initialize the editing tools
      initEditingTools();
    }, 300);


  // Initialize editing tools for photostrip
  function initEditingTools() {
    // Color picker functionality
    if (colorPicker) {
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
    }

    // Sticker functionality
    if (stickerPicker) {
      stickerPicker.querySelectorAll(".sticker").forEach((stickerEl) => {
        stickerEl.addEventListener("click", () => {
          addSticker(stickerEl.textContent);
        });
      });
    }

    // Download button
    if (downloadButton) {
      downloadButton.addEventListener("click", downloadPhotostrip);
    }

    // Reset button
    if (resetButton) {
      resetButton.addEventListener("click", resetPhotobooth);
    }
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
    // Remove printing class if it exists
    photostrip.classList.remove("printing");

    // Get all stickers to make sure they're included in the download
    const stickers = photostrip.querySelectorAll(".draggable-sticker");
    stickers.forEach((sticker) => {
      sticker.style.position = "absolute"; // Ensure position is maintained in screenshot
    });

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

    // Remove printing classes
    photostrip.classList.remove("printing");
    const branding = photostrip.querySelector(".photostrip-branding");
    if (branding) {
      branding.classList.remove("printing");
    }

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
