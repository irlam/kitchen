import html2canvas from "html2canvas";

var aGlobal = null;
var anItem = null;
var aWall = null;
var aFloor = null;
var gui = null;
var globalPropFolder = null;
var itemPropFolder = null;
var wallPropFolder = null;

var BASE_LAYOUT_JSON =
  '{"floorplan":{"corners":{"f90da5e3-9e0e-eba7-173d-eb0b071e838e":{"x":-212,"y":212},"da026c08-d76a-a944-8e7b-096b752da9ed":{"x":212,"y":212},"4e3d65cb-54c0-0681-28bf-bddcc7bdb571":{"x":212,"y":-212},"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2":{"x":-212,"y":-212}},"walls":[{"corner1":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","corner2":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","frontTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0}},{"corner1":"f90da5e3-9e0e-eba7-173d-eb0b071e838e","corner2":"da026c08-d76a-a944-8e7b-096b752da9ed","frontTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0}},{"corner1":"da026c08-d76a-a944-8e7b-096b752da9ed","corner2":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","frontTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0}},{"corner1":"4e3d65cb-54c0-0681-28bf-bddcc7bdb571","corner2":"71d4f128-ae80-3d58-9bd2-711c6ce6cdf2","frontTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0},"backTexture":{"url":"rooms/textures/walls/wallmap.png","stretch":true,"scale":0}}],"wallTextures":[],"floorTextures":{},"newFloorTextures":{}},"items":[]}';
/*
 * Floorplanner controls
 */

var ViewerFloorplanner = function (KitchenKreation) {
  var canvasWrapper = "#floorplanner";
  // buttons
  var move = "#move";
  var remove = "#delete";
  var draw = "#draw";
  var screenshot2D = "#screenshot-2D";
  var screenshot3D = "#screenshot-3D";

  var activeStlye = "btn-primary disabled";
  this.floorplanner = KitchenKreation.floorplanner;
  var scope = this;

  function init() {
    $(window).resize(scope.handleWindowResize);
    scope.handleWindowResize();

    scope.floorplanner.addEventListener(KKJS.EVENT_MODE_RESET, function (mode) {
      $(draw).removeClass(activeStlye);
      $(remove).removeClass(activeStlye);
      $(move).removeClass(activeStlye);
      $(screenshot2D).removeClass(activeStlye);
      if (mode == KKJS.floorplannerModes.MOVE) {
        $(move).addClass(activeStlye);
      } else if (mode == KKJS.floorplannerModes.DRAW) {
        $(draw).addClass(activeStlye);
      } else if (mode == KKJS.floorplannerModes.DELETE) {
        $(remove).addClass(activeStlye);
      } else if (mode == KKJS.floorplannerModes.SCREENSHOT) {
        $(screenshot2D).addClass(activeStlye);
      }

      if (mode == KKJS.floorplannerModes.DRAW) {
        scope.handleWindowResize();
      }
    });

    $(move).click(function () {
      scope.floorplanner.setMode(KKJS.floorplannerModes.MOVE);
    });

    $(draw).click(function () {
      scope.floorplanner.setMode(KKJS.floorplannerModes.DRAW);
    });

    $(remove).click(function () {
      scope.floorplanner.setMode(KKJS.floorplannerModes.DELETE);
    });

    $(screenshot2D).click(function () {
      html2canvas(document.getElementById("floorplanner-canvas")).then(
        function (canvas) {
          document.body.appendChild(canvas);
          var a = document.createElement("a");
          a.href = canvas.toDataURL("png");
          a.download = "2D-Floorplan.png";
          a.click();
        }
      );
    });

    $(screenshot3D).click(function () {
      html2canvas(document.getElementById("3D-Floorplan")).then(function (
        canvas
      ) {
        document.body.appendChild(canvas);
        var a = document.createElement("a");
        a.href = canvas.toDataURL("png");
        a.download = "3D-Render.png";
        a.click();
      });
    });
  }

  this.updateFloorplanView = function () {
    scope.floorplanner.reset();
  };

  this.handleWindowResize = function () {
    $(canvasWrapper).height(window.innerHeight - $(canvasWrapper).offset().top);
    scope.floorplanner.resizeView();
  };

  init();
};

var mainControls = function (KitchenKreation) {
  var KitchenKreation = KitchenKreation;

  function newDesign() {
    KitchenKreation.model.loadSerialized(BASE_LAYOUT_JSON);
  }

  function init() {
    $("#new3d").click(newDesign);
    $("#new2d").click(newDesign);
  }

  init();
};

var META_KEY = "kitchenKreation.projectMeta.v1";
var PROJECT_LIST_KEY = "kitchenKreation.projectList.v1";
var HISTORY_LIMIT = 25;
var projectHistory = [];
var redoHistory = [];
var historyApplying = false;

function updateAutosaveStatus(text) {
  var status = document.getElementById("autosaveStatus");
  if (status) {
    status.textContent = text;
  }
}

function getProjectMeta() {
  return {
    projectName: $("#projectName").val() || "",
    clientName: $("#clientName").val() || "",
    projectLocation: $("#projectLocation").val() || "",
    designerName: $("#designerName").val() || "",
    projectNotes: $("#projectNotes").val() || "",
  };
}

function setProjectMeta(meta) {
  if (!meta) {
    return;
  }
  $("#projectName").val(meta.projectName || "");
  $("#clientName").val(meta.clientName || "");
  $("#projectLocation").val(meta.projectLocation || "");
  $("#designerName").val(meta.designerName || "");
  $("#projectNotes").val(meta.projectNotes || "");
}

function saveProjectMeta() {
  localStorage.setItem(META_KEY, JSON.stringify(getProjectMeta()));
  updateAutosaveStatus("Saved " + new Date().toLocaleTimeString());
}

function loadProjectMeta() {
  var raw = localStorage.getItem(META_KEY);
  if (!raw) {
    return;
  }
  try {
    setProjectMeta(JSON.parse(raw));
  } catch (error) {
    setProjectMeta(null);
  }
}

function getProjectList() {
  var raw = localStorage.getItem(PROJECT_LIST_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) || {};
  } catch (error) {
    return {};
  }
}

function saveProjectList(list) {
  localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(list));
}

function refreshProjectListUI(selectedName) {
  var list = getProjectList();
  var select = document.getElementById("projectList");
  if (!select) {
    return;
  }
  select.innerHTML = "<option value=\"\">Current (unsaved)</option>";
  Object.keys(list)
    .sort(function (a, b) {
      return a.localeCompare(b);
    })
    .forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  if (selectedName && list[selectedName]) {
    select.value = selectedName;
  }
}

function saveProjectToList(KitchenKreation) {
  var projectName = (getProjectMeta().projectName || "").trim();
  if (!projectName) {
    alert("Add a Project name before saving.");
    return;
  }
  var snapshot = buildSerializedProject(KitchenKreation);
  var list = getProjectList();
  list[projectName] = {
    snapshot: snapshot,
    meta: getProjectMeta(),
    updatedAt: new Date().toISOString(),
  };
  saveProjectList(list);
  localStorage.setItem(STORAGE_KEY, snapshot);
  refreshProjectListUI(projectName);
  updateAutosaveStatus("Saved " + new Date().toLocaleTimeString());
}

function loadProjectFromList(KitchenKreation, name) {
  var list = getProjectList();
  var entry = list[name];
  if (!entry) {
    return;
  }
  KitchenKreation.model.loadSerialized(entry.snapshot);
  setProjectMeta(entry.meta || {});
  localStorage.setItem(STORAGE_KEY, entry.snapshot);
  saveProjectMeta();
  projectHistory = [entry.snapshot];
  redoHistory = [];
  updateHistoryButtons();
  updateAutosaveStatus("Loaded " + new Date().toLocaleTimeString());
}

function deleteProjectFromList(name) {
  var list = getProjectList();
  if (!list[name]) {
    return;
  }
  delete list[name];
  saveProjectList(list);
  refreshProjectListUI("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getItemTypeLabel(itemType) {
  if (itemType === 1) {
    return "Floor";
  }
  if (itemType === 2) {
    return "Wall";
  }
  if (itemType === 3) {
    return "In Wall";
  }
  return "Unknown";
}

function formatDimension(value) {
  return KKJS.Dimensioning.cmToMeasureString(value);
}

function buildItemsTable(KitchenKreation) {
  var items = KitchenKreation.model.scene.getItems();
  if (!items.length) {
    return "<p>No items placed.</p>";
  }

  var grouped = {};
  items.forEach(function (item) {
    var meta = item.getMetaData();
    var name = meta.item_name || "Item";
    var type = getItemTypeLabel(meta.item_type);
    var key = name + "|" + type;
    if (!grouped[key]) {
      grouped[key] = {
        name: name,
        type: type,
        count: 0,
        width: item.getWidth(),
        height: item.getHeight(),
        depth: item.getDepth(),
      };
    }
    grouped[key].count += 1;
  });

  var rows = Object.keys(grouped)
    .map(function (key) {
      var entry = grouped[key];
      return (
        "<tr>" +
        "<td>" +
        escapeHtml(entry.name) +
        "</td>" +
        "<td>" +
        escapeHtml(entry.type) +
        "</td>" +
        "<td>" +
        entry.count +
        "</td>" +
        "<td>" +
        escapeHtml(formatDimension(entry.width)) +
        "</td>" +
        "<td>" +
        escapeHtml(formatDimension(entry.height)) +
        "</td>" +
        "<td>" +
        escapeHtml(formatDimension(entry.depth)) +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    "<table>" +
    "<thead><tr><th>Item</th><th>Type</th><th>Qty</th><th>W</th><th>H</th><th>D</th></tr></thead>" +
    "<tbody>" +
    rows +
    "</tbody></table>"
  );
}

function computeRoomArea(room) {
  var points = room.interiorCorners || [];
  if (points.length < 3) {
    return 0;
  }
  var sum = 0;
  for (var i = 0; i < points.length; i++) {
    var p1 = points[i];
    var p2 = points[(i + 1) % points.length];
    sum += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(sum) / 2;
}

function buildSummaryTable(KitchenKreation) {
  var floorplan = KitchenKreation.model.floorplan;
  var rooms = floorplan.getRooms();
  var walls = floorplan.getWalls();
  var items = KitchenKreation.model.scene.getItems();

  var totalAreaCm2 = rooms.reduce(function (total, room) {
    return total + computeRoomArea(room);
  }, 0);
  var totalWallLengthCm = walls.reduce(function (total, wall) {
    var dx = wall.start.x - wall.end.x;
    var dy = wall.start.y - wall.end.y;
    return total + Math.hypot(dx, dy);
  }, 0);

  var totalAreaSqm = (totalAreaCm2 / 10000).toFixed(2);
  var wallLength = KKJS.Dimensioning.cmToMeasureString(totalWallLengthCm);

  return (
    "<table>" +
    "<tbody>" +
    "<tr><th>Rooms</th><td>" +
    rooms.length +
    "</td><th>Walls</th><td>" +
    walls.length +
    "</td></tr>" +
    "<tr><th>Items</th><td>" +
    items.length +
    "</td><th>Total Wall Length</th><td>" +
    escapeHtml(wallLength) +
    "</td></tr>" +
    "<tr><th>Total Area</th><td colspan='3'>" +
    totalAreaSqm +
    " m²</td></tr>" +
    "</tbody>" +
    "</table>"
  );
}

function buildMetaTable(meta) {
  return (
    "<table>" +
    "<tbody>" +
    "<tr><th>Project</th><td>" +
    escapeHtml(meta.projectName || "") +
    "</td><th>Client</th><td>" +
    escapeHtml(meta.clientName || "") +
    "</td></tr>" +
    "<tr><th>Location</th><td>" +
    escapeHtml(meta.projectLocation || "") +
    "</td><th>Designer</th><td>" +
    escapeHtml(meta.designerName || "") +
    "</td></tr>" +
    "</tbody>" +
    "</table>"
  );
}

function openPrintWindow(payload) {
  var printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print the plan.");
    return;
  }

  var html =
    "<!DOCTYPE html>" +
    "<html><head><meta charset='utf-8'>" +
    "<link href='https://fonts.googleapis.com/css?family=Aldrich' rel='stylesheet'>" +
    "<title>Kitchen Kreation Plan</title>" +
    "<style>" +
    "@page { size: A4; margin: 12mm; }" +
    "body { font-family: 'Aldrich', 'Trebuchet MS', sans-serif; color: #111; }" +
    "h1 { margin: 0 0 6px; font-size: 22px; }" +
    "h2 { margin: 18px 0 8px; font-size: 16px; }" +
    ".meta { font-size: 12px; color: #555; }" +
    ".image { width: 100%; border: 1px solid #ddd; border-radius: 6px; }" +
    "table { width: 100%; border-collapse: collapse; font-size: 12px; }" +
    "th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }" +
    ".notes { min-height: 80px; border: 1px dashed #bbb; padding: 8px; }" +
    "</style></head><body>" +
    "<h1>Kitchen Kreation Plan</h1>" +
    "<div class='meta'>" +
    escapeHtml(payload.timestamp) +
    " | Units: " +
    escapeHtml(payload.units) +
    "</div>" +
    "<h2>Project Details</h2>" +
    payload.metaTable +
    "<h2>Summary</h2>" +
    payload.summaryTable +
    "<h2>2D Floorplan</h2>" +
    "<img class='image' src='" +
    payload.floorplanImage +
    "' alt='2D Floorplan'>" +
    "<h2>3D Render</h2>" +
    "<img class='image' src='" +
    payload.renderImage +
    "' alt='3D Render'>" +
    "<h2>Items</h2>" +
    payload.itemsTable +
    "<h2>Notes</h2>" +
    "<div class='notes'>" +
    escapeHtml(payload.projectNotes || "") +
    "</div>" +
    "</body></html>";

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = function () {
    printWindow.focus();
    if (payload.autoPrint) {
      printWindow.print();
    }
  };
}

function captureElement(elementId) {
  return html2canvas(document.getElementById(elementId), {
    backgroundColor: "#ffffff",
  }).then(function (canvas) {
    return canvas.toDataURL("image/png");
  });
}

function exportPrintablePlan(KitchenKreation, options) {
  options = options || {};
  var wasDesignActive = $("#showDesign").hasClass("active");
  var wasPlanActive = $("#showFloorPlan").hasClass("active");

  function show2D() {
    if (!wasPlanActive) {
      $("#showFloorPlan").trigger("click");
    }
    return new Promise(function (resolve) {
      setTimeout(resolve, 300);
    });
  }

  function show3D() {
    if (!wasDesignActive) {
      $("#showDesign").trigger("click");
    }
    return new Promise(function (resolve) {
      setTimeout(resolve, 300);
    });
  }

  show2D()
    .then(function () {
      return captureElement("floorplanner-canvas");
    })
    .then(function (floorplanImage) {
      return show3D().then(function () {
        return captureElement("3D-Floorplan").then(function (renderImage) {
          return { floorplanImage: floorplanImage, renderImage: renderImage };
        });
      });
    })
    .then(function (images) {
      if (wasPlanActive) {
        $("#showFloorPlan").trigger("click");
      } else if (wasDesignActive) {
        $("#showDesign").trigger("click");
      }

      var projectMeta = getProjectMeta();
      openPrintWindow({
        floorplanImage: images.floorplanImage,
        renderImage: images.renderImage,
        itemsTable: buildItemsTable(KitchenKreation),
        summaryTable: buildSummaryTable(KitchenKreation),
        metaTable: buildMetaTable(projectMeta),
        timestamp: new Date().toLocaleString(),
        units: KKJS.Configuration.getStringValue(KKJS.configDimUnit) || "m",
        projectNotes: projectMeta.projectNotes,
        autoPrint: options.autoPrint !== false,
      });
    });
}

var GlobalProperties = function () {
  this.name = "Global";
  //a - feet and inches, b = inches, c - cms, d - millimeters, e - meters
  this.units = {
    a: false,
    b: false,
    c: false,
    d: false,
    e: true,
  };
  this.unitslabel = {
    a: KKJS.dimFeetAndInch,
    b: KKJS.dimInch,
    c: KKJS.dimCentiMeter,
    d: KKJS.dimMilliMeter,
    e: KKJS.dimMeter,
  };
  this.guiControllers = null;

  this.setUnit = function (unit) {
    for (let param in this.units) {
      this.units[param] = false;
    }
    this.units[unit] = true;

    KKJS.Configuration.setValue(KKJS.configDimUnit, this.unitslabel[unit]);

    console.log(
      this.units,
      this.unitslabel[unit],
      KKJS.Configuration.getStringValue(KKJS.configDimUnit)
    );

    for (var i in this.guiControllers) {
      // Iterate over gui controllers to update the values
      this.guiControllers[i].updateDisplay();
    }
  };

  this.setGUIControllers = function (guiControls) {
    this.guiControllers = guiControls;
  };
};
var ItemProperties = function (gui) {
  this.name = "an item";
  this.width = 1;
  this.height = 1;
  this.depth = 1;
  this.fixed = false;
  this.currentItem = null;
  this.guiControllers = null;
  this.gui = gui;
  this.materialsfolder = null;
  this.materials = {};
  this.totalmaterials = -1;
  this.proportionalsize = false;
  this.changingdimension = "w";

  this.setGUIControllers = function (guiControls) {
    this.guiControllers = guiControls;
  };

  this.setItem = function (item) {
    this.currentItem = item;
    if (this.materialsfolder) {
      this.gui.removeFolder(this.materialsfolder.name);
    }
    if (item) {
      var scope = this;
      var material = item.material;
      this.name = item.metadata.itemName;
      this.width = KKJS.Dimensioning.cmToMeasureInt(item.getWidth());
      this.height = KKJS.Dimensioning.cmToMeasureInt(item.getHeight());
      this.depth = KKJS.Dimensioning.cmToMeasureInt(item.getDepth());
      this.fixed = item.fixed;
      this.proportionalsize = item.getProportionalResize();

      for (var i in this.guiControllers) {
        // Iterate over gui controllers to update the values
        this.guiControllers[i].updateDisplay();
      }

      this.materialsfolder = this.gui.addFolder("Materials");
      this.materials = {};
      if (material.length) {
        this.totalmaterials = material.length;
        for (var i = 0; i < material.length; i++) {
          this.materials["mat_" + i] = "#" + material[i].color.getHexString();
          var matname = material[i].name
            ? material[i].name
            : "Material " + (i + 1);
          var ccontrol = this.materialsfolder
            .addColor(this.materials, "mat_" + i)
            .name(matname)
            .onChange(() => {
              scope.dimensionsChanged();
            });
        }
        return;
      }
      this.totalmaterials = 1;
      var matname = material.name ? material.name : "Material 1";
      this.materials["mat_0"] = "#" + material.color.getHexString();
      var ccontrol = this.materialsfolder
        .addColor(this.materials, "mat_0")
        .name(matname)
        .onChange(() => {
          scope.dimensionsChanged();
        });
      return;
    }
    this.name = "None";
    return;
  };

  this.dimensionsChanged = function () {
    if (this.currentItem) {
      var item = this.currentItem;

      var ow = KKJS.Dimensioning.cmToMeasureInt(item.getWidth());
      var oh = KKJS.Dimensioning.cmToMeasureInt(item.getHeight());
      var od = KKJS.Dimensioning.cmToMeasureInt(item.getDepth());

      var h = KKJS.Dimensioning.cmFromMeasureInt(this.height);
      var w = KKJS.Dimensioning.cmFromMeasureInt(this.width);
      var d = KKJS.Dimensioning.cmFromMeasureInt(this.depth);

      this.currentItem.resize(h, w, d);

      if (w != ow) {
        this.height = KKJS.Dimensioning.cmToMeasureInt(item.getHeight());
        this.depth = KKJS.Dimensioning.cmToMeasureInt(item.getDepth());
      }

      if (h != oh) {
        this.width = KKJS.Dimensioning.cmToMeasureInt(item.getWidth());
        this.depth = KKJS.Dimensioning.cmToMeasureInt(item.getDepth());
      }

      if (d != od) {
        this.width = KKJS.Dimensioning.cmToMeasureInt(item.getWidth());
        this.height = KKJS.Dimensioning.cmToMeasureInt(item.getHeight());
      }
      for (var i = 0; i < this.totalmaterials; i++) {
        this.currentItem.setMaterialColor(this.materials["mat_" + i], i);
      }

      this.guiControllers.forEach((control) => {
        control.updateDisplay();
      }); // Iterate over gui controllers to update the values
    }
  };

  this.proportionFlagChange = function () {
    if (this.currentItem) {
      this.currentItem.setProportionalResize(this.proportionalsize);
    }
  };

  this.lockFlagChanged = function () {
    if (this.currentItem) {
      this.currentItem.setFixed(this.fixed);
    }
  };

  this.deleteItem = function () {
    if (this.currentItem) {
      this.currentItem.remove();
      this.setItem(null);
    }
  };
};
var WallProperties = function () {
  this.textures = [
    //walls
    ["rooms/textures/walls/wallmap.png", true, 1], //0 Grey
    ["rooms/textures/walls/light_brick.jpg", false, 150], //1 bricks
    ["rooms/textures/walls/beige-mosaic.jpg", false, 150], //2 Beige mosaic
    ["rooms/textures/walls/purple-mosaic.jpg", false, 250], //3 Purple mosaic
    ["rooms/textures/walls/vintage-wall.jpg", false, 150], //4 vintage wall
    ["rooms/textures/walls/wall-greytiles.jpg", false, 150], //5 grey tiles
    ["rooms/textures/walls/wall-reflective-blue.jpg", false, 50], //6 reflective wall
    ["rooms/textures/walls/wall-purple.jpg", false, 150], //7 purple
    ["rooms/textures/walls/wall-reflective-lightblue.jpg", false, 150], //8 reflective lightblue
    ["rooms/textures/universal/wall-reflective-purple.jpg", false, 150], // 9 reflective purple

    //universal - both walls and floors
    ["rooms/textures/universal/candy-apple.jpg", false, 50], //10 candy apple wall
    ["rooms/textures/universal/candy-apple.jpg", false, 50], //11 candy apple floor
    ["rooms/textures/universal/dark-blue.jpg", false, 50], //12 dark blue floor
    ["rooms/textures/universal/dark-blue.jpg", false, 50], //13 dark blue wall

    //floor
    ["rooms/textures/floor/grey-porcelain.jpeg", false, 150], //14 grey porcelain tiles
    ["rooms/textures/floor/white-porcelain.jpeg", false, 150], //15 white porcelain
    ["rooms/textures/floor/black-white-seamlessmarble.jpg", false, 150], //16 black white seamless tiles
    ["rooms/textures/floor/brown-cream-seamless.jpg", false, 150], //17 brown cream seamless tiles
    ["rooms/textures/floor/charcoal-concrete.jpg", false, 150], // 18 concrete
    ["rooms/textures/floor/dark-oak.jpg", false, 250], // 19 dark oak
    ["rooms/textures/floor/Elmina.jpg", false, 150], //20 elmina
    ["rooms/textures/floor/grey-carpet.jpg", false, 150], //21 grey carpet
    ["rooms/textures/floor/Nero-Riven-Slate.jpg", false, 250], //22 Nero Riven Slate
    [
      "rooms/textures/floor/herringbone-parquet-texture-seamless.jpg",
      false,
      150,
    ], //23 herringbone
    ["rooms/textures/floor/oak-square-parquet.jpg", false, 250], //24 oak square parquet
    ["rooms/textures/floor/white-laminate-parquet-floor.jpg", false, 250], //25 white laminate parquet
    ["rooms/textures/floor/wood.jpg", false, 250], //26 oak wood
    ["rooms/textures/floor/marbletiles.jpg", false, 300], //27 marble
    ["rooms/textures/floor/light_fine_wood.jpg", false, 300], //28 fine wood
    ["rooms/textures/floor/hardwood.png", false, 300], //29 hardwood
    ["rooms/textures/floor/checkered-tiles-square.jpg", false, 150], //30 checkered tiles
  ];

  this.floormaterialname = 0;
  this.wallmaterialname = 0;

  this.forAllWalls = false;

  this.currentWall = null;
  this.currentFloor = null;

  this.wchanged = function () {
    if (this.currentWall) {
      this.currentWall.setTexture(
        this.textures[this.wallmaterialname][0],
        this.textures[this.wallmaterialname][1],
        this.textures[this.wallmaterialname][2]
      );
    }
    if (this.currentFloor && this.forAllWalls) {
      this.currentFloor.setRoomWallsTexture(
        this.textures[this.wallmaterialname][0],
        this.textures[this.wallmaterialname][1],
        this.textures[this.wallmaterialname][2]
      );
    }
  };

  this.fchanged = function () {
    if (this.currentFloor) {
      this.currentFloor.setTexture(
        this.textures[this.floormaterialname][0],
        this.textures[this.floormaterialname][1],
        this.textures[this.floormaterialname][2]
      );
    }
  };

  this.setWall = function (wall) {
    this.currentWall = wall;
  };

  this.setFloor = function (floor) {
    this.currentFloor = floor;
  };
};

// FloorProperties was missing; reuse WallProperties behavior for floors.
var FloorProperties = WallProperties;

function addKitchenKreationListeners(KitchenKreation) {
  var three = KitchenKreation.three;

  function wallClicked(wall) {
    aWall.setWall(wall);
    aWall.setFloor(null);
    itemPropFolder.close();
    wallPropFolder.open();
  }

  function floorClicked(floor) {
    aFloor.setFloor(floor);
    aFloor.setWall(null);
    itemPropFolder.close();
    wallPropFolder.open();
  }

  function itemSelected(item) {
    anItem.setItem(item);
    itemPropFolder.open();
    wallPropFolder.close();
  }

  function itemUnselected() {
    anItem.setItem(undefined);
    itemPropFolder.close();
  }
  three.addEventListener(KKJS.EVENT_ITEM_SELECTED, function (o) {
    itemSelected(o.item);
  });
  three.addEventListener(KKJS.EVENT_ITEM_UNSELECTED, function (o) {
    itemUnselected();
  });
  three.addEventListener(KKJS.EVENT_WALL_CLICKED, (o) => {
    wallClicked(o.item);
  });
  three.addEventListener(KKJS.EVENT_FLOOR_CLICKED, (o) => {
    floorClicked(o.item);
  });
  three.addEventListener(KKJS.EVENT_FPS_EXIT, () => {
    $("#showDesign").trigger("click");
  });
}

var STORAGE_KEY = "kitchenKreation.project.v1";

function buildSerializedProject(KitchenKreation) {
  var floorplan = KitchenKreation.model.floorplan;
  var corners = {};
  floorplan.getCorners().forEach(function (corner) {
    corners[corner.id] = { x: corner.x, y: corner.y };
  });
  var walls = floorplan.getWalls().map(function (wall) {
    return {
      corner1: wall.start.id,
      corner2: wall.end.id,
      frontTexture: wall.frontTexture,
      backTexture: wall.backTexture,
    };
  });
  var items = KitchenKreation.model.scene.getItems().map(function (item) {
    var metadata = item.getMetaData();
    metadata.resizable = item.resizable;
    return metadata;
  });

  var floorplanData = {
    corners: corners,
    walls: walls,
    wallTextures: [],
    floorTextures: {},
    newFloorTextures: floorplan.floorTextures || {},
  };
  if (floorplan.frame) {
    floorplanData.frame = {
      x: floorplan.frame.x,
      y: floorplan.frame.y,
      transparency: floorplan.frame.transparency,
      anchorX: floorplan.frame.anchorX,
      anchorY: floorplan.frame.anchorY,
      width: floorplan.frame.width,
      height: floorplan.frame.height,
      url: floorplan.frame.url,
    };
  }

  return JSON.stringify({ floorplan: floorplanData, items: items });
}

function loadSavedProject(KitchenKreation) {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return false;
  }
  KitchenKreation.model.loadSerialized(saved);
  return true;
}

function clearCurrentProject(KitchenKreation) {
  KitchenKreation.model.loadSerialized(BASE_LAYOUT_JSON);
  setProjectMeta({
    projectName: "",
    clientName: "",
    projectLocation: "",
    designerName: "",
    projectNotes: "",
  });
  saveProjectMeta();
  var snapshot = buildSerializedProject(KitchenKreation);
  localStorage.setItem(STORAGE_KEY, snapshot);
  projectHistory = [snapshot];
  redoHistory = [];
  updateHistoryButtons();
  refreshProjectListUI("");
  updateAutosaveStatus("Cleared " + new Date().toLocaleTimeString());
}

function setupAutoSave(KitchenKreation) {
  var saveTimer = null;

  function scheduleSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(function () {
      var snapshot = buildSerializedProject(KitchenKreation);
      localStorage.setItem(STORAGE_KEY, snapshot);
      pushHistory(snapshot);
      updateAutosaveStatus("Saved " + new Date().toLocaleTimeString());
    }, 300);
  }

  KitchenKreation.model.floorplan.addEventListener(
    KKJS.EVENT_UPDATED,
    scheduleSave
  );
  KitchenKreation.model.scene.addEventListener(
    KKJS.EVENT_ITEM_LOADED,
    scheduleSave
  );
  KitchenKreation.model.scene.addEventListener(
    KKJS.EVENT_ITEM_DELETED,
    scheduleSave
  );
  KitchenKreation.three.addEventListener(
    KKJS.EVENT_ITEM_UNSELECTED,
    scheduleSave
  );
}

function pushHistory(snapshot) {
  if (historyApplying) {
    return;
  }
  if (!snapshot) {
    return;
  }
  if (projectHistory.length && projectHistory[projectHistory.length - 1] === snapshot) {
    return;
  }
  projectHistory.push(snapshot);
  if (projectHistory.length > HISTORY_LIMIT) {
    projectHistory.shift();
  }
  redoHistory = [];
  updateHistoryButtons();
}

function applyHistorySnapshot(KitchenKreation, snapshot) {
  if (!snapshot) {
    return;
  }
  historyApplying = true;
  KitchenKreation.model.loadSerialized(snapshot);
  historyApplying = false;
  updateAutosaveStatus("Restored " + new Date().toLocaleTimeString());
}

function undoHistory(KitchenKreation) {
  if (projectHistory.length < 2) {
    return;
  }
  var current = projectHistory.pop();
  redoHistory.push(current);
  applyHistorySnapshot(KitchenKreation, projectHistory[projectHistory.length - 1]);
  updateHistoryButtons();
}

function redoHistoryAction(KitchenKreation) {
  if (!redoHistory.length) {
    return;
  }
  var next = redoHistory.pop();
  projectHistory.push(next);
  applyHistorySnapshot(KitchenKreation, next);
  updateHistoryButtons();
}

function updateHistoryButtons() {
  var undoButton = document.getElementById("undoAction");
  var redoButton = document.getElementById("redoAction");
  if (undoButton) {
    undoButton.disabled = projectHistory.length < 2;
  }
  if (redoButton) {
    redoButton.disabled = redoHistory.length === 0;
  }
}

function getGlobalPropertiesFolder(gui, global) {
  var f = gui.addFolder("Unit Of Measurement");
  var ficontrol = f
    .add(global.units, "a")
    .name("Feets'' Inches'")
    .onChange(function () {
      global.setUnit("a");
    });
  var icontrol = f
    .add(global.units, "b")
    .name("Inches'")
    .onChange(function () {
      global.setUnit("b");
    });
  var ccontrol = f
    .add(global.units, "c")
    .name("cm")
    .onChange(function () {
      global.setUnit("c");
    });
  var mmcontrol = f
    .add(global.units, "d")
    .name("mm")
    .onChange(function () {
      global.setUnit("d");
    });
  var mcontrol = f
    .add(global.units, "e")
    .name("m")
    .onChange(function () {
      global.setUnit("e");
    });
  global.setGUIControllers([
    ficontrol,
    icontrol,
    ccontrol,
    mmcontrol,
    mcontrol,
  ]);

  return f;
}

function getItemPropertiesFolder(gui, anItem) {
  var f = gui.addFolder("Current Item");
  var inamecontrol = f.add(anItem, "name");

  var wcontrol = f.add(anItem, "width", 0.2, 1.5).step(0.1);
  var hcontrol = f.add(anItem, "height", 0.2, 1.5).step(0.1);
  var dcontrol = f.add(anItem, "depth", 0.2, 1.5).step(0.1);

  var pcontrol = f.add(anItem, "proportionalsize").name("Maintain Size Ratio");
  var lockcontrol = f.add(anItem, "fixed").name("Locked in place");
  var deleteItemControl = f.add(anItem, "deleteItem").name("Delete Item");

  function changed() {
    anItem.dimensionsChanged();
  }

  function lockChanged() {
    anItem.lockFlagChanged();
  }

  function proportionFlagChanged() {
    anItem.proportionFlagChange();
  }

  wcontrol.onChange(changed);
  hcontrol.onChange(changed);
  dcontrol.onChange(changed);
  pcontrol.onChange(proportionFlagChanged);
  lockcontrol.onChange(lockChanged);

  anItem.setGUIControllers([
    inamecontrol,
    wcontrol,
    hcontrol,
    dcontrol,
    pcontrol,
    lockcontrol,
    deleteItemControl,
  ]);

  return f;
}

function getWallAndFloorPropertiesFolder(gui, aWall, aFloor) {
  var f = gui.addFolder("Wall and Floor");
  var wcontrol = f
    .add(aWall, "wallmaterialname", {
      Grey: 0,
      Bricks: 1,
      Beige_mosaic: 2,
      Purple_mosaic: 3,
      Vintage_wall: 4,
      Grey_tiles: 5,
      Blue_reflective_Wall: 6,
      Purple_tiles: 7,
      Lightblue_reflective_Wall: 8,
      candy_apple: 10,
      dark_blue: 13,
    })
    .name("Wall");
  var fcontrol = f
    .add(aFloor, "floormaterialname", {
      "Grey Porcelain Tiles": 14,
      "White Porcelain Tiles": 15,
      "Black & White Seamless Tiles": 16,
      "Brown & Cream Seamless Tiles": 17,
      "Charcoal Concrete": 18,
      "Dark Oak": 19,
      Elmina: 20,
      "Grey Carpet": 21,
      "Riven Slate": 22,
      Herringbone: 23,
      "Oak Square Parquet": 24,
      "White Laminate Parquet": 25,
      "Oak Wood": 26,
      Marble: 27,
      "Fine Wood": 28,
      "Hard Wood": 29,
      "Checkered Tiles": 30,
      "Candy Apple": 11,
      "Dark Blue": 12,
    })
    .name("Floor");

  function wchanged() {
    aWall.wchanged();
  }

  function fchanged() {
    aFloor.fchanged();
  }

  wcontrol.onChange(wchanged);
  fcontrol.onChange(fchanged);
  return f;
}

function datGUI(three, floorplanner) {
  gui = new dat.GUI();
  aGlobal = new GlobalProperties();
  aWall = new WallProperties();
  aFloor = new FloorProperties();
  anItem = new ItemProperties(gui);

  globalPropFolder = getGlobalPropertiesFolder(gui, aGlobal);
  wallPropFolder = getWallAndFloorPropertiesFolder(gui, aWall, aFloor);
  itemPropFolder = getItemPropertiesFolder(gui, anItem);
}

$(document).ready(function () {
  dat.GUI.prototype.removeFolder = function (name) {
    var folder = this.__folders[name];
    if (!folder) {
      return;
    }
    folder.close();
    this.__ul.removeChild(folder.domElement.parentNode);
    delete this.__folders[name];
    this.onResize();
  };
  // main setup
  var opts = {
    floorplannerElement: "floorplanner-canvas",
    threeElement: "#3D-Floorplan",
    threeCanvasElement: "three-canvas",
    textureDir: "models/textures/",
    widget: false,
  };
  var KitchenKreation = new KKJS.KitchenKreationJS(opts);
  var viewerFloorplanner = new ViewerFloorplanner(KitchenKreation);
  mainControls(KitchenKreation);

  loadProjectMeta();
  updateAutosaveStatus("Auto-save: ready");
  refreshProjectListUI((getProjectMeta().projectName || "").trim());

  if (!loadSavedProject(KitchenKreation)) {
    KitchenKreation.model.loadSerialized(BASE_LAYOUT_JSON);
  }

  pushHistory(buildSerializedProject(KitchenKreation));
  updateHistoryButtons();

  addKitchenKreationListeners(KitchenKreation);
  setupAutoSave(KitchenKreation);
  datGUI(KitchenKreation.three, KitchenKreation.floorplanner);

  $("#showAddItems").hide();
  $("#viewcontrols").hide();
  $(".card").flip({
    trigger: "manual",
    axis: "x",
  });
  $("#showFloorPlan").click(function () {
    $(".card").flip(false);
    $(this).addClass("active");
    $("#showDesign").removeClass("active");
    $("#showAddItems").hide();
    $("#viewcontrols").hide();
    KitchenKreation.three.pauseTheRendering(true);
    KitchenKreation.three.getController().setSelectedObject(null);
  });

  $("#showDesign").click(function () {
    KitchenKreation.model.floorplan.update();
    $(".card").flip(true);
    $(this).addClass("active");
    $("#showFloorPlan").removeClass("active");
    $("#showAddItems").show();
    $("#viewcontrols").show();

    KitchenKreation.three.pauseTheRendering(false);
  });

  $("#add-items")
    .find(".add-item")
    .mousedown(function (e) {
      var modelUrl = $(this).attr("model-url");
      var itemType = parseInt($(this).attr("model-type"));
      var itemFormat = $(this).attr("model-format");
      var metadata = {
        itemName: $(this).attr("model-name"),
        resizable: true,
        modelUrl: modelUrl,
        itemType: itemType,
        format: itemFormat,
      };

      if ([1, 2, 3].indexOf(metadata.itemType) != -1 && aWall.currentWall) {
        var placeAt = aWall.currentWall.center.clone();
        KitchenKreation.model.scene.addItem(
          itemType,
          modelUrl,
          metadata,
          null,
          null,
          null,
          false,
          {
            position: placeAt,
            edge: aWall.currentWall,
          }
        );
      } else {
        KitchenKreation.model.scene.addItem(itemType, modelUrl, metadata);
      }
    });

  $("#printPlan").click(function () {
    exportPrintablePlan(KitchenKreation, { autoPrint: true });
  });

  $("#savePdf").click(function () {
    exportPrintablePlan(KitchenKreation, { autoPrint: true });
  });

  $("#undoAction").click(function () {
    undoHistory(KitchenKreation);
  });

  $("#redoAction").click(function () {
    redoHistoryAction(KitchenKreation);
  });

  $("#saveProject").click(function () {
    saveProjectToList(KitchenKreation);
  });

  $("#deleteProject").click(function () {
    var name = $("#projectList").val();
    if (!name) {
      return;
    }
    if (confirm("Delete saved project '" + name + "'?")) {
      deleteProjectFromList(name);
    }
  });

  $("#clearProject").click(function () {
    if (confirm("Clear the current project layout and notes?")) {
      clearCurrentProject(KitchenKreation);
    }
  });

  $("#projectList").on("change", function () {
    var name = $(this).val();
    if (!name) {
      return;
    }
    loadProjectFromList(KitchenKreation, name);
  });

  var metaTimer = null;
  $(
    "#projectName, #clientName, #projectLocation, #designerName, #projectNotes"
  ).on("input", function () {
    if (metaTimer) {
      clearTimeout(metaTimer);
    }
    metaTimer = setTimeout(function () {
      saveProjectMeta();
    }, 300);
  });
});
