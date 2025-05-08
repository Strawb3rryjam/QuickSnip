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
  document.addEventListener("DOMContentLoaded", () => {
    const homeButton = document.getElementById("home");
    if (homeButton) {
      homeButton.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }
  });

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

  // Show printing overlay
  const printingOverlay = document.createElement('div');
  printingOverlay.className = 'printing-overlay active';
  
  const printingMessage = document.createElement('div');
  printingMessage.className = 'printing-message';
  printingMessage.textContent = 'Printing your photos...';
  
  printingOverlay.appendChild(printingMessage);
  document.body.appendChild(printingOverlay);
  
  // Play printer sound
  const printerSound = document.createElement('audio');
  printerSound.className = 'printer-sound';
  printerSound.src = 'assets/printer-sound.mp3'; // You'll need to add this sound file
  printerSound.autoplay = true;
  document.body.appendChild(printerSound);

  // Show photostrip container
  photostripContainer.style.display = "flex";
  
  // Add the printing class to photostrip
  photostrip.classList.add('printing');
  
  // Add printing class to branding
  const branding = photostrip.querySelector('.photostrip-branding');
  if (branding) {
    branding.classList.add('printing');
  }

  // Add photos to photostrip with a delay for the animation
  setTimeout(() => {
    for (let i = 0; i < photoElements.length; i++) {
      photostrip.appendChild(photoElements[i]);
    }
    
    // Remove the overlay after the animation completes
    setTimeout(() => {
      printingOverlay.classList.remove('active');
      setTimeout(() => {
        printingOverlay.remove();
        printerSound.remove();
      }, 500);
    }, 3200); // slightly longer than our animation
    
    // Initialize the editing tools
    initEditingTools();
  }, 300);
}

// Update downloadPhotostrip function to include animation when downloading
function downloadPhotostrip() {
  // Remove printing class if it exists
  photostrip.classList.remove('printing');
  
  // Get all stickers to make sure they're included in the download
  const stickers = photostrip.querySelectorAll('.draggable-sticker');
  stickers.forEach(sticker => {
    sticker.style.position = 'absolute'; // Ensure position is maintained in screenshot
  });
  
  html2canvas(photostrip).then((canvas) => {
    const link = document.createElement("a");
    link.download = "retro-photostrip.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.8);
    link.click();
  });
}

// Update resetPhotobooth function to handle the printing class
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
  photostrip.classList.remove('printing');
  const branding = photostrip.querySelector('.photostrip-branding');
  if (branding) {
    branding.classList.remove('printing');
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