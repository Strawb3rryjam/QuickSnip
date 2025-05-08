document.addEventListener("DOMContentLoaded", () => {
  // Existing code remains the same...

  // Add new DOM element reference
  const previewContainer = document.getElementById("previewContainer");

  // Update the initCamera function to show the preview container
  async function initCamera() {
    startScreen.style.display = "none";
    cameraContainer.style.display = "block";

    // Show the preview container when camera initializes
    if (previewContainer) {
      previewContainer.style.display = "block";
    }

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

  // Update the takePhoto function to add thumbnail to preview
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

    // Update the preview box with the new photo
    updatePhotoPreview(photosTaken, imgUrl);

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

  // New function to update the preview box
  function updatePhotoPreview(photoNumber, imageUrl) {
    const previewBox = document.getElementById(`preview-${photoNumber}`);
    if (previewBox) {
      // Clear existing content (the number)
      previewBox.innerHTML = "";

      // Create and add the thumbnail
      const thumbnail = document.createElement("img");
      thumbnail.src = imageUrl;
      thumbnail.alt = `Preview ${photoNumber}`;
      previewBox.appendChild(thumbnail);

      // Add the filled class for styling
      previewBox.classList.add("filled");
    }
  }

  // Update resetPhotobooth function to reset preview boxes
  function resetPhotobooth() {
    // Reset counters and arrays
    photosTaken = 0;
    photoElements = [];

    // Clear the photostrip
    const photos = photostrip.querySelectorAll("img");
    const stickers = photostrip.querySelectorAll(".draggable-sticker");

    photos.forEach((photo) => photo.remove());
    stickers.forEach((sticker) => sticker.remove());

    // Reset the preview boxes
    for (let i = 1; i <= maxPhotos; i++) {
      const previewBox = document.getElementById(`preview-${i}`);
      if (previewBox) {
        previewBox.innerHTML = i;
        previewBox.classList.remove("filled");
      }
    }

    // Hide preview container
    if (previewContainer) {
      previewContainer.style.display = "none";
    }

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

document.addEventListener("DOMContentLoaded", () => {
  // Existing code remains the same...

  // Add new DOM element reference
  const previewContainer = document.getElementById("previewContainer");

  // Update the initCamera function to show the preview container
  async function initCamera() {
    startScreen.style.display = "none";
    cameraContainer.style.display = "block";

    // Show the preview container when camera initializes
    if (previewContainer) {
      previewContainer.style.display = "block";
    }

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

  // Update the takePhoto function to add thumbnail to preview
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

    // Update the preview box with the new photo
    updatePhotoPreview(photosTaken, imgUrl);

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

  // New function to update the preview box
  function updatePhotoPreview(photoNumber, imageUrl) {
    const previewBox = document.getElementById(`preview-${photoNumber}`);
    if (previewBox) {
      // Clear existing content (the number)
      previewBox.innerHTML = "";

      // Create and add the thumbnail
      const thumbnail = document.createElement("img");
      thumbnail.src = imageUrl;
      thumbnail.alt = `Preview ${photoNumber}`;
      previewBox.appendChild(thumbnail);

      // Add the filled class for styling
      previewBox.classList.add("filled");
    }
  }

  // Update resetPhotobooth function to reset preview boxes
  function resetPhotobooth() {
    // Reset counters and arrays
    photosTaken = 0;
    photoElements = [];

    // Clear the photostrip
    const photos = photostrip.querySelectorAll("img");
    const stickers = photostrip.querySelectorAll(".draggable-sticker");

    photos.forEach((photo) => photo.remove());
    stickers.forEach((sticker) => sticker.remove());

    // Reset the preview boxes
    for (let i = 1; i <= maxPhotos; i++) {
      const previewBox = document.getElementById(`preview-${i}`);
      if (previewBox) {
        previewBox.innerHTML = i;
        previewBox.classList.remove("filled");
      }
    }

    // Hide preview container
    if (previewContainer) {
      previewContainer.style.display = "none";
    }

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
