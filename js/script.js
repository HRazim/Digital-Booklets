/**
 * Welcome Booklet Website
 * Main JavaScript file
 */

// DOM Ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the welcome screen
    initWelcomeScreen();
    
    // Initialize the map if we're on the map page
    if (document.getElementById('map')) {
        initMap();
    }
    
    // Add event listeners for point of interest items
    addPoiListeners();
    
    // Initialize helper functions
    animateOnScroll();
    setupAccordions();
    initGallery();
});

/**
 * Initialize the welcome screen functionality
 */
function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome');
    const mainNav = document.getElementById('main-nav');
    const startButton = document.getElementById('start-explore');
    
    // If we're on the main page with the welcome screen
    if (welcomeScreen && mainNav && startButton) {
        // Check if the user has already seen the welcome screen
        if (!sessionStorage.getItem('welcomeShown')) {
            welcomeScreen.classList.add('active');
            
            // Add event listener to the start button
            startButton.addEventListener('click', function() {
                welcomeScreen.classList.remove('active');
                mainNav.classList.add('active');
                
                // Set session storage to remember that welcome screen has been shown
                sessionStorage.setItem('welcomeShown', 'true');
            });
        } else {
            // If welcome already shown, show the main navigation directly
            welcomeScreen.classList.remove('active');
            mainNav.classList.add('active');
        }
    }
}

/**
 * Initialize the Leaflet map on the map page
 */
function initMap() {
    const mapElement = document.getElementById('map');
    
    // Check if Leaflet is available
    if (typeof L !== 'undefined' && mapElement) {
        // Remove the loading message
        mapElement.innerHTML = '';
        
        // Initialize the map centered on the accommodation
        const map = L.map('map').setView([43.5, 6.5], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add markers for all points of interest
        const poiItems = document.querySelectorAll('.poi-item');
        
        poiItems.forEach(item => {
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            const title = item.querySelector('h4').textContent;
            
            if (!isNaN(lat) && !isNaN(lng)) {
                // Create custom icon based on the poi icon
                const iconElement = item.querySelector('.poi-icon i');
                let iconClass = 'home';
                
                if (iconElement) {
                    const classes = iconElement.className.split(' ');
                    for (const cls of classes) {
                        if (cls.startsWith('fa-') && cls !== 'fa-solid' && cls !== 'fa-fas') {
                            iconClass = cls.replace('fa-', '');
                            break;
                        }
                    }
                }
                
                // Create marker
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`<strong>${title}</strong>`);
                
                // Store marker reference in the DOM element for later use
                item._marker = marker;
            }
        });
    } else {
        // If Leaflet is not available, display a fallback message
        mapElement.innerHTML = `
            <div class="map-fallback">
                <p>Map could not be loaded. Please check your internet connection.</p>
            </div>
        `;
    }
}

/**
 * Add event listeners to Points of Interest items
 */
function addPoiListeners() {
    const poiItems = document.querySelectorAll('.poi-item');
    
    poiItems.forEach(item => {
        item.addEventListener('click', function() {
            // If there's a map and this item has a marker associated with it
            if (typeof L !== 'undefined' && this._marker) {
                // Open the popup on the map
                this._marker.openPopup();
                
                // Scroll to the map if not visible
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    mapElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

/**
 * Helper function to animate elements when they enter the viewport
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('.content-section, .activity-card, .food-card, .contact-card');
    
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Helper function to format phone numbers
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    
    // Remove any non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length and country
    if (cleaned.length === 10) {
        // US format
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
        // US with country code
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 12 && cleaned.slice(0, 3) === '336') {
        // French mobile format
        return `+33 ${cleaned.slice(3, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    
    // Default: return as is with plus if international
    return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
}

/**
 * Handle accordions for content sections if needed
 */
function setupAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Toggle the visibility of the next sibling (content)
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Create and inject necessary CSS for the lightbox if not already in style.css
 */
function injectLightboxStyles() {
    // Check if lightbox styles already exist
    if (!document.getElementById('lightbox-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'lightbox-styles';
        styleSheet.innerHTML = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.85);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .lightbox.active {
                opacity: 1;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                margin: auto;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .lightbox.active .lightbox-content {
                transform: scale(1);
            }
            
            .lightbox-content img {
                display: block;
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
            }
            
            .lightbox-close {
                position: absolute;
                top: -30px;
                right: -30px;
                color: white;
                font-size: 30px;
                cursor: pointer;
                width: 30px;
                height: 30px;
                line-height: 30px;
                text-align: center;
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 50%;
            }
            
            .lightbox-caption {
                position: absolute;
                bottom: -40px;
                left: 0;
                right: 0;
                text-align: center;
                color: white;
                padding: 10px;
                background-color: rgba(0, 0, 0, 0.7);
            }
            
            .lightbox-nav {
                position: absolute;
                top: 50%;
                width: 100%;
                display: flex;
                justify-content: space-between;
                transform: translateY(-50%);
                padding: 0 20px;
                box-sizing: border-box;
            }
            
            .lightbox-prev, .lightbox-next {
                color: white;
                font-size: 24px;
                cursor: pointer;
                background-color: rgba(0, 0, 0, 0.5);
                width: 40px;
                height: 40px;
                line-height: 40px;
                text-align: center;
                border-radius: 50%;
                user-select: none;
            }
            
            @media (max-width: 768px) {
                .lightbox-close {
                    top: 10px;
                    right: 10px;
                }
                
                .lightbox-prev, .lightbox-next {
                    width: 30px;
                    height: 30px;
                    line-height: 30px;
                    font-size: 18px;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }
}

/**
 * Initialize image gallery with lightbox functionality
 * - Creates a lightbox overlay when gallery images are clicked
 * - Provides navigation between gallery images
 * - Handles touch swipe gestures for mobile navigation
 * - Shows image captions if available
 * - Includes keyboard navigation support
 */
function initGallery() {
    // First inject necessary styles if not already in style.css
    injectLightboxStyles();
    
    // Gather all gallery images from various pages
    const galleryImages = document.querySelectorAll('.gallery-img');
    if (!galleryImages.length) return;
    
    // Keep track of current lightbox
    let currentLightbox = null;
    let currentImageIndex = 0;
    let imagesList = [];
    
    // Function to open lightbox
    function openLightbox(imageElement, imageIndex) {
        // Store all images from the same gallery
        imagesList = Array.from(galleryImages);
        currentImageIndex = imageIndex;
        
        // Create lightbox container
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        // Create lightbox content container
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        // Create close button
        const closeBtn = document.createElement('span');
        closeBtn.className = 'lightbox-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.setAttribute('role', 'button');
        closeBtn.setAttribute('tabindex', '0');
        
        // Create image element
        const lightboxImg = document.createElement('img');
        lightboxImg.src = imageElement.src;
        lightboxImg.alt = imageElement.alt || 'Gallery image';
        
        // Create caption if available
        const caption = imageElement.getAttribute('data-caption') || imageElement.alt;
        if (caption) {
            const lightboxCaption = document.createElement('div');
            lightboxCaption.className = 'lightbox-caption';
            lightboxCaption.textContent = caption;
            lightboxContent.appendChild(lightboxCaption);
        }
        
        // Add navigation if there are multiple images
        if (imagesList.length > 1) {
            const navContainer = document.createElement('div');
            navContainer.className = 'lightbox-nav';
            
            // Previous button
            const prevBtn = document.createElement('span');
            prevBtn.className = 'lightbox-prev';
            prevBtn.innerHTML = '&#10094;';
            prevBtn.setAttribute('aria-label', 'Previous image');
            prevBtn.setAttribute('role', 'button');
            prevBtn.setAttribute('tabindex', '0');
            
            // Next button
            const nextBtn = document.createElement('span');
            nextBtn.className = 'lightbox-next';
            nextBtn.innerHTML = '&#10095;';
            nextBtn.setAttribute('aria-label', 'Next image');
            nextBtn.setAttribute('role', 'button');
            nextBtn.setAttribute('tabindex', '0');
            
            navContainer.appendChild(prevBtn);
            navContainer.appendChild(nextBtn);
            lightboxContent.appendChild(navContainer);
            
            // Event listeners for navigation buttons
            prevBtn.addEventListener('click', showPrevImage);
            nextBtn.addEventListener('click', showNextImage);
            
            // Make buttons keyboard accessible
            prevBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showPrevImage();
                }
            });
            
            nextBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showNextImage();
                }
            });
        }
        
        // Append image to lightbox content
        lightboxContent.appendChild(closeBtn);
        lightboxContent.appendChild(lightboxImg);
        
        // Append lightbox content to lightbox container
        lightbox.appendChild(lightboxContent);
        
        // Append lightbox to the document body
        document.body.appendChild(lightbox);
        currentLightbox = lightbox;
        
        // Force a reflow before adding the active class for transition
        lightbox.offsetWidth;
        lightbox.classList.add('active');
        
        // Add touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - show next image
                showNextImage();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - show previous image
                showPrevImage();
            }
        }
        
        // Close lightbox on clicking close button or outside the image
        closeBtn.addEventListener('click', closeLightbox);
        closeBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeLightbox();
            }
        });
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Prevent scrolling on body while lightbox is open
        document.body.style.overflow = 'hidden';
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyboardNavigation);
    }
    
    // Function to close the lightbox
    function closeLightbox() {
        if (currentLightbox) {
            currentLightbox.classList.remove('active');
            
            // Wait for transition to complete before removing from DOM
            setTimeout(() => {
                document.body.removeChild(currentLightbox);
                currentLightbox = null;
                
                // Restore scrolling on body
                document.body.style.overflow = '';
                
                // Remove keyboard event listener
                document.removeEventListener('keydown', handleKeyboardNavigation);
            }, 300);
        }
    }
    
    // Function to show the next image in the gallery
    function showNextImage() {
        if (imagesList.length <= 1) return;
        
        currentImageIndex = (currentImageIndex + 1) % imagesList.length;
        updateLightboxImage(imagesList[currentImageIndex]);
    }
    
    // Function to show the previous image in the gallery
    function showPrevImage() {
        if (imagesList.length <= 1) return;
        
        currentImageIndex = (currentImageIndex - 1 + imagesList.length) % imagesList.length;
        updateLightboxImage(imagesList[currentImageIndex]);
    }
    
    // Function to update the image in the lightbox
    function updateLightboxImage(imageElement) {
        if (!currentLightbox) return;
        
        const lightboxImg = currentLightbox.querySelector('.lightbox-content img');
        const lightboxCaption = currentLightbox.querySelector('.lightbox-caption');
        
        // Apply a simple fade transition
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            // Update image src and alt
            lightboxImg.src = imageElement.src;
            lightboxImg.alt = imageElement.alt || 'Gallery image';
            
            // Update caption if available
            const caption = imageElement.getAttribute('data-caption') || imageElement.alt;
            if (lightboxCaption) {
                if (caption) {
                    lightboxCaption.textContent = caption;
                    lightboxCaption.style.display = '';
                } else {
                    lightboxCaption.style.display = 'none';
                }
            } else if (caption) {
                // Create caption if it doesn't exist but is needed
                const newCaption = document.createElement('div');
                newCaption.className = 'lightbox-caption';
                newCaption.textContent = caption;
                currentLightbox.querySelector('.lightbox-content').appendChild(newCaption);
            }
            
            // Restore opacity after src change
            lightboxImg.style.opacity = '1';
        }, 200);
    }
    
    // Function to handle keyboard navigation
    function handleKeyboardNavigation(e) {
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
        }
    }
    
    // Add click events to all gallery images
    galleryImages.forEach((img, index) => {
        // Make images focusable for accessibility
        if (!img.hasAttribute('tabindex')) {
            img.setAttribute('tabindex', '0');
        }
        
        // Add appropriate cursor style
        img.style.cursor = 'pointer';
        
        // Click event listener
        img.addEventListener('click', function() {
            openLightbox(this, index);
        });
        
        // Keyboard accessibility
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(this, index);
            }
        });
    });
    
    // Initialize lazy loading for gallery images if needed
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        galleryImages.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        // This could be expanded with a more robust solution if needed
        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });
        
        galleryImages.forEach(img => {
            if (img.hasAttribute('data-src')) {
                lazyLoadObserver.observe(img);
            }
        });
    }

}