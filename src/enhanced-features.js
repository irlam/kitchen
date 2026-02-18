/**
 * KitchenLab Pro - Enhanced Features Module (v0.2.0)
 * 
 * Features:
 * - Loading spinners for async operations
 * - PDF export functionality
 * - Measurement tools
 * - Room templates
 * - First-time tutorial
 */

// ============================================
// LOADING SPINNER
// ============================================

export function showLoadingSpinner(message = 'Saving...') {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.style.display = 'flex';
    spinner.setAttribute('aria-hidden', 'false');
    const text = spinner.querySelector('.loading-text');
    if (text) text.textContent = message;
  }
}

export function hideLoadingSpinner() {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    spinner.style.display = 'none';
    spinner.setAttribute('aria-hidden', 'true');
  }
}

// ============================================
// PDF EXPORT (using jsPDF)
// ============================================

export async function exportToPDF(projectName = 'Kitchen Plan') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 210, 210);
  doc.text('KitchenLab Pro', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Project: ${projectName}`, 20, 30);
  doc.text(`Exported: ${new Date().toLocaleDateString()}`, 20, 36);

  // Capture 2D floorplan
  const floorplanCanvas = document.getElementById('floorplanner-canvas');
  if (floorplanCanvas) {
    try {
      const imgData = floorplanCanvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 50, 170, 100);
    } catch (e) {
      doc.text('2D Floorplan not available', 20, 60);
    }
  }

  // Add project notes if available
  const notes = document.getElementById('projectNotes')?.value;
  if (notes) {
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Notes:', 20, 160);
    const splitNotes = doc.splitTextToSize(notes, 170);
    doc.text(splitNotes, 20, 166);
  }

  // Save the PDF
  const filename = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_floorplan.pdf`;
  doc.save(filename);
  
  return true;
}

// ============================================
// MEASUREMENT TOOLS
// ============================================

export class MeasurementTools {
  constructor(kitchenKreation) {
    this.kk = kitchenKreation;
    this.activeTool = null;
    this.measurements = [];
    this.panel = null;
  }

  showPanel() {
    // Remove existing panel if any
    if (this.panel) {
      this.panel.remove();
    }

    // Create measurement panel
    this.panel = document.createElement('div');
    this.panel.className = 'measurement-panel';
    this.panel.innerHTML = `
      <h3 style="color: #5fffea; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Measurement Tools</h3>

      <button class="measure-tool-btn" id="measure-distance">
        📏 Distance Tool
      </button>
      <button class="measure-tool-btn" id="measure-area">
        📐 Area Calculator
      </button>

      <!-- Distance result display -->
      <div id="distance-result" style="margin: 10px 0; padding: 12px; background: rgba(0, 210, 210, 0.15); border-radius: 8px; border: 1px solid rgba(0, 210, 210, 0.4); display: none;">
        <div style="color: #5fffea; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">📏 Distance:</div>
        <div id="distance-value" style="color: #fff; font-size: 18px; font-weight: bold; font-family: 'Aldrich', sans-serif;">--</div>
      </div>

      <div class="measurement-row">
        <span class="measurement-label">Total Floor Area:</span>
        <span class="measurement-value" id="total-area">--</span>
      </div>
      <div class="measurement-row">
        <span class="measurement-label">Room Width:</span>
        <span class="measurement-value" id="room-width">--</span>
      </div>
      <div class="measurement-row">
        <span class="measurement-label">Room Depth:</span>
        <span class="measurement-value" id="room-depth">--</span>
      </div>

      <button class="measure-tool-btn" id="clear-measurements" style="margin-top: 12px; background: rgba(255, 68, 68, 0.2); border-color: rgba(255, 68, 68, 0.4);">
        🗑️ Clear Measurements
      </button>
    `;

    // Insert panel into side panel
    const toolRail = document.getElementById('tool-rail');
    if (toolRail) {
      toolRail.parentNode.insertBefore(this.panel, toolRail.nextSibling);
    }

    // Add event listeners
    this.panel.querySelector('#measure-distance').addEventListener('click', () => this.activateDistanceTool());
    this.panel.querySelector('#measure-area').addEventListener('click', () => this.calculateArea());
    this.panel.querySelector('#clear-measurements').addEventListener('click', () => this.clearMeasurements());

    // Update room dimensions
    this.updateRoomDimensions();
  }

  activateDistanceTool() {
    this.activeTool = 'distance';
    this.measurementPoints = [];
    
    // Highlight that tool is active
    const btn = this.panel.querySelector('#measure-distance');
    btn.classList.add('active');
    btn.textContent = '🎯 Click point 1';
    
    // Add click handler to floorplan canvas
    const canvas = document.getElementById('floorplanner-canvas');
    if (!canvas) {
      alert('Switch to 2D Floorplan view first!');
      this.deactivateDistanceTool();
      return;
    }
    
    // Store reference to remove listener later
    this.canvasClickHandler = (e) => this.handleDistanceClick(e, canvas);
    canvas.addEventListener('click', this.canvasClickHandler);
    
    btn.textContent = '✕ Cancel';
    // Store original click handler to restore later
    this.originalDistanceClick = btn.onclick;
    btn.onclick = (e) => {
      e.stopPropagation();
      this.deactivateDistanceTool();
    };
  }
  
  handleDistanceClick(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert canvas pixels to cm (assuming scale from floorplanner)
    const floorplanner = this.kk?.floorplanner;
    if (!floorplanner || !floorplanner.viewmodel) return;
    
    const viewmodel = floorplanner.viewmodel;
    
    // Convert to model coordinates (cm) - inverse of convertX/convertY
    // convertX: (x - originX * cmPerPixel) * pixelsPerCm
    // inverse: (pixelX / pixelsPerCm) + originX * cmPerPixel
    const modelX = (clickX / viewmodel.pixelsPerCm) + viewmodel.originX * viewmodel.cmPerPixel;
    const modelY = (clickY / viewmodel.pixelsPerCm) + viewmodel.originY * viewmodel.cmPerPixel;
    
    this.measurementPoints.push({ x: modelX, y: modelY });
    
    const btn = this.panel.querySelector('#measure-distance');
    
    if (this.measurementPoints.length === 1) {
      btn.textContent = '🎯 Click point 2';
    } else if (this.measurementPoints.length === 2) {
      // Calculate distance
      const p1 = this.measurementPoints[0];
      const p2 = this.measurementPoints[1];
      const distanceCm = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const distanceM = (distanceCm / 100).toFixed(2);
      const distanceFt = (distanceCm / 30.48).toFixed(1);
      
      // Display result - show the distance result box
      const resultEl = this.panel?.querySelector('#distance-result');
      const valueEl = this.panel?.querySelector('#distance-value');
      
      if (resultEl && valueEl) {
        resultEl.style.display = 'block';
        valueEl.textContent = `${distanceM} m / ${distanceFt}'`;
      }
      
      btn.textContent = '✓ Distance measured!';
      this.deactivateDistanceTool();
      
      // Reset label after 3 seconds
      setTimeout(() => {
        const resetBtn = this.panel?.querySelector('#measure-distance');
        if (resetBtn) resetBtn.textContent = '📏 Distance Tool';
      }, 3000);
    }
  }
  
  deactivateDistanceTool() {
    this.activeTool = null;
    this.measurementPoints = [];
    
    // Remove click handler from canvas
    const canvas = document.getElementById('floorplanner-canvas');
    if (canvas && this.canvasClickHandler) {
      canvas.removeEventListener('click', this.canvasClickHandler);
      this.canvasClickHandler = null;
    }
    
    // Reset button
    const btn = this.panel.querySelector('#measure-distance');
    if (btn) {
      btn.classList.remove('active');
      btn.textContent = '📏 Distance Tool';
      // Restore original click handler
      btn.onclick = () => this.activateDistanceTool();
    }
    
    // Hide distance result box
    const resultEl = this.panel?.querySelector('#distance-result');
    if (resultEl) {
      resultEl.style.display = 'none';
    }
  }

  calculateArea() {
    const floorplan = this.kk?.model?.floorplan;
    if (!floorplan) return;

    // Get room dimensions
    const rooms = floorplan.getRooms();
    let totalArea = 0;

    rooms.forEach(room => {
      const area = this.calculateRoomArea(room);
      totalArea += area;
    });

    // Display result
    const areaEl = this.panel?.querySelector('#total-area');
    if (areaEl) {
      areaEl.textContent = `${totalArea.toFixed(2)} m² / ${(totalArea * 10.764).toFixed(1)} sq ft`;
    }
  }

  calculateRoomArea(room) {
    // Simple polygon area calculation (shoelace formula)
    const corners = room.corners;
    let area = 0;
    for (let i = 0; i < corners.length; i++) {
      const j = (i + 1) % corners.length;
      area += corners[i].x * corners[j].y;
      area -= corners[j].x * corners[i].y;
    }
    return Math.abs(area / 2) / 10000; // Convert cm² to m²
  }

  updateRoomDimensions() {
    const floorplan = this.kk?.model?.floorplan;
    if (!floorplan) return;

    const rooms = floorplan.getRooms();
    if (rooms.length === 0) {
      // Try to get dimensions from floorplan corners directly
      const corners = floorplan.getCorners();
      if (corners && corners.length > 0) {
        // Calculate bounds from corners
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        corners.forEach(corner => {
          if (corner.x < minX) minX = corner.x;
          if (corner.x > maxX) maxX = corner.x;
          if (corner.y < minY) minY = corner.y;
          if (corner.y > maxY) maxY = corner.y;
        });
        
        const widthCm = Math.abs(maxX - minX);
        const depthCm = Math.abs(maxY - minY);
        
        const widthEl = this.panel?.querySelector('#room-width');
        const depthEl = this.panel?.querySelector('#room-depth');
        
        if (widthEl) {
          widthEl.textContent = `${(widthCm / 100).toFixed(2)} m / ${(widthCm / 30.48).toFixed(1)}'`;
        }
        if (depthEl) {
          depthEl.textContent = `${(depthCm / 100).toFixed(2)} m / ${(depthCm / 30.48).toFixed(1)}'`;
        }
      }
      return;
    }

    const room = rooms[0];
    // Calculate bounds from room corners
    const corners = room.corners;
    if (!corners || corners.length === 0) return;
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    corners.forEach(corner => {
      if (corner.x < minX) minX = corner.x;
      if (corner.x > maxX) maxX = corner.x;
      if (corner.y < minY) minY = corner.y;
      if (corner.y > maxY) maxY = corner.y;
    });
    
    const widthCm = Math.abs(maxX - minX);
    const depthCm = Math.abs(maxY - minY);

    const widthEl = this.panel?.querySelector('#room-width');
    const depthEl = this.panel?.querySelector('#room-depth');

    if (widthEl) {
      widthEl.textContent = `${(widthCm / 100).toFixed(2)} m / ${(widthCm / 30.48).toFixed(1)}'`;
    }
    if (depthEl) {
      depthEl.textContent = `${(depthCm / 100).toFixed(2)} m / ${(depthCm / 30.48).toFixed(1)}'`;
    }

    // Update total area
    this.calculateArea();
  }

  clearMeasurements() {
    this.measurements = [];
    const areaEl = this.panel?.querySelector('#total-area');
    const widthEl = this.panel?.querySelector('#room-width');
    const depthEl = this.panel?.querySelector('#room-depth');
    
    if (areaEl) areaEl.textContent = '--';
    if (widthEl) widthEl.textContent = '--';
    if (depthEl) depthEl.textContent = '--';
  }

  hidePanel() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }
}

// ============================================
// ROOM TEMPLATES
// ============================================

export const ROOM_TEMPLATES = {
  l_shape: {
    id: 'l_shape',
    name: 'L-Shape Kitchen',
    description: 'Classic L-shaped layout with cabinets on two adjacent walls',
    icon: '⌜',
    floorplan: {
      corners: [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        { x: 400, y: 300 },
        { x: 200, y: 300 },
        { x: 200, y: 200 },
        { x: 0, y: 200 }
      ]
    },
    items: [
      { type: 'base-cabinet-60', x: 50, y: 50, rotation: 0 },
      { type: 'base-cabinet-90', x: 150, y: 50, rotation: 0 },
      { type: 'sink-single', x: 280, y: 50, rotation: 0 },
      { type: 'base-cabinet-60', x: 350, y: 100, rotation: 90 },
      { type: 'refrigerator', x: 350, y: 220, rotation: 90 }
    ]
  },
  u_shape: {
    id: 'u_shape',
    name: 'U-Shape Kitchen',
    description: 'Efficient U-shaped layout with cabinets on three walls',
    icon: '⊓',
    floorplan: {
      corners: [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        { x: 400, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 100, y: 300 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ]
    },
    items: [
      { type: 'base-cabinet-60', x: 50, y: 50, rotation: 0 },
      { type: 'stove-60', x: 150, y: 50, rotation: 0 },
      { type: 'base-cabinet-60', x: 250, y: 50, rotation: 0 },
      { type: 'sink-single', x: 350, y: 150, rotation: 90 },
      { type: 'base-cabinet-90', x: 250, y: 250, rotation: 180 },
      { type: 'dishwasher', x: 150, y: 250, rotation: 180 }
    ]
  },
  galley: {
    id: 'galley',
    name: 'Galley Kitchen',
    description: 'Efficient corridor-style layout with parallel counters',
    icon: '═',
    floorplan: {
      corners: [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 150 },
        { x: 0, y: 150 }
      ]
    },
    items: [
      { type: 'base-cabinet-60', x: 50, y: 30, rotation: 0 },
      { type: 'stove-60', x: 150, y: 30, rotation: 0 },
      { type: 'sink-single', x: 250, y: 30, rotation: 0 },
      { type: 'base-cabinet-90', x: 350, y: 30, rotation: 0 },
      { type: 'refrigerator', x: 350, y: 100, rotation: 180 },
      { type: 'base-cabinet-60', x: 250, y: 100, rotation: 180 },
      { type: 'base-cabinet-60', x: 150, y: 100, rotation: 180 }
    ]
  },
  one_wall: {
    id: 'one_wall',
    name: 'One-Wall Kitchen',
    description: 'Compact single-wall layout for small spaces',
    icon: '─',
    floorplan: {
      corners: [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 200 },
        { x: 0, y: 200 }
      ]
    },
    items: [
      { type: 'base-cabinet-60', x: 50, y: 50, rotation: 0 },
      { type: 'sink-single', x: 150, y: 50, rotation: 0 },
      { type: 'stove-60', x: 250, y: 50, rotation: 0 },
      { type: 'base-cabinet-90', x: 350, y: 50, rotation: 0 }
    ]
  },
  island: {
    id: 'island',
    name: 'Kitchen with Island',
    description: 'Spacious layout with central island for prep and dining',
    icon: '▦',
    floorplan: {
      corners: [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 400 },
        { x: 0, y: 400 }
      ]
    },
    items: [
      { type: 'base-cabinet-90', x: 50, y: 50, rotation: 0 },
      { type: 'stove-90', x: 200, y: 50, rotation: 0 },
      { type: 'base-cabinet-90', x: 350, y: 50, rotation: 0 },
      { type: 'sink-single', x: 350, y: 150, rotation: 90 },
      { type: 'base-cabinet-120', x: 150, y: 250, rotation: 90 },
      { type: 'refrigerator', x: 50, y: 250, rotation: 0 }
    ]
  }
};

export function showTemplatesModal(onSelect) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'templates-modal';
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 900px;">
      <div class="modal-content" style="background: #0a141d; color: #e6f6ff; border: 1px solid rgba(0, 210, 210, 0.3);">
        <div class="modal-header" style="border-bottom: 1px solid rgba(0, 210, 210, 0.3);">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" style="color: #9fd0e6;">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 class="modal-title" style="color: #5fffea;">Room Templates</h4>
        </div>
        <div class="modal-body">
          <div class="template-grid">
            ${Object.values(ROOM_TEMPLATES).map(template => `
              <div class="template-card" data-template="${template.id}">
                <div class="template-preview">${template.icon}</div>
                <h4>${template.name}</h4>
                <p>${template.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add click handlers
  modal.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const templateId = card.getAttribute('data-template');
      const template = ROOM_TEMPLATES[templateId];
      if (template && onSelect) {
        onSelect(template);
        $(modal).modal('hide');
      }
    });
  });

  // Show modal
  $(modal).modal('show');

  // Cleanup on close
  $(modal).on('hidden.bs.modal', () => {
    modal.remove();
  });
}

// ============================================
// FIRST-TIME TUTORIAL
// ============================================

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to KitchenLab Pro!',
    content: 'Let\'s learn how to design your perfect kitchen in just a few steps.',
    type: 'intro'
  },
  {
    title: 'Draw Walls',
    content: 'Click the "Draw" button in 2D Tools, then click to place wall起点 and endpoints. Press ESC when done.',
    type: 'action',
    highlight: '#draw'
  },
  {
    title: 'Add Cabinets',
    content: 'Click "Add Items" to browse the catalog. Select a cabinet and click in the 3D view to place it.',
    type: 'action',
    highlight: '#showAddItems'
  },
  {
    title: 'Move & Rotate',
    content: 'Select any item to move it. Use the properties panel to rotate or resize. Auto-snap helps align items perfectly!',
    type: 'info'
  },
  {
    title: 'Measure & Export',
    content: 'Use the "Measure" tool to check dimensions. Export your design as PDF when ready to share!',
    type: 'action',
    highlight: '#showMeasure'
  },
  {
    title: 'You\'re Ready!',
    content: 'Start designing! Remember, you can always load a template to get started quickly.',
    type: 'complete'
  }
];

export function showTutorial() {
  let currentStep = 0;

  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div class="tutorial-modal">
      <h2>${TUTORIAL_STEPS[0].title}</h2>
      <div id="tutorial-content"></div>
      <div class="tutorial-progress" id="tutorial-progress"></div>
      <div class="tutorial-actions">
        <button class="tutorial-btn tutorial-btn-secondary" id="tutorial-skip">Skip Tutorial</button>
        <button class="tutorial-btn tutorial-btn-primary" id="tutorial-next">
          ${currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  function renderStep() {
    const step = TUTORIAL_STEPS[currentStep];
    const content = document.getElementById('tutorial-content');
    const progress = document.getElementById('tutorial-progress');
    const nextBtn = document.getElementById('tutorial-next');

    // Render content
    content.innerHTML = `
      <p>${step.content}</p>
      ${step.type === 'action' ? `
        <div class="tutorial-step">
          <div class="tutorial-step-number">${currentStep + 1}</div>
          <div class="tutorial-step-content">
            <h4>Try it now:</h4>
            <p>${step.content}</p>
          </div>
        </div>
      ` : ''}
    `;

    // Render progress dots
    progress.innerHTML = TUTORIAL_STEPS.map((_, i) => 
      `<div class="tutorial-dot ${i === currentStep ? 'active' : ''}"></div>`
    ).join('');

    // Update button text
    nextBtn.textContent = currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next';

    // Highlight element if specified
    if (step.highlight) {
      const el = document.querySelector(step.highlight);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 20px #00d2d2';
        setTimeout(() => {
          el.style.boxShadow = '';
        }, 2000);
      }
    }
  }

  renderStep();

  // Event listeners
  document.getElementById('tutorial-next').addEventListener('click', () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      currentStep++;
      renderStep();
    } else {
      overlay.remove();
      // Mark tutorial as completed
      localStorage.setItem('kitchenlab_tutorial_completed', 'true');
    }
  });

  document.getElementById('tutorial-skip').addEventListener('click', () => {
    overlay.remove();
    localStorage.setItem('kitchenlab_tutorial_completed', 'true');
  });
}

export function shouldShowTutorial() {
  const completed = localStorage.getItem('kitchenlab_tutorial_completed');
  return !completed || completed !== 'true';
}
