document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const startScreen = document.getElementById('startScreen');
    const cameraContainer = document.getElementById('cameraContainer');
    const camera = document.getElementById('camera');
    const captureButton = document.getElementById('captureButton');
    const startButton = document.getElementById('startButton');
    const cameraControls = document.getElementById('cameraControls');
    const countdown = document.getElementById('countdown');
    const flash = document.getElementById('flash');
    const photostripContainer = document.getElementById('photostripContainer');
    const photostrip = document.getElementById('photostrip');
    const downloadButton = document.getElementById('downloadButton');
    const resetButton = document.getElementById('resetButton');
    const colorPicker = document.getElementById('colorPicker');
    const stickerPicker = document.getElementById('stickerPicker');
    const loadingMessage = document.getElementById('loadingMessage');
    const filterSelector = document.getElementById('filterSelector');
    
    // App State
    let stream = null;
    let photosTaken = 0;
    const maxPhotos = 4;
    let photoElements = [];
    let isCountingDown = false;
    let currentFilter = 'normal';
    
    // Start the photobooth
    startButton.addEventListener('click', initCamera);
    
    // Filter selection
    filterSelector.querySelectorAll('.filter-option').forEach(filterEl => {
      filterEl.addEventListener('click', () => {
        // Remove selected class from all filters
        filterSelector.querySelectorAll('.filter-option').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Add selected class to clicked filter
        filterEl.classList.add('selected');
        
        // Apply filter to camera preview
        currentFilter = filterEl.getAttribute('data-filter');
        
        // Remove all filter classes from camera
        camera.className = '';
        
        // Add the new filter class
        camera.classList.add(`filter-${currentFilter}`);
      });
    });
    
    // Initialize the camera
    async function initCamera() {
      startScreen.style.display = 'none';
      cameraContainer.style.display = 'block';
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });
        
        camera.srcObject = stream;
        camera.classList.add('filter-normal');
        loadingMessage.style.display = 'none';
        cameraControls.style.display = 'flex';
        captureButton.addEventListener('click', startPhotoSequence);
        
      } catch (err) {
        loadingMessage.textContent = 'Camera access denied or not available :(';
        console.error('Error accessing camera:', err);
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
      countdown.style.display = 'block';
      
      const countInterval = setInterval(() => {
        count--;
        
        if (count > 0) {
          countdown.textContent = count;
        } else {
          clearInterval(countInterval);
          countdown.style.display = 'none';
          takePhoto();
        }
      }, 1000);
    }
    
    // Take a photo
    function takePhoto() {
      // Create flash effect
      flash.style.opacity = '0.8';
      setTimeout(() => {
        flash.style.opacity = '0';
      }, 100);
      
      // Create the canvas to capture the photo
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match the video
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      
      // Draw the video frame on the canvas, flip horizontally
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(camera, 0, 0, canvas.width, canvas.height);
      
      // Apply filter effects to the canvas
      if (currentFilter !== 'normal') {
        applyFilterToCanvas(context, canvas.width, canvas.height, currentFilter);
      }
      
      // Convert canvas to image
      const imgUrl = canvas.toDataURL('image/jpeg');
      
      // Add to photostrip
      photosTaken++;
      const photoElement = document.createElement('img');
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
    
    // Apply filter effects directly to canvas
    function applyFilterToCanvas(ctx, width, height, filterType) {
      // Get image data to manipulate
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      switch (filterType) {
        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
          }
          break;
          
        case 'sepia':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
          }
          break;
          
        case 'vintage':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Sepia-like effect with increased saturation
            data[i] = Math.min(255, (r * 0.5) + (g * 0.5) + (b * 0.1) + 20);
            data[i + 1] = Math.min(255, (r * 0.3) + (g * 0.8) + (b * 0.1));
            data[i + 2] = Math.min(255, (r * 0.2) + (g * 0.1) + (b * 0.7));
          }
          break;
          
        case 'sketch':
          // First convert to grayscale
          let grayscale = new Uint8ClampedArray(data.length);
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            grayscale[i] = grayscale[i + 1] = grayscale[i + 2] = avg;
            grayscale[i + 3] = data[i + 3]; // Keep alpha
          }
          
          // Simple edge detection
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const idx = (y * width + x) * 4;
              
              // Get surrounding pixels
              const current = grayscale[idx];
              const below = grayscale[idx + (width * 4)];
              const right = grayscale[idx + 4];
              
              // Simple edge detection
              const diff = Math.abs(current - below) + Math.abs(current - right);
              
              // Invert and enhance edges
              data[idx] = data[idx + 1] = data[idx + 2] = 255 - Math.min(diff * 5, 255);
            }
          }
          break;
      }
      
      // Put the modified pixels back
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Finish photo session and show the photostrip
    function finishPhotoSession() {
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      
      // Hide camera UI
      cameraContainer.style.display = 'none';
      cameraControls.style.display = 'none';
      
      // Add photos to photostrip
      for (let i = 0; i < photoElements.length; i++) {
        photostrip.appendChild(photoElements[i]);
      }
      
      // Show photostrip editor
      photostripContainer.style.display = 'flex';
      
      // Run printing animation
      setTimeout(() => {
        photostrip.classList.add('printing');
      }, 500);
      
      // Initialize the editing tools
      initEditingTools();
    }
    
    // Initialize editing tools for photostrip
    function initEditingTools() {
      // Color picker functionality
      colorPicker.querySelectorAll('.color').forEach(colorEl => {
        colorEl.addEventListener('click', () => {
          // Remove selected class from all colors
          colorPicker.querySelectorAll('.color').forEach(el => {
            el.classList.remove('selected');
          });
          
          // Add selected class to clicked color
          colorEl.classList.add('selected');
          
          // Apply color to photostrip
          const selectedColor = colorEl.getAttribute('data-color');
          photostrip.style.backgroundColor = selectedColor;
        });
      });
      
      // Sticker functionality
      stickerPicker.querySelectorAll('.sticker').forEach(stickerEl => {
        stickerEl.addEventListener('click', () => {
          addSticker(stickerEl.textContent);
        });
      });
      
      // Download button
      downloadButton.addEventListener('click', downloadPhotostrip);
      
      // Reset button
      resetButton.addEventListener('click', resetPhotobooth);
    }
    
    // Add a draggable and resizable sticker to the photostrip
    function addSticker(emoji) {
      const stickerContainer = document.createElement('div');
      stickerContainer.classList.add('draggable-sticker');
      stickerContainer.style.left = '50%';
      stickerContainer.style.top = '50%';
      stickerContainer.style.transform = 'translate(-50%, -50%)';
      
      const sticker = document.createElement('span');
      sticker.textContent = emoji;
      sticker.style.fontSize = '24px'; // Initial size
      
      const resizeHandle = document.createElement('div');
      resizeHandle.classList.add('resize-handle');
      
      stickerContainer.appendChild(sticker);
      stickerContainer.appendChild(resizeHandle);
      photostrip.appendChild(stickerContainer);
      
      // Make sticker draggable
      let isDragging = false;
      let isResizing = false;
      let offsetX, offsetY, startX, startY, startFontSize;
      
      // Mouse events for dragging
      stickerContainer.addEventListener('mousedown', (e) => {
        if (e.target === resizeHandle) {
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startFontSize = parseFloat(sticker.style.fontSize);
        } else {
          isDragging = true;
          const rect = stickerContainer.getBoundingClientRect();
          offsetX = e.clientX - rect.left;
          offsetY = e.clientY - rect.top;
          stickerContainer.style.zIndex = '1000';
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const photoRect = photostrip.getBoundingClientRect();
          const x = e.clientX - photoRect.left - offsetX;
          const y = e.clientY - photoRect.top - offsetY;
          
          stickerContainer.style.left = `${x}px`;
          stickerContainer.style.top = `${y}px`;
          stickerContainer.style.transform = 'none';
        } else if (isResizing) {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const direction = dx + dy > 0 ? 1 : -1;
          const newSize = Math.max(12, startFontSize + direction * distance * 0.1);
          sticker.style.fontSize = `${newSize}px`;
        }
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        stickerContainer.style.zIndex = '999';
      });
      
      // Touch events for mobile
      stickerContainer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = stickerContainer.getBoundingClientRect();
        
        if (isTargetingResizeHandle(touch, resizeHandle)) {
          isResizing = true;
          startX = touch.clientX;
          startY = touch.clientY;
          startFontSize = parseFloat(sticker.style.fontSize);
        } else {
          isDragging = true;
          offsetX = touch.clientX - rect.left;
          offsetY = touch.clientY - rect.top;
          stickerContainer.style.zIndex = '1000';
        }
        e.preventDefault();
      });
      
      document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        
        if (isDragging) {
          const photoRect = photostrip.getBoundingClientRect();
          const x = touch.clientX - photoRect.left - offsetX;
          const y = touch.clientY - photoRect.top - offsetY;
          
          stickerContainer.style.left = `${x}px`;
          stickerContainer.style.top = `${y}px`;
          stickerContainer.style.transform = 'none';
        } else if (isResizing) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const direction = dx + dy > 0 ? 1 : -1;
          const newSize = Math.max(12, startFontSize + direction * distance * 0.1);
          sticker.style.fontSize = `${newSize}px`;
        }
        
        if (isDragging || isResizing) {
          e.preventDefault();
        }
      });
      
      document.addEventListener('touchend', () => {
        isDragging = false;
        isResizing = false;
        stickerContainer.style.zIndex = '999';
      });
    }
    
    // Helper function to check if a touch is targeting the resize handle
    function isTargetingResizeHandle(touch, handle) {
      const rect = handle.getBoundingClientRect();
      return touch.clientX >= rect.left && 
             touch.clientX <= rect.right && 
             touch.clientY >= rect.top && 
             touch.clientY <= rect.bottom;
    }
    
    // Download the photostrip
    function downloadPhotostrip() {
      html2canvas(photostrip).then(canvas => {
        const link = document.createElement('a');
        link.download = 'retro-photostrip.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.8);
        link.click();
      });
    }
    
    // Reset the photobooth to start again
    function resetPhotobooth() {
      // Reset counters and arrays
      photosTaken = 0;
      photoElements = [];
      
      // Clear the photostrip
      const photos = photostrip.querySelectorAll('img');
      const stickers = photostrip.querySelectorAll('.draggable-sticker');
      
      photos.forEach(photo => photo.remove());
      stickers.forEach(sticker => sticker.remove());

      